from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, PrivateMessage
from schemas import PrivateMessageResponse, ConversationResponse
from auth import get_current_user

router = APIRouter()


@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    msgs = db.query(PrivateMessage).filter(
        (PrivateMessage.sender_id == user.id) | (PrivateMessage.receiver_id == user.id)
    ).order_by(PrivateMessage.created_at.desc()).all()

    seen = {}
    for m in msgs:
        other_id = m.receiver_id if m.sender_id == user.id else m.sender_id
        if other_id not in seen:
            other = m.receiver if m.sender_id == user.id else m.sender
            unread = db.query(PrivateMessage).filter(
                PrivateMessage.sender_id == other_id,
                PrivateMessage.receiver_id == user.id,
                PrivateMessage.status == "sent",
            ).count()
            seen[other_id] = ConversationResponse(
                user_id=other_id,
                pseudo=other.pseudo,
                is_online=other.is_online,
                last_message=m.content,
                last_message_time=m.created_at,
                unread_count=unread,
            )
    return list(seen.values())


@router.get("/{user_id}/messages", response_model=List[PrivateMessageResponse])
def get_messages(user_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(PrivateMessage).filter(
        ((PrivateMessage.sender_id == user.id) & (PrivateMessage.receiver_id == user_id)) |
        ((PrivateMessage.sender_id == user_id) & (PrivateMessage.receiver_id == user.id))
    ).order_by(PrivateMessage.created_at.asc()).all()


@router.post("/{user_id}/messages", response_model=PrivateMessageResponse)
def send_message(user_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    content = body.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Content required")
    msg = PrivateMessage(sender_id=user.id, receiver_id=user_id, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
