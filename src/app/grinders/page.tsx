import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/CategoryPage";

export const metadata: Metadata = {
  title: "Grinders — Vera Coffee Solutions",
  description:
    "Commercial coffee grinders — flat burr, conical, single-dose and on-demand — matched to the machine beside them.",
};

export default function GrindersPage() {
  return <CategoryPage category="grinders" />;
}
