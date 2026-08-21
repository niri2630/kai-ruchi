from fastapi import APIRouter, status

from app.core.deps import DbSession
from app.models import ContactMessage
from app.schemas.contact import ContactIn, MessageOut

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(payload: ContactIn, db: DbSession):
    db.add(ContactMessage(**payload.model_dump()))
    db.commit()
    return MessageOut(message="Got it. We reply within a day, usually sooner.")
