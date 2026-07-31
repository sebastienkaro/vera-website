import { ContentCommitError, commitFiles, commitsConfigured } from "@/lib/content-commit";
import { isEditor } from "@/lib/edit-auth";
import { resolveAsset } from "@/lib/images";

/** Kept in step with the extensions `resolveImage` knows how to find. */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

// Vercel caps a serverless request body at around 4.5 MB, so a larger file
// would fail confusingly at the edge rather than here.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isEditor())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!commitsConfigured()) {
    return Response.json(
      { error: "Uploading isn't configured — GITHUB_TOKEN and GITHUB_REPO are missing." },
      { status: 501 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const entry = form.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return Response.json({ error: "Expected a file upload." }, { status: 400 });
  }
  if (!file) {
    return Response.json({ error: "No file was included." }, { status: 400 });
  }

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return Response.json(
      { error: "That file type isn't supported — use a JPG, PNG, WebP or AVIF." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 4 MB.` },
      { status: 413 },
    );
  }

  const name = uniqueName(baseName(file.name));
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    await commitFiles(
      [{ path: `public/images/assets/${name}.${extension}`, content: bytes }],
      `Add ${name}.${extension} from the site editor`,
    );
  } catch (error) {
    if (error instanceof ContentCommitError) {
      return Response.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }

  // The ref the caller should store; the file itself won't be servable until
  // the commit finishes deploying.
  return Response.json({ ok: true, ref: `asset:${name}` });
}

/**
 * A filename safe to put in a URL and a git path, derived from whatever the
 * browser reported. Anything outside a-z, 0-9 becomes a hyphen, which also
 * disposes of directory separators and leading dots.
 */
function baseName(original: string): string {
  const withoutExtension = original.replace(/\.[^.]+$/, "");
  const slug = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "image";
}

/**
 * Avoids silently replacing an image already in the pool under that name.
 * `resolveAsset` reads the deployed filesystem, so an image uploaded seconds
 * ago — committed but not yet deployed — isn't visible here; two uploads of
 * the same filename in quick succession can still collide.
 */
function uniqueName(base: string): string {
  if (!resolveAsset(base)) return base;

  for (let i = 2; i < 100; i++) {
    if (!resolveAsset(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}
