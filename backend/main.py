from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from database import Base, engine, SessionLocal
from routers import auth, users, chats, zones, resources, events
from websocket_manager import manager
from models import User, Zone, ZoneMember, Resource, Event
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM


def seed_data():
    db = SessionLocal()
    try:
        if db.query(Zone).count() == 0:
            db.add(Zone(name="Annonces Officielles", description="Annonces officielles du campus SUP'PTIC", type="admin"))
            db.add(Zone(name="AE - Association Estudiantine", description="Communication de l'Association des Étudiants", type="student"))
            db.add(Zone(name="Informatique - L1", description="Discussions sur les cours d'informatique de niveau L1", type="classic"))
            db.add(Zone(name="Réseaux - L2", description="Discussions sur les cours de réseaux de niveau L2", type="classic"))
            db.add(Zone(name="Clubs & Loisirs", description="Discussions libres autour des clubs du campus", type="classic"))
            db.commit()

        if db.query(Resource).count() == 0:
            db.add(Resource(title="Sujet Examen Algorithmique 2023", description="Sujet complet avec corrigé", subject="Algorithmique", level="L1", file_url="/files/algo_2023.pdf"))
            db.add(Resource(title="Cours Base de Données", description="Slides complètes du cours", subject="Base de données", level="L2", file_url="/files/bd_cours.pdf"))
            db.add(Resource(title="Corrigé TD Réseaux", description="Corrigé détaillé des TD 1 à 5", subject="Réseaux", level="L2", file_url="/files/reseaux_td.pdf"))
            db.add(Resource(title="Sujet Examen Mathématiques 2023", description="Sujet d'examen de mathématiques discrètes", subject="Mathématiques", level="L1", file_url="/files/maths_2023.pdf"))
            db.commit()

        if db.query(Event).count() == 0:
            now = datetime.utcnow()
            db.add(Event(title="Cours d'Algorithmique", description="Amphi A - 10h00 à 12h00", event_type="schedule", date=now, class_name="L1 Informatique"))
            db.add(Event(title="TD de Réseaux", description="Salle 204 - 14h00 à 16h00", event_type="schedule", date=now, class_name="L2 Réseaux"))
            db.add(Event(title="Soirée d'Intégration", description="Salle des fêtes - 19h00", event_type="campus", date=now))
            db.add(Event(title="Conférence IA", description="Amphi B - 15h00", event_type="campus", date=now))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_data()
    yield


app = FastAPI(title="Sup'Zone API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(chats.router, prefix="/api/chats", tags=["chats"])
app.include_router(zones.router, prefix="/api/zones", tags=["zones"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(events.router, prefix="/api/events", tags=["events"])


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError):
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user_id)

    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_online = True
        db.commit()

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "private_message":
                receiver_id = data.get("receiver_id")
                content = data.get("content", "")
                if not receiver_id or not content:
                    continue
                from models import PrivateMessage
                msg = PrivateMessage(sender_id=user_id, receiver_id=receiver_id, content=content)
                db.add(msg)
                db.commit()
                db.refresh(msg)
                await manager.send_to_user(receiver_id, {
                    "type": "private_message",
                    "id": msg.id,
                    "sender_id": user_id,
                    "sender_pseudo": user.pseudo,
                    "content": content,
                    "created_at": msg.created_at.isoformat(),
                })

            elif msg_type == "zone_message":
                zone_id = data.get("zone_id")
                content = data.get("content", "")
                if not zone_id or not content:
                    continue
                from models import ZoneMessage
                msg = ZoneMessage(zone_id=zone_id, sender_id=user_id, content=content)
                db.add(msg)
                db.commit()
                db.refresh(msg)
                member_ids = [m.user_id for m in db.query(ZoneMember).filter(ZoneMember.zone_id == zone_id).all()]
                await manager.broadcast_to_users(member_ids, {
                    "type": "zone_message",
                    "id": msg.id,
                    "zone_id": zone_id,
                    "sender_id": user_id,
                    "sender_pseudo": user.pseudo,
                    "content": content,
                    "created_at": msg.created_at.isoformat(),
                })

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id)
        if user:
            user.is_online = False
            db.commit()
        db.close()
