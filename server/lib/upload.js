import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { getStorageRoot } from './storagePaths.js';

const UPLOAD_ROOT = path.join(getStorageRoot(), 'uploads');

const ALLOWED_MIME = new Set([
  // images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // video
  'video/mp4',
  'video/quicktime',
  'video/webm',
  // documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid(12)}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB ceiling, generous for property videos
});

export function toFileRef(req, file) {
  return {
    id: nanoid(8),
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/${req.params.id}/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  };
}

export function resolveDiskPath(omId, fileRef) {
  return path.join(UPLOAD_ROOT, omId, fileRef.filename);
}

export { UPLOAD_ROOT };
