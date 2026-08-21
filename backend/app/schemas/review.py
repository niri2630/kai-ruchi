from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str | None = Field(default=None, max_length=120)
    body: str = Field(min_length=4, max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rating: int
    title: str | None = None
    body: str
    is_verified_purchase: bool
    created_at: datetime
    author_name: str
    product_slug: str | None = None
    product_name: str | None = None


class ReviewSummary(BaseModel):
    average: float
    count: int
    # rating value -> how many reviews gave it
    breakdown: dict[int, int]
