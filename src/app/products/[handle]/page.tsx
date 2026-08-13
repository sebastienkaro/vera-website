import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductHighlights } from "@/components/product/ProductHighlights";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SampleNotice } from "@/components/product/SampleNotice";
import { getProduct, getProducts, getRelatedProducts } from "@/lib/products";
import { SAMPLE_PRODUCT_HANDLE } from "@/lib/sample-product";

export async function generateStaticParams() {
  const products = await getProducts();
  return [
    ...products.map((product) => ({ handle: product.handle })),
    // The sample listing is not part of the catalog, so it has to be named
    // here to be prerendered — see `src/lib/sample-product.ts`.
    { handle: SAMPLE_PRODUCT_HANDLE },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return {
    title: `${product.title} — Vera Coffee Solutions`,
    description: product.descriptionHtml.replace(/<[^>]+>/g, ""),
    // A demonstration page is for one audience, invited by link. Keeping it out
    // of the index also keeps it from competing with the real listing.
    ...(handle === SAMPLE_PRODUCT_HANDLE ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <>
      <Header variant="solid" />

      {handle === SAMPLE_PRODUCT_HANDLE && <SampleNotice />}

      <div className="mx-auto max-w-6xl px-8 py-16 sm:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* The gallery column carries the specifications underneath it: the
              buy column is the one that has to stay short. */}
          <div className="flex flex-col gap-12">
            <ProductGallery images={product.images} />
            <ProductDetails html={product.detailsHtml} />
          </div>
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductHighlights highlights={product.highlights} />
      <ProductSpecs product={product} />
      <RelatedProducts products={related} />
    </>
  );
}
