# Backend (Django) - minimal scaffold

Prerequisites

- Python 3.10+ installed

Setup (recommended)

```bash
python -m venv venv
venv\Scripts\activate    # Windows
# or: source venv/bin/activate  # macOS / Linux
pip install -r requirements.txt
```

Create project and app

```bash
django-admin startproject backend_project .
cd backend_project
python manage.py startapp api
```

Quick dev run

```bash
python manage.py migrate
python manage.py runserver 8000
```

Notes

- Add `corsheaders` to `INSTALLED_APPS` and middleware for CORS.
- Create REST API endpoints using Django REST Framework and expose under `/api/`.
- The frontend development server proxies `/api` to `http://localhost:8000` (see frontend vite.config.ts).
