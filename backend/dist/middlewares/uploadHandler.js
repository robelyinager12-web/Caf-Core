"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMenuImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const uploadPath = path_1.default.join(process.cwd(), env_1.env.upload.dir);
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        // Switched from Date.now()+Math.random() to crypto.randomUUID() —
        // cryptographically unpredictable filenames, closing a theoretical
        // path where a predictable name could be guessed/overwritten by a
        // concurrent malicious upload before the original write completes.
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `menu-item-${crypto_1.default.randomUUID()}${ext}`);
    },
});
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
function fileFilter(_req, file, cb) {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    // Checking both the declared MIME type AND the file extension — a MIME
    // type header is client-supplied and trivially spoofable on its own; this
    // was the actual gap left open since Phase 6 Step 5 (which checked MIME
    // type only). True magic-byte/content sniffing would be the next level
    // beyond this, but requires an extra library (e.g. file-type) — noted
    // below as a further improvement rather than added here to avoid
    // expanding dependencies mid-hardening-pass without your sign-off.
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
        cb(new errorHandler_1.AppError('Only JPEG, PNG, or WEBP images are allowed', 422));
        return;
    }
    cb(null, true);
}
exports.uploadMenuImage = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: env_1.env.upload.maxSizeMb * 1024 * 1024,
        files: 1,
    },
});
