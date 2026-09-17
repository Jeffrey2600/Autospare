import "server-only";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

// SVG is intentionally excluded — uploaded SVGs can embed scripts (stored XSS).
// Seed placeholder images use SVG but are written directly to disk, bypassing this upload path.
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function extensionFor(file: File) {
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return map[file.type] ?? "";
}

export async function saveUploadedImage(file: File, subfolder: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported image type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Image "${file.name}" is larger than 5MB`);
  }

  const dir = path.join(UPLOAD_ROOT, subfolder);
  await mkdir(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}${extensionFor(file)}`;
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${subfolder}/${filename}`;
}

export async function deleteUploadedImage(publicUrl: string) {
  if (!publicUrl.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", publicUrl);
  try {
    await unlink(filePath);
  } catch {
    // best-effort cleanup — ignore if already gone
  }
}
