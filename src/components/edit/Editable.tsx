"use client";

import type { ReactNode } from "react";
import { useEditor } from "@/components/edit/EditorContext";

/**
 * Wraps a piece of text so it can be typed over in `?edit` mode. Outside the
 * editor it renders its children and nothing else — no wrapper element, no
 * styling, no effect on the page.
 *
 * The node is uncontrolled on purpose: React renders the original text once,
 * the browser owns it after that, and edits are reported up by path. Handing
 * the value back through state would re-render mid-typing and move the caret.
 */
export function Editable({
  path,
  children,
  className = "",
}: {
  // Dotted path into the content, e.g. `whyVera.blocks.0.heading`.
  path: string;
  children: ReactNode;
  className?: string;
}) {
  const { editing, setText } = useEditor();

  if (!editing) return <>{children}</>;

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      spellCheck
      // `textContent`, not `innerText`: several of these sit under
      // `text-transform: uppercase`, and innerText reports the text as
      // rendered, which would bake the styling into the saved content.
      onInput={(event) => setText(path, event.currentTarget.textContent ?? "")}
      // Paste as plain text, or the client pastes Word markup into the page.
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      className={`cursor-text rounded-[3px] outline-2 outline-offset-2 outline-sky-400/70 outline-dashed focus:outline-solid ${className}`}
    >
      {children}
    </span>
  );
}
