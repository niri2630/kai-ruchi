"""Kai Ruchi — FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.routers import (
    auth,
    cart,
    categories,
    contact,
    orders,
    payments,
    products,
    reviews,
    users,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Storefront API for Kai Ruchi — homemade South Indian masalas, "
    "pickles, batters and sweets.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Cart-Token"],
)

for router in (
    auth.router,
    users.router,
    categories.router,
    products.router,
    cart.router,
    orders.router,
    payments.router,
    reviews.router,
    contact.router,
):
    app.include_router(router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["health"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "The taste only hands can make.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["health"])
def health():
    """Liveness plus a real round-trip to Postgres."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        database = "connected"
    except Exception as exc:  # noqa: BLE001
        database = f"unavailable: {type(exc).__name__}"
    return {
        "status": "ok",
        "database": database,
        "environment": settings.ENVIRONMENT,
        "payments": "razorpay" if settings.payments_live else "mock",
    }
