"""Catalog browsing: listing, filtering, sorting, search and product detail."""
import math
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import joinedload

from app.core.deps import DbSession
from app.models import Category, Product
from app.schemas.catalog import ProductDetail, ProductOut, ProductPage

router = APIRouter(prefix="/products", tags=["products"])

SortKey = Literal["featured", "newest", "price_asc", "price_desc", "rating", "name"]

SORT_CLAUSES = {
    "featured": (Product.is_featured.desc(), Product.rating_avg.desc(), Product.id.asc()),
    "newest": (Product.created_at.desc(), Product.id.desc()),
    "price_asc": (Product.price.asc(),),
    "price_desc": (Product.price.desc(),),
    "rating": (Product.rating_avg.desc(), Product.rating_count.desc()),
    "name": (Product.name.asc(),),
}


@router.get("", response_model=ProductPage)
def list_products(
    db: DbSession,
    q: str | None = Query(default=None, description="Free-text search"),
    category: str | None = Query(default=None, description="Category slug"),
    spice: int | None = Query(default=None, ge=0, le=3),
    veg: bool | None = None,
    featured: bool | None = None,
    in_stock: bool | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    sort: SortKey = "featured",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=48),
):
    stmt = (
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.is_active.is_(True))
    )

    if q:
        needle = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(needle),
                Product.short_description.ilike(needle),
                Product.description.ilike(needle),
                Product.ingredients.ilike(needle),
            )
        )
    if category:
        stmt = stmt.join(Category).where(Category.slug == category)
    if spice is not None:
        stmt = stmt.where(Product.spice_level == spice)
    if veg is not None:
        stmt = stmt.where(Product.is_veg.is_(veg))
    if featured is not None:
        stmt = stmt.where(Product.is_featured.is_(featured))
    if in_stock:
        stmt = stmt.where(Product.stock_qty > 0)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.order_by(*SORT_CLAUSES[sort]).offset((page - 1) * page_size).limit(page_size)
    ).all()

    return ProductPage(
        items=[ProductOut.model_validate(p) for p in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/suggest", response_model=list[ProductOut])
def suggest(db: DbSession, q: str = Query(min_length=1), limit: int = Query(default=6, le=12)):
    """Type-ahead results for the search bar."""
    needle = f"%{q.strip()}%"
    rows = db.scalars(
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.is_active.is_(True))
        .where(or_(Product.name.ilike(needle), Product.short_description.ilike(needle)))
        .order_by(Product.is_featured.desc(), Product.rating_avg.desc())
        .limit(limit)
    ).all()
    return [ProductOut.model_validate(p) for p in rows]


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: DbSession):
    product = db.scalar(
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.slug == slug, Product.is_active.is_(True))
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="We don't stock that one."
        )
    return ProductDetail.model_validate(product)


@router.get("/{slug}/related", response_model=list[ProductOut])
def related_products(slug: str, db: DbSession, limit: int = Query(default=4, le=12)):
    product = db.scalar(select(Product).where(Product.slug == slug))
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="We don't stock that one."
        )
    rows = db.scalars(
        select(Product)
        .options(joinedload(Product.category))
        .where(
            Product.is_active.is_(True),
            Product.id != product.id,
            Product.category_id == product.category_id,
        )
        .order_by(Product.rating_avg.desc())
        .limit(limit)
    ).all()

    if len(rows) < limit:  # top up from the wider catalogue
        seen = {product.id, *[r.id for r in rows]}
        rows = list(rows) + list(
            db.scalars(
                select(Product)
                .options(joinedload(Product.category))
                .where(Product.is_active.is_(True), Product.id.notin_(seen))
                .order_by(Product.is_featured.desc(), Product.rating_avg.desc())
                .limit(limit - len(rows))
            ).all()
        )
    return [ProductOut.model_validate(p) for p in rows]
