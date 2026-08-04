import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/CategoryPage";

export const metadata: Metadata = {
  title: "Machines — Vera Coffee Solutions",
  description:
    "Commercial espresso machines — traditional and super-automatic — sold, installed and serviced by Vera Coffee Solutions.",
};

export default function MachinesPage() {
  return <CategoryPage category="machines" />;
}
