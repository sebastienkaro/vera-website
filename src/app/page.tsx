import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <section id="about" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-espresso">About</h2>
        <p className="mt-4 max-w-2xl text-espresso-light">
          Placeholder section. Replace with real content once pages and copy are
          confirmed.
        </p>
      </section>
      <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-espresso">Contact</h2>
        <p className="mt-4 max-w-2xl text-espresso-light">
          Placeholder section. Replace with a real contact form or details.
        </p>
      </section>
    </>
  );
}
