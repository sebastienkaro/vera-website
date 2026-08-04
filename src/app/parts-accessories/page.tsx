import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/CategoryPage";

export const metadata: Metadata = {
  title: "Parts & Accessories — Vera Coffee Solutions",
  description:
    "Gaskets, baskets, filters, tampers and spares for commercial espresso equipment, stocked and shipped from Bridgeport, CT.",
};

export default function PartsAccessoriesPage() {
  return <CategoryPage category="parts-accessories" />;
}
