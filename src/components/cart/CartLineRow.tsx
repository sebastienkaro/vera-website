"use client";

import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";
import type { CartLine } from "@/lib/types";

/** One line of the cart: what it is, how many, what that comes to. */
export function CartLineRow({ line }: { line: CartLine }) {
  const { setQuantity, remove, pending, close } = useCart();

  return (
    <li className="flex gap-4 border-b border-espresso/10 py-6">
      {/* `contain`, like the product cards: the catalog shoots on white, and a
          machine cropped to a square would lose its own silhouette. */}
      <div className="relative aspect-square w-20 shrink-0 bg-sand">
        <SiteImage
          src={line.image?.url ?? null}
          alt=""
          label={line.productTitle}
          className="absolute inset-0"
          fit="contain"
          padding="p-2"
          sizes="80px"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/products/${line.productHandle}`}
          onClick={close}
          className="text-sm font-medium text-espresso hover:opacity-70"
        >
          {line.productTitle}
        </Link>
        {line.variantTitle && (
          <p className="mt-1 text-xs text-espresso/60">{line.variantTitle}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="inline-flex items-center border border-espresso/20">
            <button
              type="button"
              onClick={() => setQuantity(line.id, line.quantity - 1)}
              disabled={pending}
              aria-label={`Reduce quantity of ${line.productTitle}`}
              className="px-3 py-1.5 text-sm text-espresso transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm tabular-nums">{line.quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(line.id, line.quantity + 1)}
              disabled={pending}
              aria-label={`Increase quantity of ${line.productTitle}`}
              className="px-3 py-1.5 text-sm text-espresso transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <p className="text-sm tabular-nums text-espresso">{formatMoney(line.lineTotal)}</p>
        </div>

        <button
          type="button"
          onClick={() => remove(line.id)}
          disabled={pending}
          className="mt-2 self-start text-xs tracking-wide text-taupe uppercase transition-colors hover:text-espresso disabled:opacity-40"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
