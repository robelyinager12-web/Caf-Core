# API Documentation

Base URL: `http://localhost:5000/api` (adjust for your deployment)

All authenticated endpoints require a header: `Authorization: Bearer <accessToken>`

All responses follow this shape:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { },
  "meta": { }
}
```
Errors:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { }
}
```

## Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Returns access + refresh tokens |
| POST | `/auth/register` | Admin, Manager | Creates a new staff account |
| POST | `/auth/refresh` | Public (valid refresh token) | Issues a new access token |

## Users
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin, Manager | Paginated staff list, filterable by role/isActive |
| GET | `/users/:id` | Admin, Manager | Single user |
| PATCH | `/users/:id` | Admin, Manager | Update name/role/active status |
| DELETE | `/users/:id` | Admin | Deactivate a user |

## Categories & Menu
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/categories` | Any authenticated | List categories |
| POST | `/categories` | Admin, Manager | Create category |
| PATCH `/DELETE` | `/categories/:id` | Admin, Manager | Update/delete (blocked if items exist) |
| GET | `/menu` | Any authenticated | List menu items, filter by category/availability/search |
| GET | `/menu/:id` | Any authenticated | Single item with recipe |
| POST | `/menu` | Admin, Manager | Create (multipart/form-data, optional `image`) |
| PATCH | `/menu/:id` | Admin, Manager | Update (multipart/form-data) |
| DELETE | `/menu/:id` | Admin, Manager | Delete (blocked if referenced by any order) |

## Inventory & Recipes
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/inventory` | Admin, Manager, Kitchen | List ingredients + stock |
| POST | `/inventory` | Admin, Manager | Create ingredient with initial stock |
| POST | `/inventory/:id/adjust` | Admin, Manager | Manual stock adjustment (requires `reason`) |
| PATCH | `/inventory/:id/threshold` | Admin, Manager | Update low-stock threshold |
| GET | `/recipes/menu-item/:id` | Any authenticated | Recipe for a menu item |
| POST | `/recipes` | Admin, Manager | Upsert a recipe line |
| DELETE | `/recipes/:id` | Admin, Manager | Remove a recipe line |

## Orders
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/orders` | Admin, Manager, Cashier | Create an order (max 50 line items, max 50 qty each) |
| GET | `/orders` | Admin, Manager, Cashier, Kitchen | List orders, filter by status/type/date |
| GET | `/orders/history` | Admin, Manager | Past orders (defaults to COMPLETED) |
| GET | `/orders/:id` | Admin, Manager, Cashier, Kitchen | Single order |
| PATCH | `/orders/:id/status` | Admin, Manager, Cashier, Kitchen | Transition status (enforces valid lifecycle) |

## Payments
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/payments` | Admin, Manager, Cashier | Record payment (amount must match order total) |
| GET | `/payments/summary/daily` | Admin, Manager | Daily totals by method |
| GET | `/payments/:orderId` | Admin, Manager, Cashier | Payment for an order |
| GET | `/payments/:orderId/receipt` | Admin, Manager, Cashier | PDF receipt (streamed) |
| POST | `/payments/:orderId/refund` | Admin, Manager | Refund (requires `reason`) |

## Staff & Shifts
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/staff/clock-in` | Any authenticated | Self clock-in (or specify `userId` if Admin/Manager) |
| POST | `/staff/clock-out` | Any authenticated | Self clock-out |
| GET | `/staff/active` | Admin, Manager | Currently clocked-in staff |
| GET | `/staff/shifts` | Any authenticated | Own shifts (Admin/Manager can filter by any `userId`) |

## Reports (Admin, Manager only)
| Method | Path | Description |
|---|---|---|
| GET | `/reports/sales-summary?dateFrom&dateTo` | Revenue totals + daily breakdown |
| GET | `/reports/top-items?dateFrom&dateTo&limit` | Best-selling items |
| GET | `/reports/inventory-usage?dateFrom&dateTo` | Ingredient consumption from completed orders |
| GET | `/reports/stock-adjustments?dateFrom&dateTo` | Manual adjustment audit trail |

All report date ranges are capped at 366 days.

## Audit Log (Admin only)
| Method | Path | Description |
|---|---|---|
| GET | `/audit?action&entityType&userId&dateFrom&dateTo` | Filtered audit trail |
| GET | `/audit/actions` | Distinct action types that exist in the log |

## Notifications
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/notifications?unreadOnly` | Any authenticated | Role-matched + broadcast notifications |
| PATCH | `/notifications/:id/read` | Any authenticated | Mark read |

## Real-Time Events (Socket.IO)

Connect with `auth: { token: <accessToken> }`. Clients join a room per role (`role:KITCHEN`, `role:MANAGER`, etc.).

| Event | Emitted To | Payload |
|---|---|---|
| `order:created` | Kitchen, Manager, Admin | Full order object |
| `order:statusChanged` | Kitchen, Manager, Admin | Full order object |
| `notification:new` | Matching role or all | Notification object |