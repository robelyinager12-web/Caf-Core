
import multer from 'multer';
import path from 'path';
import { env } from '../config/env';
import { AppError } from './errorHandler';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    !ALLOWED_MIME_TYPES.includes(file.mimetype) ||
    !ALLOWED_EXTENSIONS.includes(ext)
  ) {
    cb(new AppError('Only JPEG, PNG, or WEBP images are allowed', 422));
    return;
  }

  cb(null, true);
}

export const uploadMenuImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: env.upload.maxSizeMb * 1024 * 1024,
    files: 1,
  },
});
