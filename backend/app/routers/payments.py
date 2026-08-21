"""Payment confirmation. Handles real Razorpay callbacks, mock mode and COD."""
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.deps import DbSession, ResolvedCart
from app.models import Order, OrderStatus, PaymentMethod, PaymentStatus
from app.schemas.order import OrderDetail, OrderOut, PaymentVerifyIn
from app.services.order_service import add_event, build_tracking
from app.services.payment_service import mark_paid, signature_is_valid

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/config")
def payment_config():
    """Tells the checkout page which flow to render."""
    return {
        "provider": "razorpay" if settings.payments_live else "mock",
        "key_id": settings.RAZORPAY_KEY_ID or None,
        "currency": settings.CURRENCY,
        "cod_enabled": True,
    }


@router.post("/verify", response_model=OrderDetail)
def verify_payment(payload: PaymentVerifyIn, db: DbSession, cart: ResolvedCart):
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.events))
        .where(Order.order_number == payload.order_number)
    )
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No order with that number."
        )
    if order.payment_status == PaymentStatus.paid:
        return _detail(order)

    if order.payment_method == PaymentMethod.cod:
        # Nothing to collect now — confirm and collect at the door.
        add_event(db, order, OrderStatus.confirmed, "Confirmed. Pay the courier on delivery.")
        db.commit()
        db.refresh(order)
    elif settings.payments_live:
        if not (
            payload.razorpay_order_id
            and payload.razorpay_payment_id
            and payload.razorpay_signature
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment details are incomplete.",
            )
        if not signature_is_valid(
            payload.razorpay_order_id,
            payload.razorpay_payment_id,
            payload.razorpay_signature,
        ):
            order.payment_status = PaymentStatus.failed
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="We couldn't verify that payment. Nothing was charged.",
            )
        mark_paid(db, order, payload.razorpay_payment_id, payload.razorpay_signature)
    else:
        # Mock mode: no gateway to check against.
        mark_paid(db, order, f"mock_pay_{order.order_number}", "mock_signature")

    # The order is committed — the cart's job is done.
    for item in list(cart.items):
        db.delete(item)
    db.commit()

    return _detail(order)


def _detail(order: Order) -> OrderDetail:
    return OrderDetail(
        **OrderOut.model_validate(order).model_dump(),
        events=[
            {"status": e.status, "message": e.message, "created_at": e.created_at}
            for e in order.events
        ],
        tracking=build_tracking(order),
    )
