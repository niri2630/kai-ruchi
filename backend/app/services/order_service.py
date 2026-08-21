"""Order numbering, the tracking timeline, and demo fulfilment."""
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Order, OrderEvent, OrderStatus, PaymentStatus
from app.models.order import TRACKING_STEPS
from app.schemas.order import TrackingStep

STATUS_LABELS: dict[OrderStatus, str] = {
    OrderStatus.placed: "Order placed",
    OrderStatus.confirmed: "Confirmed by the kitchen",
    OrderStatus.packed: "Packed and sealed",
    OrderStatus.shipped: "Handed to the courier",
    OrderStatus.out_for_delivery: "Out for delivery",
    OrderStatus.delivered: "Delivered",
    OrderStatus.cancelled: "Cancelled",
}

STATUS_MESSAGES: dict[OrderStatus, str] = {
    OrderStatus.placed: "We have your order. Payment is being confirmed.",
    OrderStatus.confirmed: "Amma has your list. Your batch is being weighed out.",
    OrderStatus.packed: "Jars wiped, lids taped, box padded with newspaper.",
    OrderStatus.shipped: "On the road. Tracking with the courier from here.",
    OrderStatus.out_for_delivery: "With the delivery partner in your area today.",
    OrderStatus.delivered: "Delivered. Open a jar and tell us how it went.",
    OrderStatus.cancelled: "This order was cancelled. Any payment is being refunded.",
}


def generate_order_number() -> str:
    """Human-readable, unguessable: KR2508-4F9C."""
    stamp = datetime.now(timezone.utc).strftime("%y%m")
    return f"KR{stamp}-{secrets.token_hex(2).upper()}"


def add_event(db: Session, order: Order, status: OrderStatus, message: str | None = None,
              at: datetime | None = None) -> OrderEvent:
    event = OrderEvent(
        order_id=order.id,
        status=status,
        message=message or STATUS_MESSAGES[status],
    )
    if at is not None:
        event.created_at = at
    db.add(event)
    order.status = status
    return event


def advance_fulfilment(db: Session, order: Order) -> None:
    """Walk a paid order forward to whatever stage its age implies.

    Real shops move orders from an ops console. This project has no admin
    dashboard, so time does the job: every read of the order backfills the
    events that should have fired by now.
    """
    if not settings.AUTO_FULFILMENT:
        return
    if order.payment_status != PaymentStatus.paid:
        return
    if order.status in (OrderStatus.delivered, OrderStatus.cancelled):
        return

    now = datetime.now(timezone.utc)
    placed = order.placed_at
    if placed.tzinfo is None:
        placed = placed.replace(tzinfo=timezone.utc)

    reached = {event.status for event in order.events}
    changed = False

    for offset, status in zip(settings.fulfilment_offsets, TRACKING_STEPS[1:]):
        due = placed + timedelta(minutes=offset)
        if now >= due and status not in reached:
            add_event(db, order, status, at=due)
            changed = True

    if changed:
        db.commit()
        db.refresh(order)


def build_tracking(order: Order) -> list[TrackingStep]:
    """Fold the event log into the six-step timeline the UI renders."""
    seen = {event.status: event for event in order.events}
    cancelled = order.status == OrderStatus.cancelled

    if cancelled:
        current_index = -1
    else:
        current_index = max(
            (i for i, s in enumerate(TRACKING_STEPS) if s in seen), default=0
        )

    steps: list[TrackingStep] = []
    for i, status in enumerate(TRACKING_STEPS):
        event = seen.get(status)
        steps.append(
            TrackingStep(
                status=status,
                label=STATUS_LABELS[status],
                message=event.message if event else STATUS_MESSAGES[status],
                at=event.created_at if event else None,
                done=event is not None,
                current=(not cancelled and i == current_index),
            )
        )
    return steps
