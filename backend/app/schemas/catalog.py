from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    tagline: str | None = None
    description: str | None = None
    accent: str
    image_url: str | None = None
    sort_order: int


class CategoryWithCount(CategoryOut):
    product_count: int = 0


class ProductOut(BaseModel):
    """Card-sized product payload used by listings, search and the cart."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    short_description: str
    price: Decimal
    compare_at_price: Decimal | None = None
    unit_label: str
    sku: str
    stock_qty: int
    spice_level: int
    is_veg: bool
    is_featured: bool
    image_url: str | None = None
    rating_avg: Decimal
    rating_count: int
    category: CategoryOut


class ProductDetail(ProductOut):
    description: str
    ingredients: str | None = None
    shelf_life: str | None = None
    gallery: list[str] | None = None
    pairs_with: str | None = None


class ProductPage(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int
    pages: int
