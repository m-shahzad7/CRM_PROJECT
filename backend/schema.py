from pydantic import BaseModel, EmailStr, Field


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr


class StatusUpdate(BaseModel):
    status: str


class EnquiryCreate(BaseModel):
    name: str = Field(..., min_length=2)
    # Validates exactly 10 digits
    phone_no: str = Field(..., pattern=r"^\d{10}$")
    email: EmailStr  # Validates email format
    program: str
