from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

# Internal Imports
from settings import engine, get_session
from models import User
from schema import UserLogin, UserCreate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    print("🚀 Database connection established...")

    with Session(engine) as session:
        admin_exists = session.exec(
            select(User).where(User.username == "admin")).first()
        if not admin_exists:
            admin = User(
                username="admin",
                password="admin123",
                email="admin@site.com",
                is_admin=True,
                status="Admin"
            )
            session.add(admin)
            session.commit()
            print("👤 Default Admin created: [admin/admin123]")
        else:
            print("✅ Admin user already exists.")
    print("✨ FastAPI Server is ready!")

# --- Endpoints ---


@app.post("/register")
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    print(f"📝 Registering new user: {user_data.username}...")
    new_user = User(**user_data.dict())
    session.add(new_user)
    session.commit()
    print(f"🎉 User {user_data.username} successfully saved to SQLite.")
    return {"message": "Student registered successfully"}


@app.post("/login")
def login(login_data: UserLogin, session: Session = Depends(get_session)):
    print(f"🔑 Login attempt for: {login_data.username}")
    db_user = session.exec(select(User).where(
        User.username == login_data.username)).first()

    if not db_user or db_user.password != login_data.password:
        print(f"❌ Login failed for: {login_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    print(
        f"🔓 Login successful: {login_data.username} (Admin: {db_user.is_admin})")
    return {"is_admin": db_user.is_admin, "username": db_user.username}


@app.get("/users", response_model=List[User])
def get_users(session: Session = Depends(get_session)):
    print("📋 Admin fetching all users list...")
    users = session.exec(select(User)).all()
    print(f"📊 Found {len(users)} users in database.")
    return users


@app.patch("/users/{user_id}/status")
def update_user_status(user_id: int, status: str, session: Session = Depends(get_session)):
    print(f"🔄 Updating Status for User ID {user_id} to: {status}")
    db_user = session.get(User, user_id)
    if not db_user:
        print(f"⚠️ User ID {user_id} not found for status update.")
        raise HTTPException(status_code=404, detail="User not found")

    db_user.status = status
    session.add(db_user)
    session.commit()
    print(f"✅ Status successfully changed for {db_user.username}")
    return {"message": "Status updated"}


@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    print(f"🗑️ Deletion request for User ID: {user_id}")
    db_user = session.get(User, user_id)

    if not db_user or db_user.username == "admin":
        print(f"🚫 Deletion blocked for User ID: {user_id}")
        raise HTTPException(status_code=400, detail="Cannot delete user")

    session.delete(db_user)
    session.commit()
    print(f"🔥 User {db_user.username} removed from database.")
    return {"message": "User deleted successfully"}
