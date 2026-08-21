"""Application settings loaded from environment variables / .env file."""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- App ---
    PROJECT_NAME: str = "Kai Ruchi API"
    API_V1_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"

    # --- Database ---
    # Local dev example : postgresql+psycopg2://postgres:postgres@localhost:5432/kairuchi
    # Neon / Supabase   : postgresql+psycopg2://user:pass@host/db?sslmode=require
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/kairuchi"

    # --- Auth ---
    SECRET_KEY: str = "change-me-in-production-please-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- Payments (Razorpay) ---
    # Leave blank to run in MOCK mode: checkout still works end to end, but no
    # real gateway call is made. Perfect for a demo / college submission.
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    CURRENCY: str = "INR"

    # --- Storefront rules ---
    FREE_SHIPPING_THRESHOLD: float = 799.0
    SHIPPING_FEE: float = 59.0

    # --- Fulfilment simulation ---
    # There is no warehouse behind this project, so a paid order walks itself
    # along the tracking timeline. Minutes after payment at which each of
    # confirmed / packed / shipped / out_for_delivery / delivered fires.
    AUTO_FULFILMENT: bool = True
    FULFILMENT_MINUTES: str = "1,4,10,20,35"

    @property
    def fulfilment_offsets(self) -> List[int]:
        try:
            return [int(x) for x in self.FULFILMENT_MINUTES.split(",") if x.strip()]
        except ValueError:
            return [1, 4, 10, 20, 35]

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def payments_live(self) -> bool:
        return bool(self.RAZORPAY_KEY_ID and self.RAZORPAY_KEY_SECRET)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
