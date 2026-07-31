"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { HomeContent } from "@/lib/content";

/**
 * Editing state for `?edit` mode.
 *
 * Edits are collected as a path → value map rather than by re-rendering the
 * page from a draft: the text on screen is whatever the user typed into the
 * contentEditable node, so nothing needs to re-render as they type and the
 * caret never jumps. On save the collected changes are applied to a copy of
 * the content and posted.
 *
 * Outside `?edit` there is no provider, and the default below makes every
 * editable wrapper render its children untouched.
 */
type EditorValue = {
  editing: boolean;
  /** Records a text change at e.g. `hero.headline.0` or `about.body`. */
  setText: (path: string, value: string) => void;
  /** Uploads a replacement image and records it at e.g. `about.image`. */
  replaceImage: (path: string, file: File) => Promise<void>;
  /** Object URLs for images replaced in this session, keyed by the same path. */
  previews: Record<string, string>;
  /** Path currently uploading, so one button can show progress. */
  uploading: string | null;
};

const EditorContext = createContext<EditorValue>({
  editing: false,
  setText: () => {},
  replaceImage: async () => {},
  previews: {},
  uploading: null,
});

export function useEditor(): EditorValue {
  return useContext(EditorContext);
}

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

export function EditorProvider({ content, children }: { content: HomeContent; children: ReactNode }) {
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const setText = useCallback((path: string, value: string) => {
    setChanges((current) => ({ ...current, [path]: value }));
    setStatus({ kind: "idle" });
  }, []);

  const replaceImage = useCallback(async (path: string, file: File) => {
    setUploading(path);
    setStatus({ kind: "idle" });
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/edit/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "The upload failed.");

      // The uploaded file isn't servable until the commit deploys, so the
      // preview shown until then is the local copy straight off their disk.
      setChanges((current) => ({ ...current, [`${path}.ref`]: result.ref }));
      setPreviews((current) => ({ ...current, [path]: URL.createObjectURL(file) }));
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "The upload failed." });
    } finally {
      setUploading(null);
    }
  }, []);

  const save = useCallback(async () => {
    setStatus({ kind: "saving" });
    try {
      const response = await fetch("/api/edit/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(applyChanges(content, changes)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "The save failed.");
      setChanges({});
      setStatus({ kind: "saved" });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "The save failed." });
    }
  }, [content, changes]);

  // The page is still a working site in edit mode, so a stray click on a nav
  // link would navigate away. Unsaved edits live only in this tab's memory.
  const unsaved = Object.keys(changes).length > 0;
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const value = useMemo<EditorValue>(
    () => ({ editing: true, setText, replaceImage, previews, uploading }),
    [setText, replaceImage, previews, uploading],
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
      <SaveBar
        count={Object.keys(changes).length}
        status={status}
        onSave={save}
        onDiscard={() => window.location.reload()}
      />
    </EditorContext.Provider>
  );
}

function SaveBar({
  count,
  status,
  onSave,
  onDiscard,
}: {
  count: number;
  status: Status;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const message =
    status.kind === "error"
      ? status.message
      : status.kind === "saving"
        ? "Saving…"
        : status.kind === "saved"
          ? "Saved — your changes go live in about a minute."
          : count === 0
            ? "Click any text to change it, or use Replace on a photo."
            : `${count} unsaved ${count === 1 ? "change" : "changes"}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/15 bg-neutral-900/95 px-4 py-3 text-sm text-white backdrop-blur">
      <span className="font-medium">Editing this page</span>
      <span className={status.kind === "error" ? "text-red-300" : "text-white/60"}>{message}</span>

      <div className="ml-auto flex items-center gap-2">
        {count > 0 && (
          <button
            type="button"
            onClick={onDiscard}
            className="cursor-pointer px-3 py-2 text-white/70 underline-offset-4 hover:underline"
          >
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={count === 0 || status.kind === "saving"}
          className="cursor-pointer rounded bg-white px-4 py-2 font-medium text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status.kind === "saving" ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

/**
 * Applies the collected changes to a copy of the content. Paths are dotted, and
 * numeric segments index into arrays: `whyVera.blocks.0.heading`. A path that
 * doesn't lead anywhere is skipped rather than throwing, so a stale editor tab
 * can't corrupt a save.
 */
export function applyChanges(content: HomeContent, changes: Record<string, string>): HomeContent {
  const next = structuredClone(content) as unknown as Record<string, unknown>;

  for (const [path, value] of Object.entries(changes)) {
    const segments = path.split(".");
    const last = segments.pop();
    if (!last) continue;

    let target: unknown = next;
    for (const segment of segments) {
      if (typeof target !== "object" || target === null) break;
      target = (target as Record<string, unknown>)[segment];
    }

    if (typeof target === "object" && target !== null) {
      (target as Record<string, unknown>)[last] = value;
    }
  }

  return next as unknown as HomeContent;
}
