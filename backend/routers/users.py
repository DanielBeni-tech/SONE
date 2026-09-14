from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from database import get_db
from models import User
from schemas import UserResponse
from auth import get_current_user

router = APIRouter()


@router.get("/search", response_model=List[UserResponse])
def search_users(q: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(User).filter(
        User.pseudo.ilike(f"%{q}%"),
        User.id != user.id,
    ).limit(20).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return u
