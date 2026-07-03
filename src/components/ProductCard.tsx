import Link from "next/link";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { formatMoney } from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <PlaceholderImage
        label={product.images[0]?.alt ?? product.title}
        className="aspect-square"
      />
      <p className="mt-4 text-xs font-medium tracking-wide text-taupe uppercase">
        {product.vendor}
      </p>
      <p className="text-lg font-medium text-espresso group-hover:opacity-70">{product.title}</p>
      <p className="mt-1 text-sm text-espresso/60">{formatMoney(product.price)}</p>
    </Link>
  );
}
