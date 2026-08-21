"""Cart operations. Works for guests (X-Cart-Token header) and signed-in users."""
from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app.core.deps import DbSession, ResolvedCart
from app.models import CartItem, Product
from app.schemas.cart import CartItemIn, CartItemUpdate, CartOut
from app.services.cart_service import serialize_cart

router = APIRouter(prefix="/cart", tags=["cart"])


def _expose_token(response: Response, cart) -> None:
    """Hand guests back the token their browser should keep."""
    if cart.session_token:
        response.headers["X-Cart-Token"] = cart.session_token


@router.get("", response_model=CartOut)
def get_cart(db: DbSession, cart: ResolvedCart, response: Response):
    _expose_token(response, cart)
    return serialize_cart(db, cart)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_item(payload: CartItemIn, db: DbSession, cart: ResolvedCart, response: Response):
    product = db.get(Product, payload.product_id)
    if product is None or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="We don't stock that one."
        )

    existing = db.scalar(
        select(CartItem).where(
            CartItem.cart_id == cart.id, CartItem.product_id == product.id
        )
    )
    wanted = (existing.quantity if existing else 0) + payload.quantity
    if wanted > product.stock_qty:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only {product.stock_qty} left in this batch.",
        )

    if existing:
        existing.quantity = wanted
        existing.unit_price = product.price
    else:
        db.add(
            CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=payload.quantity,
                unit_price=product.price,
            )
        )
    db.commit()
    _expose_token(response, cart)
    return serialize_cart(db, cart)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    payload: CartItemUpdate,
    db: DbSession,
    cart: ResolvedCart,
    response: Response,
):
    item = db.scalar(
        select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)
    )
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="That line is no longer in your cart."
        )

    if payload.quantity == 0:
        db.delete(item)
    else:
        if item.product and payload.quantity > item.product.stock_qty:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Only {item.product.stock_qty} left in this batch.",
            )
        item.quantity = payload.quantity
    db.commit()
    _expose_token(response, cart)
    return serialize_cart(db, cart)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(item_id: int, db: DbSession, cart: ResolvedCart, response: Response):
    item = db.scalar(
        select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)
    )
    if item is not None:
        db.delete(item)
        db.commit()
    _expose_token(response, cart)
    return serialize_cart(db, cart)


@router.delete("", response_model=CartOut)
def clear_cart(db: DbSession, cart: ResolvedCart, response: Response):
    for item in list(cart.items):
        db.delete(item)
    db.commit()
    _expose_token(response, cart)
    return serialize_cart(db, cart)
