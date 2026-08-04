"use client";

import { useEffect } from "react";

/**
 * How many things currently want the page held still, and what `overflow` was
 * before the first of them asked.
 *
 * The count is what makes this safe to use from more than one place at once.
 * The site has two overlays — the header's mobile menu and the cart drawer —
 * and each used to save and restore `document.body.style.overflow` on its own.
 * With both open, whichever closed second would restore the value it captured
 * *while the page was already locked*, leaving the page stuck. Counting means
 * the original value is captured once and put back once, by the last one out.
 */
let holders = 0;
let restoreTo = "";

/** Holds the page still while `locked` is true. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    if (holders === 0) {
      restoreTo = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    holders += 1;

    return () => {
      holders -= 1;
      if (holders === 0) document.body.style.overflow = restoreTo;
    };
  }, [locked]);
}
