# Images

Photos come in two kinds: **slots**, which are fixed spots on the site that
each take one specific image, and the **shared pool** in `assets/`, which is
a bag of images any spot can pull from. Slots are below; the pool is at the
bottom of this file.

## Slots

Every slot image lives under one of the folders below, under an
exact filename the code already expects. Drop a file in with that name (any
of `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`) and it appears on the site —
delete it and that spot goes back to the striped placeholder. No code
changes needed either way.

| Slot | Where it shows |
| --- | --- |
| `hero/background` | Homepage hero background |
| `hero/person` | Optional foreground cutout, layered in front of the hero text (needs real transparency — a PNG/WebP with alpha, not a flattened photo). Leave the slot empty to skip the layered effect. |
| `hero/machine` | Optional cutout of the espresso machine on the counter, layered above a looping steam animation and below the hero text (needs real transparency, same as `hero/person`). Position it so it lines up with the machine already baked into `hero/background` — see the `top`/`left` on `SteamPuff` in `Hero.tsx` if the machine's on-screen position changes and the steam needs to be re-anchored. Leave empty to skip both the cutout and the steam. |
| `about/roastery` | "About Vera" section background |
| `why-vera/2/background` | 2nd "Why Vera" feature block background |
| `why-vera/3/background`, `why-vera/3/accent` | 3rd "Why Vera" feature block |

The rest of the "Why Vera" photos come out of the shared pool instead of a
slot — the 1st block's background and accent, and the 2nd block's accent.
They're picked in `WhyVera.tsx` by name, so to change one, change the name
there rather than moving files around.

## Shared pool (`assets/`)

`assets/` is the general-purpose folder: images that aren't tied to one spot
and can be used anywhere, or moved between spots, without being renamed to
match a slot. Drop files in with whatever descriptive name you like — no
fixed filenames here — and organise them into subfolders if it helps.

In code, reach for them by name, without the extension:

```tsx
import { SiteImage } from "@/components/SiteImage";
import { resolveAsset } from "@/lib/images";

<SiteImage
  src={resolveAsset("bar-lady")}          // public/images/assets/bar-lady.avif
  alt="Barista pulling a shot"
  label="Barista"
  className="relative h-96"
/>
```

Leaving the extension off means a `.webp` can later be replaced by an `.avif`
without touching the code. A name that doesn't match any file resolves to
`null`, and `SiteImage` shows the striped placeholder instead of breaking the
page — the same behaviour as an empty slot.

`listAssets()` from the same module returns everything in the pool (`name`
plus public URL, subfolders included), for anywhere that wants to render the
whole set rather than pick one out by name.

Product photos are **not** in this folder. They come from Shopify and are
served from `cdn.shopify.com` — to change one, change it on the product in
the Shopify admin. Alt text comes from the image's alt field in Shopify and
falls back to the product title when it's blank (most of the catalog).

`products/placeholder/` holds the throwaway photos the site used before it
was wired to Shopify. Nothing references them any more and the folder can be
deleted.

The `.gitkeep` files just keep these empty folders in git — delete one once
you've added a real image to that folder.
