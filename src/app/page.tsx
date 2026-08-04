import { Hero } from "@/components/home/Hero";
import { Collection } from "@/components/home/Collection";
import { WhyVera } from "@/components/home/WhyVera";
import { FeaturedMachine } from "@/components/home/FeaturedMachine";
import { AboutVera } from "@/components/home/AboutVera";
import { EditorLogin } from "@/components/edit/EditorLogin";
import { EditorProvider } from "@/components/edit/EditorContext";
import { getHomeContent } from "@/lib/content-store";
import { editingEnabled, isEditor } from "@/lib/edit-auth";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // `?edit` on any URL opens the editor — see components/edit.
  const editRequested = "edit" in (await searchParams);
  const canEdit = editRequested && editingEnabled() && (await isEditor());

  const page = (
    <>
      <Hero />
      <Collection />
      <WhyVera />
      <FeaturedMachine />
      <AboutVera />
    </>
  );

  if (canEdit) {
    return <EditorProvider content={getHomeContent()}>{page}</EditorProvider>;
  }

  return (
    <>
      {page}
      {editRequested && editingEnabled() && <EditorLogin />}
    </>
  );
}
