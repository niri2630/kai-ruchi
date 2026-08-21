"""Cart totals live here so the cart page, checkout and orders all agree."""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Cart
from app.schemas.cart import CartItemOut, CartOut
from app.schemas.catalog import ProductOut

ZERO = Decimal("0.00")


def shipping_for(subtotal: Decimal) -> Decimal:
    """Free over the threshold, flat fee under it, nothing on an empty cart."""
    if subtotal <= ZERO:
        return ZERO
    if subtotal >= Decimal(str(settings.FREE_SHIPPING_THRESHOLD)):
        return ZERO
    return Decimal(str(settings.SHIPPING_FEE))


def serialize_cart(db: Session, cart: Cart) -> CartOut:
    db.refresh(cart)
    items: list[CartItemOut] = []
    subtotal = ZERO

    for item in cart.items:
        if item.product is None or not item.product.is_active:
            continue
        line_total = item.unit_price * item.quantity
        subtotal += line_total
        items.append(
            CartItemOut(
                id=item.id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=line_total,
                product=ProductOut.model_validate(item.product),
            )
        )

    threshold = Decimal(str(settings.FREE_SHIPPING_THRESHOLD))
    shipping = shipping_for(subtotal)

    return CartOut(
        id=cart.id,
        items=items,
        item_count=sum(i.quantity for i in items),
        subtotal=subtotal,
        shipping_fee=shipping,
        total=subtotal + shipping,
        free_shipping_threshold=threshold,
        amount_to_free_shipping=max(ZERO, threshold - subtotal) if subtotal > ZERO else threshold,
    )
