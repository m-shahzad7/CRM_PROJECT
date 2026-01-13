from pydantic import BaseModel


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    email: str


class StatusUpdate(BaseModel):
    status: str


class EnquiryCreate(BaseModel):
    name: str
    phone_no: str
    email: str
    program: str
