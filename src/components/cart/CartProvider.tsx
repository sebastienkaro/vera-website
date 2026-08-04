"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { addToCart, getCart, removeCartLine, updateCartLine } from "@/lib/cart-actions";
import type { Cart } from "@/lib/types";

/**
 * The cart, as the browser sees it.
 *
 * Two things shape this component. The first is that the browser has no Shopify
 * credentials — every change goes through a Server Action in
 * `src/lib/cart-actions.ts`, which returns the whole cart, so this holds one
 * authoritative copy rather than trying to keep its own books.
 *
 * The second is that **nothing here may run on the server**. Reading the cart
 * cookie while rendering would opt every page that mounts this provider — which
 * is every page — into dynamic rendering, and the catalog is prerendered. So
 * the provider renders empty, then asks for the cart once it is in the browser.
 * One request per page load, in exchange for a site that stays static.
 */

type CartContextValue = {
  cart: Cart | null;
  /** What the badge shows: the cart's own count plus anything still in flight. */
  count: number;
  /** False until the first read comes back, so the drawer can say "loading". */
  hydrated: boolean;
  pending: boolean;
  error: string | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (merchandiseId: string, quantity?: number) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}

/**
 * What the cart looks like mid-change, before Shopify has answered.
 *
 * `pendingAdds` is counted apart from the cart because an add can't be drawn as
 * a line yet — there is no line id and no price until Shopify replies — but it
 * can be counted. That's the half worth showing immediately: the badge is what
 * the eye is on when the button is clicked.
 *
 * Quantities move optimistically; **money never does.** Totals are Shopify's to
 * compute — discounts and rounding included — so the drawer keeps showing the
 * last figure it was given rather than inventing one from float arithmetic.
 */
type CartView = { cart: Cart | null; pendingAdds: number };

type Change =
  | { type: "add"; quantity: number }
  | { type: "setQuantity"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string };

function applyChange(view: CartView, change: Change): CartView {
  if (change.type === "add") {
    return { ...view, pendingAdds: view.pendingAdds + change.quantity };
  }
  if (!view.cart) return view;

  if (change.type === "remove") {
    const line = view.cart.lines.find((entry) => entry.id === change.lineId);
    if (!line) return view;
    return {
      ...view,
      cart: {
        ...view.cart,
        totalQuantity: view.cart.totalQuantity - line.quantity,
        lines: view.cart.lines.filter((entry) => entry.id !== change.lineId),
      },
    };
  }

  const line = view.cart.lines.find((entry) => entry.id === change.lineId);
  if (!line) return view;
  return {
    ...view,
    cart: {
      ...view.cart,
      totalQuantity: view.cart.totalQuantity - line.quantity + change.quantity,
      lines: view.cart.lines.map((entry) =>
        entry.id === change.lineId ? { ...entry, quantity: change.quantity } : entry,
      ),
    },
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [view, applyOptimistic] = useOptimistic({ cart, pendingAdds: 0 }, applyChange);

  // The first read, once this is running in the browser. Deliberately an effect
  // and not server-rendered data — see the note at the top of the file.
  useEffect(() => {
    let cancelled = false;
    getCart()
      .then((result) => {
        if (cancelled) return;
        setCart(result.cart);
        setError(result.error);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(
    (change: Change, action: () => Promise<{ cart: Cart | null; error: string | null }>) => {
      startTransition(async () => {
        applyOptimistic(change);
        const result = await action();
        setCart(result.cart);
        setError(result.error);
      });
    },
    [applyOptimistic],
  );

  const add = useCallback(
    (merchandiseId: string, quantity = 1) => {
      setIsOpen(true);
      run({ type: "add", quantity }, () => addToCart(merchandiseId, quantity));
    },
    [run],
  );

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (quantity < 1) {
        run({ type: "remove", lineId }, () => removeCartLine(lineId));
        return;
      }
      run({ type: "setQuantity", lineId, quantity }, () => updateCartLine(lineId, quantity));
    },
    [run],
  );

  const remove = useCallback(
    (lineId: string) => {
      run({ type: "remove", lineId }, () => removeCartLine(lineId));
    },
    [run],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        cart: view.cart,
        count: (view.cart?.totalQuantity ?? 0) + view.pendingAdds,
        hydrated,
        pending,
        error,
        isOpen,
        open,
        close,
        add,
        setQuantity,
        remove,
      }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
