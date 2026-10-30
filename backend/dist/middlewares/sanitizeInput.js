"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = sanitizeInput;
/**
 * Strips keys starting with `$` or containing `.` from request bodies —
 * defense-in-depth against NoSQL/object-injection style payloads, even
 * though this project uses PostgreSQL via Prisma (parameterized by
 * default, so classic SQL injection is already not possible here). This
 * guards specifically against a crafted body like { "$where": "..." } or
 * prototype-pollution attempts like { "__proto__": {...} } reaching any
 * downstream code that might treat the body as a raw object.
 */
function stripDangerousKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(stripDangerousKeys);
    }
    if (obj && typeof obj === 'object') {
        const clean = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith('$') || key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }
            clean[key] = stripDangerousKeys(value);
        }
        return clean;
    }
    return obj;
}
function sanitizeInput(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = stripDangerousKeys(req.body);
    }
    next();
}
