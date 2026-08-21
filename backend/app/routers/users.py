"""Account profile and saved delivery addresses."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models import Address
from app.schemas.user import AddressCreate, AddressOut, UserOut

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=20)


@router.patch("/me", response_model=UserOut)
def update_profile(payload: ProfileUpdate, db: DbSession, user: CurrentUser):
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip() or None
    db.commit()
    db.refresh(user)
    return user


@router.get("/me/addresses", response_model=list[AddressOut])
def list_addresses(db: DbSession, user: CurrentUser):
    return db.scalars(
        select(Address)
        .where(Address.user_id == user.id)
        .order_by(Address.is_default.desc(), Address.id.desc())
    ).all()


@router.post("/me/addresses", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def add_address(payload: AddressCreate, db: DbSession, user: CurrentUser):
    address = Address(user_id=user.id, **payload.model_dump())
    if address.is_default:
        for other in user.addresses:
            other.is_default = False
    elif not user.addresses:
        address.is_default = True  # first one saved becomes the default
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/me/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(address_id: int, db: DbSession, user: CurrentUser):
    address = db.get(Address, address_id)
    if address is None:
        return
    if address.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="That isn't your address."
        )
    db.delete(address)
    db.commit()
