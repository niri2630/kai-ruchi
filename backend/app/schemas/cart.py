from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.catalog import ProductOut


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=99)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=0, le=99)  # 0 removes the line


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    product: ProductOut


class CartOut(BaseModel):
    id: int
    items: list[CartItemOut]
    item_count: int
    subtotal: Decimal
    shipping_fee: Decimal
    total: Decimal
    free_shipping_threshold: Decimal
    amount_to_free_shipping: Decimal
