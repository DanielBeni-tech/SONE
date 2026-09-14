from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Event
from schemas import EventCreate, EventResponse
from auth import get_current_user, get_current_admin

router = APIRouter()


@router.get("/", response_model=List[EventResponse])
def list_events(event_type: str = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Event)
    if event_type:
        q = q.filter(Event.event_type == event_type)
    return q.order_by(Event.date.asc()).all()


@router.post("/", response_model=EventResponse)
def create_event(payload: EventCreate, db: Session = Depends(get_db), user: User = Depends(get_current_admin)):
    e = Event(
        title=payload.title, description=payload.description,
        event_type=payload.event_type, date=payload.date,
        class_name=payload.class_name, created_by=user.id,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return e
