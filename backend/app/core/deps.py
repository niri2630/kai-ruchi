"""Shared FastAPI dependencies: current user + cart resolution."""
import secrets
from typing import Annotated, Optional

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import Cart, User

bearer_scheme = HTTPBearer(auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]
BearerToken = Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)]

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Sign in to continue.",
    headers={"WWW-Authenticate": "Bearer"},
)


def _user_from_token(db: Session, creds: Optional[HTTPAuthorizationCredentials]) -> User | None:
    if creds is None or not creds.credentials:
        return None
    payload = decode_access_token(creds.credentials)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.get(User, int(user_id))
    if user is None or not user.is_active:
        return None
    return user


def get_current_user(db: DbSession, creds: BearerToken) -> User:
    user = _user_from_token(db, creds)
    if user is None:
        raise CREDENTIALS_ERROR
    return user


def get_current_user_optional(db: DbSession, creds: BearerToken) -> User | None:
    return _user_from_token(db, creds)


CurrentUser = Annotated[User, Depends(get_current_user)]
MaybeUser = Annotated[Optional[User], Depends(get_current_user_optional)]


def resolve_cart(
    db: DbSession,
    user: MaybeUser,
    x_cart_token: Annotated[str | None, Header(alias="X-Cart-Token")] = None,
) -> Cart:
    """Find (or open) the caller's cart.

    Signed-in shoppers get the cart tied to their account. Guests get one keyed
    by the token their browser stores. When a guest signs in, whatever was in
    the guest cart is merged into the account cart by `merge_guest_cart`.
    """
    if user is not None:
        cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
        if cart is None:
            cart = Cart(user_id=user.id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    if x_cart_token:
        cart = db.scalar(select(Cart).where(Cart.session_token == x_cart_token))
        if cart is not None:
            return cart

    cart = Cart(session_token=x_cart_token or secrets.token_urlsafe(24))
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


ResolvedCart = Annotated[Cart, Depends(resolve_cart)]
