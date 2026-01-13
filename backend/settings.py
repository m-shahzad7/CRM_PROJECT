from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    password: str
    email: str
    is_admin: bool = False
    status: str = Field(default="Pending")


class Enquiry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone_no: str
    email: str
    program: str
    # Automatically track when the enquiry was made
    created_at: datetime = Field(default_factory=datetime.utcnow)
