# Caf-Core
# CaféCore — Cafeteria Restaurant Management System

A full-stack, self-hosted management system for cafeterias and small restaurants: menu management, order processing, a real-time kitchen display, inventory tracking with recipe-based auto-deduction, payments, staff shift tracking, reporting, and an admin audit trail.

Built with React + TypeScript, Node.js + Express + Prisma, PostgreSQL, and Socket.IO — entirely on free, open-source technology.

## Quick Start

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for full setup instructions.

```bash
# Backend
cd backend
cp .env.example .env   # fill in your database credentials
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit `http://localhost:5173` and log in with the seeded admin account:
- **Email:** `admin@cafeteria.local`
- **Password:** `Admin@12345`

**Change this password immediately in any real deployment.**

## Documentation

| Guide | Purpose |
|---|---|
| [Installation](docs/INSTALLATION.md) | Full local setup, environment variables, database migration |
| [API Documentation](docs/API_DOCUMENTATION.md) | Every backend endpoint, request/response shapes, auth requirements |
| [Folder Structure](docs/FOLDER_STRUCTURE.md) | Project layout and module organization |
| [Deployment Guide](docs/DEPLOYMENT.md) | Docker-based and PaaS (Render/Railway) deployment |
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Architecture decisions, conventions, how to add a new module |
| [User Guide](docs/USER_GUIDE.md) | How to use the app as Cashier/Kitchen staff |
| [Administrator Guide](docs/ADMIN_GUIDE.md) | Managing staff, menu, inventory, reports, audit log |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and fixes |
| [Maintenance](docs/MAINTENANCE.md) | Backups, updates, monitoring |
| [Changelog](docs/CHANGELOG.md) | Version history |

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Query, Zustand, Socket.IO Client, Recharts
**Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Socket.IO, JWT, bcrypt, Zod
**Testing:** Jest, Supertest, Playwright

## License

Internal project — no license specified. Add one before any external distribution.