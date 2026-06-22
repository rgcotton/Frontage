import fs from 'fs';
import { resolveDiskPath } from '../../upload.js';

export function toDataUri(omId, fileRef) {
  if (!fileRef || !fileRef.mimetype?.startsWith('image/')) return null;
  try {
    const diskPath = resolveDiskPath(omId, fileRef);
    if (!fs.existsSync(diskPath)) return null;
    const buf = fs.readFileSync(diskPath);
    return `data:${fileRef.mimetype};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export function bufferToDataUri(buffer, mimetype = 'image/png') {
  if (!buffer) return null;
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}
