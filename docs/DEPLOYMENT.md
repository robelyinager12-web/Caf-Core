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

## Option B — Vercel frontend + Render backend

1. Link the repository to your Neon project and production branch with the Neon CLI, then run `neon deploy`. `DATABASE_URL` is the pooled URL for app queries; `DATABASE_URL_UNPOOLED` is the direct URL for Prisma migrations. Locally, `neon env pull` writes to the root `.env.local`, which the backend loads.
2. Push the repository to GitHub and import it into Vercel with the project **Root Directory** set to `frontend`. This establishes the production Vercel origin. Use `npm run build` as the build command and `dist` as the output directory.
3. In Render, create or sync a Blueprint from the repository using the root `render.yaml`. The service builds from `backend`, runs `prisma migrate deploy` each time the service starts, and serves `/health`. Set `DATABASE_URL_UNPOOLED` to Neon’s direct URL for migrations. Set `DATABASE_URL` to Neon’s pooled URL only when pooling is enabled for the endpoint; if pooling is disabled, use the direct URL for `DATABASE_URL` too. The current Caf-Core Neon endpoint has pooling disabled, so both variables must use the direct URL. Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to separate strong secrets. The production origin is configured as `CLIENT_URL=https://caf-core-wmyp.vercel.app`; the backend API URL is `https://caf-core.onrender.com`. After changing Render environment variables, redeploy or restart the service.
4. In Vercel, add these environment variables for the Production environment:
   - `VITE_API_BASE_URL=https://caf-core.onrender.com/api`
   - `VITE_SOCKET_URL=https://caf-core.onrender.com`
   The frontend adds `/api` if the configured API URL omits it. Production builds default to these URLs if the Vercel variables are unset.
5. Deploy or redeploy Vercel after setting the API URLs. Vite embeds these values at build time, so redeploy Vercel after changing either URL.

The Render Blueprint uses a free web-service plan, which may sleep when idle. Its filesystem is ephemeral, so uploaded menu images can be lost when the service restarts or redeploys. Use durable object storage for uploads, or configure a Render persistent disk on a plan that supports disks and set `UPLOAD_DIR` to its mount path. Vercel preview URLs are not automatically allowed by the backend's single-origin `CLIENT_URL`; configure an appropriate origin before using previews.

## Post-Deployment Checklist

- [ ] Confirm migrations completed in the Render startup logs (use `npm run prisma:migrate:deploy`, not `migrate dev`, for production)
- [ ] Seed only on first deploy — re-running the seed script is idempotent (`upsert`) but unnecessary after initial setup
- [ ] Confirm `GET /health` responds `200`
- [ ] Confirm `GET /api/public/menu?page=1&limit=100` responds `200`; if `/health` works but this endpoint returns `404`, deploy the latest backend commit and verify the service root directory/build command
- [ ] Verify the deployed frontend's API base URL matches the backend service URL configured above, then redeploy Vercel if changed
- [ ] Confirm CORS: log in from the deployed frontend and verify no CORS errors in the browser console
- [ ] Confirm Socket.IO connects (check Kitchen Display for real-time order updates)
- [ ] Change the seeded admin password / create a new admin and deactivate the seeded one
- [ ] Verify HTTPS is enforced (most PaaS providers do this automatically; self-hosted deployments need a reverse proxy with TLS, e.g., Caddy or Nginx + Let's Encrypt)