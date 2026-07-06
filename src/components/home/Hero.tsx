import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { SiteImage } from "@/components/SiteImage";
import { SteamPuff } from "@/components/home/SteamPuff";
import { resolveImage } from "@/lib/images";

export function Hero() {
  const personSrc = resolveImage("hero/person");
  const machineSrc = resolveImage("hero/machine");

  return (
    <section className="relative flex h-screen flex-col overflow-hidden">
      <SiteImage
        src={resolveImage("hero/background")}
        alt="Vera Coffee Solutions café interior"
        label="Café interior — hero photo"
        className="absolute inset-0"
        preload
      />

      {machineSrc && (
        <>
          {/* Roughly where the group head sits on the machine cutout below —
              rises up from behind it so the machine hides the puff's origin. */}
          <SteamPuff className="top-[41%] left-[68%] z-[6] h-28 w-20" />
          <Image
            src={machineSrc}
            alt=""
            fill
            sizes="100vw"
            preload
            className="pointer-events-none absolute inset-0 z-[8] object-cover"
          />
        </>
      )}

      <Header />

      <div className="flex flex-1 flex-col justify-between px-8 pt-40 pb-16 sm:px-12">
        <h1 className="relative z-10 text-[7.5vw] leading-[1.05] font-normal tracking-[-0.02em] text-cream uppercase sm:hidden">
          <span className="block">Equipment built for</span>
          <span className="block">those who demand</span>
          <span className="block">the best</span>
        </h1>

        <h1 className="relative z-10 hidden text-[max(2rem,7vw)] leading-[0.95] font-normal tracking-[-0.04em] text-cream uppercase sm:flex sm:flex-col">
          <span>Equipment built for</span>
          <span className="pl-[10vw]">those who demand</span>
          <span className="pl-[50vw]">the best</span>
        </h1>

        <div className="relative z-20 flex flex-col items-start gap-6 self-start text-left sm:items-end sm:self-end sm:text-right">
          <p className="text-base font-medium tracking-wide text-cream uppercase sm:text-sm">
            Take a look at our collection
            <br />
            or get a custom quote
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/machines"
              className="bg-cream px-6 py-3.5 text-center text-sm font-medium tracking-wide whitespace-nowrap text-espresso uppercase transition-opacity hover:opacity-90 sm:text-xs"
            >
              Browse Machines
            </Link>
            <Link
              href="/quote"
              className="border border-cream px-6 py-3.5 text-center text-sm font-medium tracking-wide whitespace-nowrap text-cream uppercase transition-colors hover:bg-cream hover:text-espresso sm:text-xs"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>

      {personSrc && (
        <Image
          src={personSrc}
          alt=""
          fill
          sizes="100vw"
          preload
          className="pointer-events-none absolute inset-0 z-[15] object-cover"
        />
      )}
    </section>
  );
}
