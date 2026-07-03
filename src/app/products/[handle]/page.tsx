import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getProduct, getProducts } from "@/lib/products";

export function generateStaticParams() {
  return getProducts().map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) return {};
  return {
    title: `${product.title} — Vera Coffee Solutions`,
    description: product.descriptionHtml.replace(/<[^>]+>/g, ""),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  const related = getProducts().filter((item) => item.handle !== product.handle);

  return (
    <>
      <Header variant="solid" />

      <div className="mx-auto max-w-6xl px-8 py-16 sm:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <ProductGallery images={product.images} />
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductSpecs specs={product.specs} />
      <RelatedProducts products={related} />
    </>
  );
}
