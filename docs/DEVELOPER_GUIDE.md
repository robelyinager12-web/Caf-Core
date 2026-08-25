# Developer Guide

## Architecture at a Glance

- **Backend:** modular Express app, one folder per domain under `src/modules/`. Each module: `validation → controller → service → routes`.
- **Frontend:** React with React Query for all server state, Zustand only for client-only state (auth tokens, UI toggles).
- **Real-time:** Socket.IO for order/kitchen events and notifications; everything else is plain REST + React Query polling/invalidation.
- **Database:** PostgreSQL via Prisma. Migrations are the source of truth — never hand-edit the database schema directly.

## Adding a New Backend Module

1. Create `src/modules/<name>/` with `<name>.validation.ts`, `.service.ts`, `.controller.ts`, `.routes.ts`, following any existing module (e.g., `inventory/`) as a template.
2. Add the Prisma model to `schema.prisma`, run `npx prisma migrate dev --name add_<name>`.
3. Mount the router in `src/app.ts`.
4. Add integration tests under `tests/integration/`.

## Adding a New Frontend Page

1. Add types to `src/types/<name>.types.ts`.
2. Add a service file `src/services/<name>Service.ts` wrapping the relevant API calls.
3. Build the page under `src/pages/<name>/`, using React Query for data fetching.
4. Add the route to `src/router/AppRouter.tsx`, wrapped in `ProtectedRoute` with the correct `allowedRoles`, and lazy-load it unless it's Login/Dashboard.
5. Add a nav entry to `src/layouts/MainLayout.tsx`'s `NAV_ITEMS` with matching `roles`.

## Key Conventions

- Every mutating action that matters (stock changes, role changes, refunds, order status changes) writes to `audit_logs` via `logAudit()` — do this for any new sensitive action.
- All API responses use `sendSuccess`/`sendError` from `utils/apiResponse.ts` — never return raw objects from a controller.
- Role checks belong in `authorize(...)` at the route level for simple cases; when the rule depends on the request body (e.g., "can only act on your own record unless privileged"), push that logic into the service layer instead (see `staff.service.ts`'s `listShifts`).
- Frontend role-gating always mirrors the backend — a hidden nav link is a UX nicety, the real enforcement is server-side.

## Known Architectural Trade-offs

- Auth tokens are stored in `localStorage`, not httpOnly cookies — see the comment in `frontend/src/store/authStore.ts` for the full reasoning and what migrating away from this would involve.
- No shared types package between frontend/backend — types are manually kept in sync. Acceptable at this project's size; would need `zod`-derived shared types or a monorepo tool (Turborepo/Nx) if the codebase grows significantly.