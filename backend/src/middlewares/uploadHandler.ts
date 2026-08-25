import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from './errorHandler';

const uploadPath = path.join(process.cwd(), env.upload.dir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    // Switched from Date.now()+Math.random() to crypto.randomUUID() —
    // cryptographically unpredictable filenames, closing a theoretical
    // path where a predictable name could be guessed/overwritten by a
    // concurrent malicious upload before the original write completes.
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `menu-item-${crypto.randomUUID()}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();

  // Checking both the declared MIME type AND the file extension — a MIME
  // type header is client-supplied and trivially spoofable on its own; this
  // was the actual gap left open since Phase 6 Step 5 (which checked MIME
  // type only). True magic-byte/content sniffing would be the next level
  // beyond this, but requires an extra library (e.g. file-type) — noted
  // below as a further improvement rather than added here to avoid
  // expanding dependencies mid-hardening-pass without your sign-off.
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new AppError('Only JPEG, PNG, or WEBP images are allowed', 422));
    return;
  }
  cb(null, true);
}

export const uploadMenuImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxSizeMb * 1024 * 1024,
    files: 1,
  },
});