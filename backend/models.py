from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    password: str
    email: str
    is_admin: bool = False
    # Options: Pending, Approved, Rejected
    status: str = Field(default="Pending")
