import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <SiteImage
        src={image?.url || null}
        alt={image?.alt ?? product.title}
        label={image?.alt ?? product.title}
        className="aspect-square"
        sizes="(min-width: 640px) 25vw, 50vw"
      />
      <p className="mt-4 text-xs font-medium tracking-wide text-taupe uppercase">
        {product.vendor}
      </p>
      <p className="text-lg font-medium text-espresso group-hover:opacity-70">{product.title}</p>
      <p className="mt-1 text-sm text-espresso/60">{formatMoney(product.price)}</p>
    </Link>
  );
}
