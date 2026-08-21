from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.core.deps import DbSession
from app.models import Category, Product
from app.schemas.catalog import CategoryOut, CategoryWithCount

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryWithCount])
def list_categories(db: DbSession):
    rows = db.execute(
        select(Category, func.count(Product.id))
        .outerjoin(Product, (Product.category_id == Category.id) & Product.is_active.is_(True))
        .group_by(Category.id)
        .order_by(Category.sort_order, Category.name)
    ).all()
    return [
        CategoryWithCount(**CategoryOut.model_validate(cat).model_dump(), product_count=count)
        for cat, count in rows
    ]


@router.get("/{slug}", response_model=CategoryWithCount)
def get_category(slug: str, db: DbSession):
    row = db.execute(
        select(Category, func.count(Product.id))
        .outerjoin(Product, (Product.category_id == Category.id) & Product.is_active.is_(True))
        .where(Category.slug == slug)
        .group_by(Category.id)
    ).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No such category."
        )
    cat, count = row
    return CategoryWithCount(
        **CategoryOut.model_validate(cat).model_dump(), product_count=count
    )
