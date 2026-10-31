# Deployment Guide

## Option A — Docker Compose (self-hosted / VPS)

### `docker-compose.prod.yml` (referenced, not reprinted in full)
Brings up three services: `db` (Postgres with a named volume), `backend` (built via the multi-stage `Dockerfile` from Phase 6), and a static file server for the frontend's built assets (or `nginx` as a reverse proxy in front of both).

```bash
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed  # first deploy only
```

Set production environment variables via a `.env` file alongside `docker-compose.prod.yml` — never commit real secrets.

## Option B — Render / Railway (free tier PaaS)

1. Push your repo to GitHub.
2. Create a PostgreSQL instance on Render/Railway; copy its connection string into `DATABASE_URL`.
3. Create a Web Service with root directory `backend`, build command `npm install && npx prisma generate && npm run build`, and start command `npm start`. Deploy the latest application commit so the generated `dist/` output includes all current API routes.
4. Set all `backend/.env.example` variables in the platform's environment variable settings — especially strong, unique `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`.
5. Deploy the frontend as a Static Site (root directory `frontend`, build command `npm run build`, publish directory `dist`). Set `VITE_API_BASE_URL` to `https://<backend-service>.onrender.com/api` and `VITE_SOCKET_URL` to `https://<backend-service>.onrender.com` in the Static Site's environment settings. Vite embeds these values at build time, so redeploy the Static Site after changing either value.
6. Update the backend's `CLIENT_URL` to match your deployed frontend's URL (required for CORS and the Socket.IO handshake to succeed).

## Post-Deployment Checklist

- [ ] Run migrations: `npx prisma migrate deploy` (not `migrate dev`, which prompts interactively)
- [ ] Seed only on first deploy — re-running the seed script is idempotent (`upsert`) but unnecessary after initial setup
- [ ] Confirm `GET /health` responds `200`
- [ ] Confirm `GET /api/public/menu?page=1&limit=100` responds `200`; if `/health` works but this endpoint returns `404`, deploy the latest backend commit and verify the service root directory/build command
- [ ] Verify the deployed frontend's API base URL matches the backend service URL configured above, then redeploy the Static Site
- [ ] Confirm CORS: log in from the deployed frontend and verify no CORS errors in the browser console
- [ ] Confirm Socket.IO connects (check Kitchen Display for real-time order updates)
- [ ] Change the seeded admin password / create a new admin and deactivate the seeded one
- [ ] Verify HTTPS is enforced (most PaaS providers do this automatically; self-hosted deployments need a reverse proxy with TLS, e.g., Caddy or Nginx + Let's Encrypt)