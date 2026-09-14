# Base44 Dev Environment

## Project Structure
- `frontend/` — Vite + React + TypeScript dev server (port 5173, mapped to host 3000)
- `backend/` — Django + DRF dev server (port 8000), SQLite database

## Setup
The backend was a scaffold with no Django project files. The following were created:
- `backend/manage.py`, `backend/backend_project/` (settings, urls, wsgi, asgi)
- `backend/api/` (views, urls, apps) with a `/api/health/` endpoint
- `backend/backend_project/settings.py` — SQLite, CORS_ALLOW_ALL_ORIGINS, ALLOWED_HOSTS=['*']

## Compose
`docker-compose.base44.yml` runs both services from source with bind mounts:
- `backend`: python:3.12-slim, installs deps + migrates + runserver 0.0.0.0:8000
- `frontend`: node:22, npm install + vite dev, port 3000:5173

## Networking
- Single-origin: only port 3000 is public. Vite proxies `/api` to the backend container.
- `VITE_API_PROXY_TARGET=http://backend:8000` is set in compose for the frontend.
- `vite.config.ts` reads `process.env.VITE_API_PROXY_TARGET` with fallback to `http://localhost:8000`.

## Verification
- `curl localhost:3000/` — frontend HTML with Vite HMR scripts
- `curl localhost:3000/api/health/` — `{"status":"ok","message":"Backend is running"}`
- `curl localhost:8000/api/health/` — direct backend access

## No external secrets required.
