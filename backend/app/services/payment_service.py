"""Razorpay integration with a first-class mock mode.

With no gateway keys configured the whole checkout still runs end to end: the
browser gets a `mock` provider and a confirm step stands in for the Razorpay
modal. Drop real test keys into .env and the same code path goes live.
"""
import hashlib
import hmac
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Order, OrderStatus, PaymentMethod, PaymentStatus
from app.schemas.order import PaymentIntentOut
from app.services.order_service import add_event


def _client():
    """Import the SDK only when real keys are configured.

    The razorpay package still reaches for `pkg_resources` at import time, which
    modern setuptools no longer ships. Keeping the import lazy means mock mode —
    the default for this project — never loads it at all.
    """
    import razorpay  # noqa: PLC0415

    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def to_paise(amount: Decimal) -> int:
    return int((amount * 100).quantize(Decimal("1")))


def create_payment_intent(db: Session, order: Order) -> PaymentIntentOut:
    base = dict(
        order_number=order.order_number,
        amount_paise=to_paise(order.total),
        currency=settings.CURRENCY,
        customer_name=order.ship_full_name,
        customer_email=order.ship_email,
        customer_phone=order.ship_phone,
    )

    if order.payment_method == PaymentMethod.cod:
        return PaymentIntentOut(provider="cod", **base)

    if not settings.payments_live:
        order.razorpay_order_id = f"mock_{order.order_number}"
        db.commit()
        return PaymentIntentOut(
            provider="mock", provider_order_id=order.razorpay_order_id, **base
        )

    try:
        rp_order = _client().order.create(
            {
                "amount": base["amount_paise"],
                "currency": settings.CURRENCY,
                "receipt": order.order_number,
                "notes": {"order_number": order.order_number},
            }
        )
    except Exception as exc:  # noqa: BLE001 - surface gateway errors to the shopper
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Payments are unavailable right now: {exc}",
        ) from exc

    order.razorpay_order_id = rp_order["id"]
    db.commit()
    return PaymentIntentOut(
        provider="razorpay",
        key_id=settings.RAZORPAY_KEY_ID,
        provider_order_id=rp_order["id"],
        **base,
    )


def signature_is_valid(rp_order_id: str, rp_payment_id: str, signature: str) -> bool:
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{rp_order_id}|{rp_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def mark_paid(db: Session, order: Order, payment_id: str | None, signature: str | None) -> None:
    order.payment_status = PaymentStatus.paid
    order.razorpay_payment_id = payment_id
    order.razorpay_signature = signature
    add_event(db, order, OrderStatus.confirmed)
    db.commit()
    db.refresh(order)
