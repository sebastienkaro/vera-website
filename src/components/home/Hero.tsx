import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { SiteImage } from "@/components/SiteImage";
import { SteamPuff } from "@/components/home/SteamPuff";
import { HeroProductDeck } from "@/components/home/HeroProductDeck";
import { Editable } from "@/components/edit/Editable";
import { EditableImage } from "@/components/edit/EditableImage";
import { resolveRef } from "@/lib/content";
import { getHomeContent } from "@/lib/content-store";
import { getHeroMachines } from "@/lib/products";

export async function Hero() {
  const { headline, kicker, buttons, featured, background, person, machine } = getHomeContent().hero;
  const personSrc = resolveRef(person);
  const machineSrc = resolveRef(machine);
  const machines = await getHeroMachines();

  return (
    <section className="relative flex h-screen flex-col overflow-hidden">
      <EditableImage path="hero.background" previewClassName="absolute inset-0 h-full w-full object-cover">
        <SiteImage
          src={resolveRef(background)}
          alt={background.alt}
          label={background.label}
          className="absolute inset-0"
          preload
        />
      </EditableImage>

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
          {headline.map((line, i) => (
            <span key={i} className="block">
              <Editable path={`hero.headline.${i}`}>{line}</Editable>
            </span>
          ))}
        </h1>

        {/* Same lines, staggered left-to-right — the indents are per-line, so
            they're keyed off position rather than living in the content. */}
        <h1 className="relative z-10 hidden text-[max(2rem,7vw)] leading-[0.95] font-normal tracking-[-0.04em] text-cream uppercase sm:flex sm:flex-col">
          {headline.map((line, i) => (
            <span key={i} className={["", "pl-[10vw]", "pl-[50vw]"][i] ?? ""}>
              <Editable path={`hero.headline.${i}`}>{line}</Editable>
            </span>
          ))}
        </h1>

        {/* The deck sits opposite the kicker so the two share the bottom band:
            cards on the left, the call to action on the right. */}
        <div className="relative z-20 flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
          <HeroProductDeck products={machines} eyebrow={featured.eyebrow} />

          <div className="flex flex-col items-start gap-6 text-left sm:ml-auto sm:items-end sm:text-right">
            <p className="text-base font-medium tracking-wide text-cream uppercase sm:text-sm">
              {kicker.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  <Editable path={`hero.kicker.${i}`}>{line}</Editable>
                </span>
              ))}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {buttons.map((button, i) => (
                <Link
                  key={button.href}
                  href={button.href}
                  // First button is the solid one, the rest are outlined.
                  className={
                    i === 0
                      ? "bg-cream px-6 py-3.5 text-center text-sm font-medium tracking-wide whitespace-nowrap text-espresso uppercase transition-opacity hover:opacity-90 sm:text-xs"
                      : "border border-cream px-6 py-3.5 text-center text-sm font-medium tracking-wide whitespace-nowrap text-cream uppercase transition-colors hover:bg-cream hover:text-espresso sm:text-xs"
                  }
                >
                  {button.label}
                </Link>
              ))}
            </div>
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
