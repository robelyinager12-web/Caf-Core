# Troubleshooting

## "Database does not exist" on migration
If your database name contains the `é` character (e.g., `CaféCore_db`), some Postgres clients mishandle it. Either URL-encode it in `DATABASE_URL` (`Caf%C3%A9Core_db`) or rename the database to `CafeCore_db`.

## Kitchen Display doesn't update in real time
- Confirm `VITE_SOCKET_URL` in the frontend `.env` matches the backend's actual address (no `/api` suffix).
- Check the browser console for Socket.IO connection errors — a `401`/auth error usually means an expired access token; refreshing the page should trigger a silent token refresh.
- Confirm the backend process is the one with `initSocket()` actually running (check server logs for "Server running on port...").

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