# Installation Guide

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ (local install, or via Docker — see below)
- Git

## 1. Clone and Configure

```bash
git clone <your-repo-url>
cd cafeteria-management-system
```

## 2. Database Setup

**Option A — Local PostgreSQL:**
Create a database and user matching what you'll put in `DATABASE_URL`:
```sql
CREATE DATABASE "CaféCore_db";
```
> If your Postgres client has trouble with the accented character, either URL-encode it (`Caf%C3%A9Core_db`) in the connection string or rename the database to `CafeCore_db`.

**Option B — Docker:**
```bash
docker-compose up -d db
```

## 3. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — your Postgres connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -base64 48`, use two different values
- `CLIENT_URL` — the frontend's origin (default `http://localhost:5173`)

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

The API starts on `http://localhost:5000`. Confirm with:
```bash
curl http://localhost:5000/health
```

## 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
- `VITE_API_BASE_URL` — should match your backend, e.g., `http://localhost:5000/api`
- `VITE_SOCKET_URL` — same host, no `/api` suffix, e.g., `http://localhost:5000`

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

## 5. First Login

- **Email:** `admin@cafeteria.local`
- **Password:** `Admin@12345`

Go to **Staff Management** and change your password by creating a new admin account with a real password, or update the seeded account directly — there is currently no in-app "change my own password" flow (see Known Issues in `docs/TROUBLESHOOTING.md`).

## 6. Running Tests

```bash
# Backend
cd backend
npm test

# Frontend E2E (requires both servers running)
cd frontend
npx playwright install
npm run test:e2e
```