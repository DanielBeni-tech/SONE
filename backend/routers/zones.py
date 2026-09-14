from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Zone, ZoneMember, ZoneMessage
from schemas import ZoneCreate, ZoneResponse, ZoneMessageResponse
from auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ZoneResponse])
def list_zones(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zones = db.query(Zone).all()
    result = []
    for z in zones:
        member_count = db.query(ZoneMember).filter(ZoneMember.zone_id == z.id).count()
        is_member = db.query(ZoneMember).filter(
            ZoneMember.zone_id == z.id, ZoneMember.user_id == user.id
        ).first() is not None
        result.append(ZoneResponse(
            id=z.id, name=z.name, description=z.description, type=z.type,
            member_count=member_count, is_member=is_member,
        ))
    return result


@router.post("/", response_model=ZoneResponse)
def create_zone(payload: ZoneCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    z = Zone(name=payload.name, description=payload.description, type=payload.type, created_by=user.id)
    db.add(z)
    db.commit()
    db.refresh(z)
    member = ZoneMember(zone_id=z.id, user_id=user.id)
    db.add(member)
    db.commit()
    return ZoneResponse(id=z.id, name=z.name, description=z.description, type=z.type, member_count=1, is_member=True)


@router.post("/{zone_id}/join")
def join_zone(zone_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    existing = db.query(ZoneMember).filter(ZoneMember.zone_id == zone_id, ZoneMember.user_id == user.id).first()
    if not existing:
        db.add(ZoneMember(zone_id=zone_id, user_id=user.id))
        db.commit()
    return {"ok": True}


@router.post("/{zone_id}/leave")
def leave_zone(zone_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    member = db.query(ZoneMember).filter(ZoneMember.zone_id == zone_id, ZoneMember.user_id == user.id).first()
    if member:
        db.delete(member)
        db.commit()
    return {"ok": True}


@router.get("/{zone_id}/messages", response_model=List[ZoneMessageResponse])
def get_zone_messages(zone_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    msgs = db.query(ZoneMessage).filter(ZoneMessage.zone_id == zone_id).order_by(ZoneMessage.created_at.asc()).all()
    return [ZoneMessageResponse(
        id=m.id, zone_id=m.zone_id, sender_id=m.sender_id,
        sender_pseudo=m.sender.pseudo, content=m.content, created_at=m.created_at,
    ) for m in msgs]
