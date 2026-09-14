# Sup'Zone — Messagerie académique du campus SUP'PTIC

Application web progressive (PWA) de messagerie académique conçue pour fonctionner en intranet, tout en restant accessible via Internet hors du campus. Elle repose sur un système de **Zones**, espaces de communication thématiques adaptés au contexte universitaire.

## 🎯 Objectifs

- Offrir une messagerie instantanée locale sans consommation de données Internet
- Structurer les échanges à travers des **Zones** thématiques
- Mettre à disposition des **ressources pédagogiques** centralisées
- Informer les étudiants sur les **événements** et **emplois du temps**
- Proposer une solution simple, sécurisée et évolutive

## 🧱 Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, React Router, Lucide Icons |
| **Backend** | FastAPI (Python), Uvicorn (ASGI), SQLAlchemy, SQLite |
| **Temps réel** | WebSockets natifs (messagerie privée + zones) |
| **Auth** | JWT (python-jose), hashage bcrypt |
| **Conteneurisation** | Docker Compose |

## 📱 Modules (MVP)

### 1. Authentification
- Inscription et connexion des utilisateurs
- Identification par **pseudo unique**
- Authentification sécurisée par **JWT**
- Gestion des rôles : **étudiant** / **administrateur**

### 2. Gestion des utilisateurs
- Profil utilisateur (pseudo, niveau, rôle)
- Statut **en ligne / hors ligne** en temps réel
- Indication du type de réseau (**Intranet / Internet**)

### 3. Chats privés
- Messagerie privée 1-à-1 entre utilisateurs
- Recherche d'un utilisateur par pseudo
- Envoi et réception de messages texte en **temps réel** (WebSocket)
- Bulles arrondies : noires pour les messages envoyés, blanches pour les reçus

### 4. Zones
Les Zones sont des espaces de discussion thématiques accessibles par recherche et adhésion.

| Type | Description |
|------|-------------|
| **Administration** | Annonces officielles du campus |
| **Estudiantine** | Communication de l'Association des Étudiants (AE) |
| **Classique** | Matières, clubs, discussions libres |

Fonctionnalités : recherche de Zones, rejoindre / quitter une Zone, discussion en temps réel.

### 5. Ressources
- Consultation des anciens sujets, corrigés et cours
- Organisation par **matière** et **niveau**
- Téléchargement des documents
- Ajout de ressources réservé à l'**administration** (MVP)

### 6. Événements
- Consultation des **emplois du temps** par classe
- Consultation des **événements du campus**
- Publication réservée à l'**administration**

## 🎨 Direction artistique

- **Style** : minimaliste, moderne, institutionnel
- **Inspiration** : WhatsApp (simplicité), Signal (sobriété), Slack (organisation)
- **Mobile-first** : interface centrée, largeur max 480px

### Palette de couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| Blanc principal | `#F8F9FB` | Fond |
| Blanc pur | `#FFFFFF` | Surfaces / cartes |
| Noir UI | `#0A0A0A` | Texte, bulles envoyées |
| Gris clair | `#E5E7EB` | Bordures |
| Bleu Sup'Zone | `#00C8FF` | Éléments interactifs, badges |
| Bleu foncé | `#0077AA` | Hover / focus |

### Identité visuelle
- Logo : icône minimaliste représentant un **« S »** stylisé dans un cercle noir
- Icône utilisée comme avatar par défaut et badge de notification

### Structure UI commune
- Header avec titre + icône notification
- Barre de recherche
- Liste scrollable
- Bouton d'action
- Barre de navigation inférieure (Messages, Zones, Ressources, Événements, Profil)

## 🏗️ Architecture

