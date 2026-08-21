from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    tagline: Mapped[str | None] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text)
    # Design token key the frontend uses to tint this category's surfaces.
    accent: Mapped[str] = mapped_column(String(24), default="turmeric", nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(400))
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"), index=True, nullable=False
    )

    short_description: Mapped[str] = mapped_column(String(280), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    ingredients: Mapped[str | None] = mapped_column(Text)
    shelf_life: Mapped[str | None] = mapped_column(String(80))

    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    unit_label: Mapped[str] = mapped_column(String(60), default="250 g", nullable=False)
    sku: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)

    stock_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # 0 = no heat, 3 = "keep the curd rice ready"
    spice_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    image_url: Mapped[str | None] = mapped_column(String(400))
    gallery: Mapped[list | None] = mapped_column(JSONB)
    pairs_with: Mapped[str | None] = mapped_column(String(200))

    rating_avg: Mapped[Decimal] = mapped_column(
        Numeric(3, 2), default=Decimal("0"), nullable=False
    )
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    category: Mapped["Category"] = relationship(back_populates="products")
    reviews: Mapped[list["Review"]] = relationship(  # noqa: F821
        back_populates="product", cascade="all, delete-orphan"
    )

    @property
    def in_stock(self) -> bool:
        return self.stock_qty > 0
