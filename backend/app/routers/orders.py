"""Checkout, order history and order tracking."""
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import CurrentUser, DbSession, MaybeUser, ResolvedCart
from app.models import Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, Product
from app.schemas.order import CheckoutIn, OrderDetail, OrderOut, PaymentIntentOut
from app.services.cart_service import serialize_cart
from app.services.order_service import (
    add_event,
    advance_fulfilment,
    build_tracking,
    generate_order_number,
)
from app.services.payment_service import create_payment_intent

router = APIRouter(prefix="/orders", tags=["orders"])


def _load(db, order_number: str) -> Order:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.events))
        .where(Order.order_number == order_number)
    )
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No order with that number."
        )
    return order


def _detail(order: Order) -> OrderDetail:
    return OrderDetail(
        **OrderOut.model_validate(order).model_dump(),
        events=[
            {"status": e.status, "message": e.message, "created_at": e.created_at}
            for e in order.events
        ],
        tracking=build_tracking(order),
    )


@router.post("/checkout", response_model=PaymentIntentOut, status_code=status.HTTP_201_CREATED)
def checkout(
    payload: CheckoutIn,
    db: DbSession,
    cart: ResolvedCart,
    user: MaybeUser,
):
    """Turn the cart into an order and hand back what payment needs.

    Stock is reserved here, not at payment. An unpaid order that is cancelled
    releases it again.
    """
    summary = serialize_cart(db, cart)
    if not summary.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Your cart is empty."
        )

    # Re-check stock at the last possible moment.
    for line in summary.items:
        product = db.get(Product, line.product.id)
        if product is None or product.stock_qty < line.quantity:
            available = product.stock_qty if product else 0
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{line.product.name} — only {available} left. Update your cart.",
            )

    ship = payload.shipping
    order = Order(
        order_number=generate_order_number(),
        user_id=user.id if user else None,
        payment_method=payload.payment_method,
        payment_status=PaymentStatus.pending,
        status=OrderStatus.placed,
        subtotal=summary.subtotal,
        shipping_fee=summary.shipping_fee,
        total=summary.total,
        ship_full_name=ship.full_name,
        ship_phone=ship.phone,
        ship_email=str(ship.email).lower(),
        ship_line1=ship.line1,
        ship_line2=ship.line2,
        ship_city=ship.city,
        ship_state=ship.state,
        ship_pincode=ship.pincode,
        notes=ship.notes,
    )
    db.add(order)
    db.flush()

    for line in summary.items:
        product = db.get(Product, line.product.id)
        product.stock_qty -= line.quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_slug=product.slug,
                image_url=product.image_url,
                unit_label=product.unit_label,
                unit_price=line.unit_price,
                quantity=line.quantity,
                line_total=line.line_total,
            )
        )

    add_event(db, order, OrderStatus.placed)
    db.commit()
    db.refresh(order)

    return create_payment_intent(db, order)


@router.get("", response_model=list[OrderOut])
def my_orders(db: DbSession, user: CurrentUser):
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.events))
        .where(Order.user_id == user.id)
        .order_by(Order.placed_at.desc())
    ).all()
    for order in orders:
        advance_fulfilment(db, order)
    return [OrderOut.model_validate(o) for o in orders]


@router.get("/{order_number}", response_model=OrderDetail)
def get_order(
    order_number: str,
    db: DbSession,
    user: MaybeUser,
    email: str | None = Query(
        default=None, description="Required to view a guest order"
    ),
):
    order = _load(db, order_number)

    owned = user is not None and order.user_id == user.id
    matched = email is not None and email.lower().strip() == order.ship_email
    if not (owned or matched):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Add the email used on the order to see it.",
        )

    advance_fulfilment(db, order)
    return _detail(order)


@router.post("/{order_number}/cancel", response_model=OrderDetail)
def cancel_order(order_number: str, db: DbSession, user: CurrentUser):
    order = _load(db, order_number)
    if order.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="That isn't your order."
        )
    if order.status in (OrderStatus.shipped, OrderStatus.out_for_delivery, OrderStatus.delivered):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This one has already left the kitchen. Write to us and we'll sort it out.",
        )
    if order.status == OrderStatus.cancelled:
        return _detail(order)

    for item in order.items:  # put the stock back
        if item.product_id:
            product = db.get(Product, item.product_id)
            if product:
                product.stock_qty += item.quantity

    if order.payment_status == PaymentStatus.paid:
        order.payment_status = PaymentStatus.refunded
    add_event(db, order, OrderStatus.cancelled)
    db.commit()
    db.refresh(order)
    return _detail(order)