```
├── backend/
│   ├── main.py              # App FastAPI + WebSocket + seed data
│   ├── database.py          # SQLAlchemy + SQLite
│   ├── models.py             # User, PrivateMessage, Zone, ZoneMember, ZoneMessage, Resource, Event
│   ├── schemas.py            # Modèles Pydantic (request/response)
│   ├── auth.py              # JWT + bcrypt + dépendances d'auth
│   ├── websocket_manager.py # Gestionnaire de connexions WebSocket
│   └── routers/
│       ├── auth.py          # /api/auth — register, login, me
│       ├── users.py         # /api/users — search, get by id
│       ├── chats.py         # /api/chats — conversations, messages
│       ├── zones.py         # /api/zones — list, create, join, leave, messages
│       ├── resources.py     # /api/resources — list, create (admin)
│       └── events.py        # /api/events — list, create (admin)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + ProtectedRoute
│   │   ├── index.css            # Tailwind v4 + thème custom
│   │   ├── api/client.ts        # Wrapper fetch avec JWT
│   │   ├── context/
│   │   │   ├── AuthContext.tsx     # État d'auth (token, user, login, register, logout)
│   │   │   └── WebSocketContext.tsx # Connexion WebSocket temps réel
│   │   ├── components/
│   │   │   ├── Logo.tsx            # Logo Sup'Zone
│   │   │   ├── BottomNav.tsx       # Navigation inférieure
│   │   │   └── PageHeader.tsx     # Header commun
│   │   └── pages/
│   │       ├── Login.tsx          # Connexion
│   │       ├── Register.tsx       # Inscription
│   │       ├── Messages.tsx       # Liste des conversations
│   │       ├── Chat.tsx           # Chat privé temps réel
│   │       ├── Zones.tsx          # Liste des Zones
│   │       ├── ZoneChat.tsx       # Discussion de Zone temps réel
│   │       ├── Resources.tsx      # Liste des ressources
│   │       ├── Events.tsx         # Emplois du temps + événements
│   │       └── Profile.tsx        # Profil utilisateur
│   ├── vite.config.ts        # Vite + Tailwind + proxy /api + /ws
│   └── package.json
│
└── docker-compose.base44.yml  # Compose dev (source bind-mount + live reload)
```

## 🚀 Démarrage

### Avec Docker Compose (recommandé)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs

### Sans Docker

**Backend** (Python 3.12+) :
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (Node 22+) :
```bash
cd frontend
npm install
npm run dev
```

## 🔌 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/register` | Inscription (pseudo, password, level) |
| `POST` | `/api/auth/login` | Connexion (pseudo, password) |
| `GET` | `/api/auth/me` | Profil utilisateur courant |
| `GET` | `/api/users/search?q=` | Recherche d'utilisateurs |
| `GET` | `/api/users/{id}` | Profil d'un utilisateur |
| `GET` | `/api/chats/conversations` | Liste des conversations |
| `GET` | `/api/chats/{userId}/messages` | Messages d'une conversation |
| `POST` | `/api/chats/{userId}/messages` | Envoyer un message |
| `GET` | `/api/zones/` | Liste des Zones |
| `POST` | `/api/zones/` | Créer une Zone |
| `POST` | `/api/zones/{id}/join` | Rejoindre une Zone |
| `POST` | `/api/zones/{id}/leave` | Quitter une Zone |
| `GET` | `/api/zones/{id}/messages` | Messages d'une Zone |
| `GET` | `/api/resources/` | Liste des ressources |
| `POST` | `/api/resources/` | Ajouter une ressource (admin) |
| `GET` | `/api/events/` | Liste des événements |
| `POST` | `/api/events/` | Créer un événement (admin) |
| `WS` | `/ws?token=` | WebSocket temps réel |

## 📡 WebSocket

Connexion : `ws://<host>/ws?token=<JWT>`

Messages entrants (client → serveur) :
```json
{ "type": "private_message", "receiver_id": 2, "content": "Salut !" }
{ "type": "zone_message", "zone_id": 1, "content": "Bonjour à tous" }
```

Messages sortants (serveur → client) :
```json
{ "type": "private_message", "sender_id": 2, "sender_pseudo": "alice", "content": "Salut !", "created_at": "..." }
{ "type": "zone_message", "zone_id": 1, "sender_id": 3, "sender_pseudo": "bob", "content": "Bonjour", "created_at": "..." }
```

## 🌱 Données seedées

Au premier démarrage, l'app crée automatiquement :
- **5 Zones** : Annonces Officielles, AE, Informatique L1, Réseaux L2, Clubs & Loisirs
- **4 Ressources** : sujets d'examens, corrigés TD, slides de cours
- **4 Événements** : cours, TD, soirée d'intégration, conférence

## 🔒 Sécurité

- Hashage des mots de passe avec **bcrypt**
- Authentification par **JWT** (validité 24h)
- Endpoints protégés par dépendance `get_current_user`
- Endpoints admin protégés par `get_current_admin`
- WebSocket authentifié par token JWT en query param

## 📋 Limites du MVP

- Pas de notifications push
- Pas de chiffrement de bout en bout
- Pas de gestion avancée des permissions
- Téléchargement de fichiers : URL simulée (pas d'upload réel)

## 🔮 Évolutions futures

- Synchronisation Intranet ↔ Internet
- Notifications push
- Rôles enseignants et modérateurs
- Zones privées et sécurisées
- Statistiques et tableaux de bord
- Upload réel de fichiers
- Mode hors-ligne (PWA service worker)

## 👥 Public cible

- Étudiants du campus SUP'PTIC
- Administration du campus
- Associations estudiantines (AE)

---

**Sup'Zone** — Projet académique SUP'PTIC · MVP
