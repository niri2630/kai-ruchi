from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.order import OrderStatus, PaymentMethod, PaymentStatus


class ShippingIn(BaseModel):
    full_name: str = Field(max_length=120)
    phone: str = Field(min_length=6, max_length=20)
    email: EmailStr
    line1: str = Field(max_length=200)
    line2: str | None = Field(default=None, max_length=200)
    city: str = Field(max_length=80)
    state: str = Field(max_length=80)
    pincode: str = Field(min_length=4, max_length=12)
    notes: str | None = None


class CheckoutIn(BaseModel):
    shipping: ShippingIn
    payment_method: PaymentMethod = PaymentMethod.razorpay


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None = None
    product_name: str
    product_slug: str
    image_url: str | None = None
    unit_label: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal


class OrderEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: OrderStatus
    message: str
    created_at: datetime


class TrackingStep(BaseModel):
    status: OrderStatus
    label: str
    message: str | None = None
    at: datetime | None = None
    done: bool
    current: bool


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod
    subtotal: Decimal
    shipping_fee: Decimal
    total: Decimal
    ship_full_name: str
    ship_phone: str
    ship_email: str
    ship_line1: str
    ship_line2: str | None = None
    ship_city: str
    ship_state: str
    ship_pincode: str
    notes: str | None = None
    placed_at: datetime
    items: list[OrderItemOut]


class OrderDetail(OrderOut):
    events: list[OrderEventOut] = []
    tracking: list[TrackingStep] = []


class PaymentIntentOut(BaseModel):
    """Everything the browser needs to open the Razorpay modal."""

    order_number: str
    provider: str  # "razorpay" | "mock" | "cod"
    key_id: str | None = None
    provider_order_id: str | None = None
    amount_paise: int
    currency: str
    customer_name: str
    customer_email: str
    customer_phone: str


class PaymentVerifyIn(BaseModel):
    order_number: str
    razorpay_order_id: str | None = None
    razorpay_payment_id: str | None = None
    razorpay_signature: str | None = None
