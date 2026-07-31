import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const ASSETS_DIR = path.join(IMAGES_DIR, "assets");
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

/**
 * Same lookup, against the shared pool in `public/images/assets/` — photos
 * that aren't tied to one spot on the site and can be swapped between spots
 * freely. Pass the name without its extension (`resolveAsset("roastery-wide")`,
 * or `resolveAsset("textures/burlap")` for a file in a subfolder) so a `.webp`
 * can be replaced by a `.avif` without touching the caller.
 */
export function resolveAsset(name: string): string | null {
  return resolveImage(path.posix.join("assets", name));
}

/**
 * Every image in the shared pool, sorted by name, each with the name to pass
 * to `resolveAsset` and its public URL. Subfolders are included, with their
 * name prefixed (`textures/burlap`). Returns an empty list while the folder
 * doesn't exist yet.
 */
export function listAssets(): { name: string; src: string }[] {
  return readAssets(ASSETS_DIR, "").sort((a, b) => a.name.localeCompare(b.name));
}

function readAssets(dir: string, prefix: string): { name: string; src: string }[] {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries.flatMap((entry) => {
    if (entry.isDirectory()) {
      return readAssets(path.join(dir, entry.name), `${prefix}${entry.name}/`);
    }

    const ext = path.extname(entry.name).slice(1).toLowerCase();
    if (!EXTENSIONS.includes(ext)) {
      return [];
    }

    const name = `${prefix}${path.basename(entry.name, path.extname(entry.name))}`;
    return [{ name, src: `/images/assets/${name}.${ext}` }];
  });
}
