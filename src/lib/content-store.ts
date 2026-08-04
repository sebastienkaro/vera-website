import fs from "node:fs";
import path from "node:path";
import {
  homeContent,
  type FeatureBlockContent,
  type HeadingSegment,
  type HomeContent,
  type ImageRef,
  type LinkButton,
} from "@/lib/content";

/**
 * Where edits are kept. The editor commits this file back to the repo, so a
 * save is a commit: every change is in git history, and rolling back a bad
 * edit is `git revert`. When the file is absent — as it is until the first
 * save — the defaults in `content.ts` are what the site shows.
 */
const STORE_PATH = path.join(process.cwd(), "content", "home.json");

export const HOME_STORE_PATH = "content/home.json";

/**
 * The homepage content to render. Falls back to the built-in defaults if the
 * stored file is missing, unreadable, or fails validation — a malformed commit
 * should leave the site standing, not take it down.
 */
export function getHomeContent(): HomeContent {
  let raw: string;
  try {
    raw = fs.readFileSync(STORE_PATH, "utf8");
  } catch {
    return homeContent;
  }

  try {
    const parsed = parseHomeContent(JSON.parse(raw));
    if (parsed) return parsed;
    console.error(`${HOME_STORE_PATH} did not match the expected shape — using defaults`);
  } catch (error) {
    console.error(`${HOME_STORE_PATH} is not valid JSON — using defaults`, error);
  }

  return homeContent;
}

/**
 * Validates an unknown value as `HomeContent`, returning null if anything is
 * off. Hand-rolled rather than pulled from a schema library: the shape is small
 * and this keeps the dependency list where it is.
 */
export function parseHomeContent(value: unknown): HomeContent | null {
  if (!isRecord(value)) return null;

  const hero = isRecord(value.hero) ? value.hero : null;
  const collection = isRecord(value.collection) ? value.collection : null;
  const whyVera = isRecord(value.whyVera) ? value.whyVera : null;
  const about = isRecord(value.about) ? value.about : null;
  if (!hero || !collection || !whyVera || !about) return null;

  const heroHeadline = parseStrings(hero.headline);
  const heroKicker = parseStrings(hero.kicker);
  const heroButtons = parseButtons(hero.buttons);
  const heroBackground = parseImage(hero.background);
  if (!heroHeadline || !heroKicker || !heroButtons || !heroBackground) {
    return null;
  }

  if (!isString(collection.eyebrow)) return null;

  // Added after the first files were stored, so its absence is not a malformed
  // file: an older save falls back to the defaults for this section rather
  // than failing validation and taking the rest of the file down with it.
  const featuredMachine = isRecord(value.featuredMachine) ? value.featuredMachine : null;
  const featuredMachineContent =
    featuredMachine &&
    isString(featuredMachine.eyebrow) &&
    isString(featuredMachine.body) &&
    isString(featuredMachine.buttonLabel)
      ? {
          eyebrow: featuredMachine.eyebrow,
          body: featuredMachine.body,
          buttonLabel: featuredMachine.buttonLabel,
        }
      : homeContent.featuredMachine;

  const whyHeading = parseSegments(whyVera.heading);
  const whyBlocks = parseBlocks(whyVera.blocks);
  if (!isString(whyVera.eyebrow) || !whyHeading || !whyBlocks) return null;

  const aboutHeading = parseSegments(about.heading);
  const aboutImage = parseImage(about.image);
  const aboutButtons = parseButtons(about.buttons);
  if (!isString(about.eyebrow) || !isString(about.body) || !aboutHeading || !aboutImage || !aboutButtons) {
    return null;
  }

  return {
    hero: {
      headline: heroHeadline,
      kicker: heroKicker,
      buttons: heroButtons,
      background: heroBackground,
    },
    collection: { eyebrow: collection.eyebrow },
    featuredMachine: featuredMachineContent,
    whyVera: { eyebrow: whyVera.eyebrow, heading: whyHeading, blocks: whyBlocks },
    about: {
      eyebrow: about.eyebrow,
      heading: aboutHeading,
      body: about.body,
      image: aboutImage,
      buttons: aboutButtons,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parseStrings(value: unknown): string[] | null {
  return Array.isArray(value) && value.every(isString) ? value : null;
}

function parseImage(value: unknown): ImageRef | null {
  if (!isRecord(value)) return null;
  if (!isString(value.ref) || !isString(value.alt) || !isString(value.label)) return null;
  return { ref: value.ref, alt: value.alt, label: value.label };
}

function parseButtons(value: unknown): LinkButton[] | null {
  if (!Array.isArray(value)) return null;
  const buttons: LinkButton[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || !isString(entry.label) || !isString(entry.href)) return null;
    buttons.push({ label: entry.label, href: entry.href });
  }
  return buttons;
}

function parseSegments(value: unknown): HeadingSegment[] | null {
  if (!Array.isArray(value)) return null;
  const segments: HeadingSegment[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || !isString(entry.text)) return null;
    if (entry.tone !== "dark" && entry.tone !== "muted") return null;
    segments.push({ text: entry.text, tone: entry.tone });
  }
  return segments;
}

function parseBlocks(value: unknown): FeatureBlockContent[] | null {
  if (!Array.isArray(value)) return null;
  const blocks: FeatureBlockContent[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || !isString(entry.heading) || !isString(entry.body)) return null;
    if (entry.accentSide !== "left" && entry.accentSide !== "right") return null;
    if (entry.textSide !== "left" && entry.textSide !== "right") return null;

    const background = parseImage(entry.background);
    const accent = parseImage(entry.accent);
    if (!background || !accent) return null;

    blocks.push({
      heading: entry.heading,
      body: entry.body,
      background,
      accent,
      accentSide: entry.accentSide,
      textSide: entry.textSide,
    });
  }
  return blocks;
}
