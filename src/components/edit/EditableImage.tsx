"use client";

import { useRef, type ReactNode } from "react";
import { useEditor } from "@/components/edit/EditorContext";

/**
 * Adds a Replace button over an image in `?edit` mode. Outside the editor it
 * renders its children untouched.
 *
 * The wrapper uses `display: contents` so it generates no box of its own —
 * these images are absolutely positioned by their parents, and any real
 * wrapper element would break that layout. The Replace button positions itself
 * against whichever ancestor is positioned, which is the same one the image
 * sits against.
 */
export function EditableImage({
  path,
  previewClassName,
  children,
}: {
  // Dotted path to the image in the content, e.g. `whyVera.blocks.0.accent`.
  path: string;
  // Classes matching the image being replaced, so the local preview occupies
  // exactly the same box.
  previewClassName: string;
  children: ReactNode;
}) {
  const { editing, replaceImage, previews, uploading } = useEditor();
  const input = useRef<HTMLInputElement>(null);

  if (!editing) return <>{children}</>;

  const preview = previews[path];
  const busy = uploading === path;

  return (
    <div style={{ display: "contents" }}>
      {preview ? (
        // Deliberately a plain <img>: the file is a local object URL that
        // hasn't been deployed yet, so next/image can't optimize it.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className={previewClassName} />
      ) : (
        children
      )}

      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="absolute top-3 left-3 z-50 cursor-pointer rounded bg-neutral-900/85 px-3 py-1.5 text-xs font-medium text-white backdrop-blur disabled:opacity-60"
      >
        {busy ? "Uploading…" : preview ? "Replace again" : "Replace photo"}
      </button>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so choosing the same file twice still fires a change.
          event.target.value = "";
          if (file) void replaceImage(path, file);
        }}
      />
    </div>
  );
}
