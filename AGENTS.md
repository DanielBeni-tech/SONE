# Base44 Dev Environment — Sup'Zone

## Project
Sup'Zone — PWA de messagerie académique pour le campus SUP'PTIC.

## Stack
- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4 + react-router-dom + lucide-react (port 3000)
- **Backend**: FastAPI + Uvicorn + SQLAlchemy + SQLite + JWT auth + WebSocket (port 8000)

## Structure
- `frontend/src/pages/` — Login, Register, Messages, Chat, Zones, ZoneChat, Resources, Events, Profile
- `frontend/src/components/` — Logo, BottomNav, PageHeader
- `frontend/src/context/` — AuthContext, WebSocketContext
- `frontend/src/api/client.ts` — fetch wrapper with JWT
- `backend/main.py` — FastAPI app + WebSocket endpoint + seed data
- `backend/models.py` — User, PrivateMessage, Zone, ZoneMember, ZoneMessage, Resource, Event
- `backend/routers/` — auth, users, chats, zones, resources, events

## Compose
`docker-compose.base44.yml` — both services from source with bind mounts + live reload.
- Backend: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Frontend: `npm install && npm run dev` (Vite on 5173, mapped to 3000)
- Vite proxies `/api` and `/ws` (WebSocket) to the backend container.

## Key fixes applied
- Replaced Django scaffold with FastAPI (per cahier des charges)
- Replaced passlib with bcrypt directly (passlib/bcrypt 4.1+ compatibility issue)
- Removed ESLint devDependencies with non-existent versions (globals@^16.5.1)

## Verification
- `curl -X POST localhost:3000/api/auth/register` — returns JWT + user
- `curl -X POST localhost:3000/api/auth/login` — returns JWT + user
- `curl localhost:8000/api/zones/` — returns seeded zones
- WebSocket at `/ws?token=<JWT>` — real-time private + zone messaging

## No external secrets required.
