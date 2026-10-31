# Administrator Guide

## Managing Staff
Go to **User Accounts** to see everyone with an account. Only an Admin can create staff logins, assign roles, edit names, or deactivate accounts. Give new staff their temporary password directly — there's no invite email system. You cannot deactivate or change the role of your own currently-logged-in account. Public self-registration is disabled.

The **Currently On Shift** panel shows who's clocked in right now.

## Managing the Menu
Go to **Menu → Menu Items**. Only an Admin can add or edit menu items and categories. **Add Item** lets you set a category, name, description, price, and optionally upload a photo. Toggle **Mark Unavailable** for items temporarily out of stock — this immediately hides them from the New Order screen without deleting them. Deleting an item is blocked if it's ever been part of an order (to protect historical records) — use "unavailable" instead in that case.

## Managing Inventory & Recipes
Go to **Inventory** to add ingredients and adjust stock (always requires a reason — this feeds your waste/shrinkage reports). Only an Admin can edit inventory or recipes. Recipes (which ingredients + how much a menu item consumes) currently need to be set up via direct API calls to `POST /api/recipes` — there's no dedicated recipe-editing screen yet (see Troubleshooting/Known Limitations).

## Reports
Go to **Reports** for sales trends, top-selling items, ingredient usage, and manual stock adjustment history — each with CSV export and an adjustable date range.

## Audit Log
Go to **Audit Log** (Admin only) to review every sensitive action system-wide — logins, role changes, stock adjustments, refunds, staff clock-ins. Filter by action type or entity.

## Refunds
There is currently no in-app refund button — refunds must be issued via `POST /api/payments/:orderId/refund` directly (Admin/Manager token required). This is flagged as a near-term frontend improvement.