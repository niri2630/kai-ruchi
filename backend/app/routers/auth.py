"""Sign up, sign in, and the guest-cart merge that happens on both."""
from fastapi import APIRouter, Header, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Cart, CartItem, User
from app.schemas.user import Token, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def merge_guest_cart(db, user: User, guest_token: str | None) -> None:
    """Fold a guest cart into the user's cart so nothing is lost at sign-in."""
    if not guest_token:
        return
    guest = db.scalar(select(Cart).where(Cart.session_token == guest_token))
    if guest is None or not guest.items:
        return

    mine = db.scalar(select(Cart).where(Cart.user_id == user.id))
    if mine is None:
        mine = Cart(user_id=user.id)
        db.add(mine)
        db.flush()

    existing = {item.product_id: item for item in mine.items}
    for item in list(guest.items):
        if item.product_id in existing:
            existing[item.product_id].quantity = min(
                99, existing[item.product_id].quantity + item.quantity
            )
        else:
            db.add(
                CartItem(
                    cart_id=mine.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                )
            )
    db.delete(guest)
    db.commit()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(
    payload: UserCreate,
    db: DbSession,
    x_cart_token: str | None = Header(default=None, alias="X-Cart-Token"),
):
    email = payload.email.lower().strip()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That email already has an account. Sign in instead.",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    merge_guest_cart(db, user, x_cart_token)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(
    payload: UserLogin,
    db: DbSession,
    x_cart_token: str | None = Header(default=None, alias="X-Cart-Token"),
):
    user = db.scalar(select(User).where(User.email == payload.email.lower().strip()))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="That email and password don't match.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This account is disabled."
        )

    merge_guest_cart(db, user, x_cart_token)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user
