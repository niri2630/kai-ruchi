"""Product reviews. Anyone can read; only signed-in shoppers can write."""
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.core.deps import CurrentUser, DbSession
from app.models import Order, OrderItem, Product, Review
from app.schemas.review import ReviewCreate, ReviewOut, ReviewSummary

router = APIRouter(prefix="/reviews", tags=["reviews"])


def _out(review: Review) -> ReviewOut:
    return ReviewOut(
        id=review.id,
        rating=review.rating,
        title=review.title,
        body=review.body,
        is_verified_purchase=review.is_verified_purchase,
        created_at=review.created_at,
        author_name=review.user.full_name if review.user else "A Kai Ruchi shopper",
        product_slug=review.product.slug if review.product else None,
        product_name=review.product.name if review.product else None,
    )


def _recalculate(db, product: Product) -> None:
    avg, count = db.execute(
        select(func.coalesce(func.avg(Review.rating), 0), func.count(Review.id)).where(
            Review.product_id == product.id
        )
    ).one()
    product.rating_avg = round(float(avg), 2)
    product.rating_count = count


def _get_product(db, slug: str) -> Product:
    product = db.scalar(select(Product).where(Product.slug == slug))
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="We don't stock that one."
        )
    return product


@router.get("/recent", response_model=list[ReviewOut])
def recent_reviews(db: DbSession, limit: int = Query(default=8, le=24), min_rating: int = 4):
    rows = db.scalars(
        select(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .where(Review.rating >= min_rating)
        .order_by(Review.created_at.desc())
        .limit(limit)
    ).all()
    return [_out(r) for r in rows]


@router.get("/product/{slug}", response_model=list[ReviewOut])
def product_reviews(
    slug: str,
    db: DbSession,
    sort: str = Query(default="newest", pattern="^(newest|highest|lowest)$"),
    limit: int = Query(default=20, le=50),
):
    product = _get_product(db, slug)
    order_by = {
        "newest": Review.created_at.desc(),
        "highest": Review.rating.desc(),
        "lowest": Review.rating.asc(),
    }[sort]
    rows = db.scalars(
        select(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .where(Review.product_id == product.id)
        .order_by(order_by)
        .limit(limit)
    ).all()
    return [_out(r) for r in rows]


@router.get("/product/{slug}/summary", response_model=ReviewSummary)
def review_summary(slug: str, db: DbSession):
    product = _get_product(db, slug)
    rows = db.execute(
        select(Review.rating, func.count(Review.id))
        .where(Review.product_id == product.id)
        .group_by(Review.rating)
    ).all()
    breakdown = {star: 0 for star in range(1, 6)}
    total = 0
    weighted = 0
    for rating, count in rows:
        breakdown[rating] = count
        total += count
        weighted += rating * count
    return ReviewSummary(
        average=round(weighted / total, 2) if total else 0.0,
        count=total,
        breakdown=breakdown,
    )


@router.post("/product/{slug}", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def write_review(slug: str, payload: ReviewCreate, db: DbSession, user: CurrentUser):
    product = _get_product(db, slug)

    if db.scalar(
        select(Review).where(Review.product_id == product.id, Review.user_id == user.id)
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You've already reviewed this one.",
        )

    bought = db.scalar(
        select(OrderItem.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.user_id == user.id, OrderItem.product_id == product.id)
        .limit(1)
    )

    review = Review(
        product_id=product.id,
        user_id=user.id,
        rating=payload.rating,
        title=payload.title,
        body=payload.body,
        is_verified_purchase=bought is not None,
    )
    db.add(review)
    db.flush()
    _recalculate(db, product)
    db.commit()
    db.refresh(review)
    return _out(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, db: DbSession, user: CurrentUser):
    review = db.get(Review, review_id)
    if review is None:
        return
    if review.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="That isn't your review."
        )
    product = review.product
    db.delete(review)
    db.flush()
    if product:
        _recalculate(db, product)
    db.commit()
