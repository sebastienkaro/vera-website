import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * Looks up `public/images/<slot>.{jpg,png,webp,avif,...}` and returns its
 * public URL, or null if no file has been dropped in that slot yet — callers
 * fall back to a placeholder in that case. Drop or delete a file to add or
 * remove an image; no code changes needed.
 */
export function resolveImage(slot: string): string | null {
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(IMAGES_DIR, `${slot}.${ext}`))) {
      return `/images/${slot}.${ext}`;
    }
  }
  return null;
}
