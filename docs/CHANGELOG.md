# Changelog

## v1.0.0 — Initial Release

Full-stack Cafeteria Restaurant Management System, built end-to-end:

- Authentication with JWT access/refresh tokens, role-based access control (Admin, Manager, Cashier, Kitchen)
- Menu management with categories, images, and availability toggling
- Inventory tracking with recipe-based automatic deduction on order completion
- Order management with a strict lifecycle (Pending → Preparing → Ready → Completed/Cancelled)
- Real-time Kitchen Display via Socket.IO
- Payment recording (Cash/Card/Online) with PDF receipt generation and refunds
- Staff shift clock-in/clock-out tracking
- Sales, top-items, inventory usage, and stock-adjustment reporting with CSV export
- Admin-only audit log covering every sensitive action system-wide
- Performance optimizations: database-level report aggregation, indexing, response compression, frontend code-splitting and lazy loading
- Security hardening: timing-safe login, input sanitization, upload content validation, strict CSP, capped order sizes
- Automated test coverage: Jest/Supertest integration tests for auth, orders, and inventory; Playwright E2E for login and real-time kitchen flow

### Known limitations carried into v1.0.0
- No self-service password reset
- No recipe-management UI (API-only)
- No refund UI (API-only)
- Tokens stored in localStorage rather than httpOnly cookies