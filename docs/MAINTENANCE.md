# Maintenance Guide

## Backups
```bash
pg_dump -U postgres -d CaféCore_db -F c -f backup_$(date +%Y%m%d).dump
```
Schedule this via cron/Task Scheduler for daily backups; retain at least 30 days. Restore with:
```bash
pg_restore -U postgres -d CaféCore_db --clean backup_YYYYMMDD.dump
```

## Updating Dependencies
```bash
cd backend && npm outdated && npm update
cd frontend && npm outdated && npm update
```
Run the full test suite (`npm test`, `npm run test:e2e`) after any update before deploying.

## Database Migrations in Production
Never run `prisma migrate dev` against production — it can prompt interactively and is meant for local development. Always use:
```bash
npx prisma migrate deploy
```

## Monitoring
- `GET /health` — wire this into an uptime monitor (UptimeRobot, Better Uptime, etc.)
- Backend logs slow queries (>200ms) automatically via Winston — watch for these in production logs as an early warning of missing indexes as data grows.
- Watch `audit_logs` table growth — no automatic archiving exists yet; consider a periodic archive/export job if it grows large (multi-year deployments).

## Log Rotation
Winston is configured to write `logs/error.log` in production. Add `logrotate` (Linux) or equivalent to prevent unbounded log file growth.