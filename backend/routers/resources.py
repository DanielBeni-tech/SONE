from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Resource
from schemas import ResourceCreate, ResourceResponse
from auth import get_current_user, get_current_admin

router = APIRouter()


@router.get("/", response_model=List[ResourceResponse])
def list_resources(subject: str = None, level: str = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Resource)
    if subject:
        q = q.filter(Resource.subject.ilike(f"%{subject}%"))
    if level:
        q = q.filter(Resource.level == level)
    return q.order_by(Resource.created_at.desc()).all()


@router.post("/", response_model=ResourceResponse)
def create_resource(payload: ResourceCreate, db: Session = Depends(get_db), user: User = Depends(get_current_admin)):
    r = Resource(
        title=payload.title, description=payload.description,
        subject=payload.subject, level=payload.level,
        file_url=payload.file_url, uploaded_by=user.id,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r
