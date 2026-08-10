import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      {/*
        The inset is a percentage, not a fixed size, because the same card is
        used at very different widths — full-width on a phone, a quarter of the
        grid on a wide screen, half of it in Related Products on a phone. A
        fixed inset would leave the photo tiny in the narrow cases.
      */}
      <SiteImage
        src={image?.url || null}
        alt={image?.alt ?? product.title}
        label={image?.alt ?? product.title}
        className="relative aspect-[4/5]"
        sizes="(min-width: 640px) 25vw, 50vw"
        fit="contain"
        padding="p-[7%]"
      />
      <p className="mt-4 text-xs font-medium tracking-wide text-taupe uppercase">
        {product.vendor}
      </p>
      <p className="text-lg font-medium text-espresso group-hover:opacity-70">{product.title}</p>
      <p className="mt-1 text-sm text-espresso/60">{formatMoney(product.price)}</p>
    </Link>
  );
}
