"""Import every model so Alembic's autogenerate sees the full metadata."""
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.catalog import Category, Product  # noqa: F401
from app.models.contact import ContactMessage  # noqa: F401
from app.models.order import (  # noqa: F401
    Order,
    OrderEvent,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from app.models.review import Review  # noqa: F401
from app.models.user import Address, User  # noqa: F401

__all__ = [
    "Address",
    "Cart",
    "CartItem",
    "Category",
    "ContactMessage",
    "Order",
    "OrderEvent",
    "OrderItem",
    "OrderStatus",
    "PaymentMethod",
    "PaymentStatus",
    "Product",
    "Review",
    "User",
]
