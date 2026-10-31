# Troubleshooting

## "Database does not exist" on migration
If your database name contains the `é` character (e.g., `CaféCore_db`), some Postgres clients mishandle it. Either URL-encode it in `DATABASE_URL` (`Caf%C3%A9Core_db`) or rename the database to `CafeCore_db`.

## Backend reports "Missing required environment variable: DATABASE_URL"
From the `backend` folder, create your local environment file with `cp .env.example .env` (Git Bash) or `Copy-Item .env.example .env` (PowerShell). Edit `DATABASE_URL` in `.env` to match your local PostgreSQL username, password, host, port, and database, then start the backend again with `npm run dev`.

## API requests return 401 or 403
- A `401` means the access token is expired or invalid. If its refresh token is expired or was issued by a different backend, sign in again.
- A `403` means the signed-in role cannot access that endpoint. Reports are restricted to Admin and Manager accounts; the dashboard hides those requests for other roles.
- If another checkout is already using port 5000, configure the backend `PORT` and frontend `VITE_API_BASE_URL` / `VITE_SOCKET_URL` to use the same unused port, then restart both development servers. Sign in again after switching backends.

## Kitchen Display doesn't update in real time
- Confirm `VITE_SOCKET_URL` in the frontend `.env` matches the backend's actual address (no `/api` suffix).
- Check the browser console for Socket.IO connection errors — a `401`/auth error usually means an expired access token; refreshing the page should trigger a silent token refresh.
- Confirm the backend process is the one with `initSocket()` actually running (check server logs for "Server running on port...").

## Dashboard or list data appears to be missing
- Signing in does not delete menu items, ingredients, or orders. The lists load all API pages; a failed request now shows an error and retry option instead of appearing as an empty list.
- Order History's **All** filter includes every order status. The dashboard's sales and top-selling summaries are intentionally limited to completed orders in the selected date range.
- If data is still missing, confirm the frontend and backend are connected to the expected database and that you signed in with an account that can access the page.

## "Invalid email or password" but I'm sure it's correct
- Confirm the account is active — a deactivated staff account fails login with the same generic message (this is intentional, to avoid revealing account status to an attacker).
- Passwords are case-sensitive.

## Image upload fails with 422
Only JPEG, PNG, and WEBP are accepted, and the file extension must match the actual file type (a renamed `.exe` will be rejected even if given a `.jpg` name).

## Order won't let me change status
Status can only move forward one step at a time: PENDING → PREPARING → READY → COMPLETED, or to CANCELLED from any of the first three. Skipping a step (e.g., PENDING directly to READY) is rejected by design.

## Known Limitations (not bugs)
- No self-service password reset — an Admin/Manager must edit your account.
- No recipe-editing UI — recipes are managed via direct API calls (`POST /api/recipes`).
- No refund button in the UI — refunds go through the API directly.
- Auth tokens are stored in browser localStorage, not httpOnly cookies (see `DEVELOPER_GUIDE.md` for the reasoning).