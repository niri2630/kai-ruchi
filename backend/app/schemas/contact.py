from pydantic import BaseModel, EmailStr, Field


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    subject: str = Field(min_length=2, max_length=160)
    message: str = Field(min_length=10, max_length=4000)


class MessageOut(BaseModel):
    ok: bool = True
    message: str
