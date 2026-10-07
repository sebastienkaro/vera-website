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
| `hero/background` | Homepage hero — the still behind the hero video. It is what paints first, and what stays on screen whenever the video doesn't play: no footage in `public/videos/`, a video that fails to load, or a visitor who has asked for reduced motion. Worth keeping it a frame the hero reads well on. |

Only `hero/background` is still in use. The other slot files (`about/roastery`,
`why-vera/2/*`, `why-vera/3/*`) are left over from before the Vera shoot.
Nothing points at them any more, and they can be deleted.

Every other photo on the site comes from the shared pool, picked by name:

| Where it shows | Set in |
| --- | --- |
| Homepage: featured machine, the three "Why Vera" cards, About Vera | `content/home.json` |
| White Label page: hero and the two photo blocks | `src/app/white-label/page.tsx` |
| Resources page: hero and the six guide cards | `src/app/resources/page.tsx` |
| Quote page: hero | `src/app/quote/page.tsx` |
| Menu panels (Machines, Grinders, Parts & Accessories) | `src/lib/nav-menu.ts` |

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

## Photo library

The Vera shoot lives in two subfolders of the pool. To use one anywhere on the
site, ask for it by the name below (for example "swap the About background for
`white-label-roastery/vera-white-label-roastery-cupping-lab-wide`"). Shortened
forms are fine too: "the cupping-lab-wide roastery shot" is enough to find it.

### `in-context-cafe/` (33 photos)

- `in-context-cafe/vera-in-context-cafe-bar-grinder-matcha-whisk`
- `in-context-cafe/vera-in-context-cafe-bar-grinders-espresso-machine`
- `in-context-cafe/vera-in-context-cafe-bar-reflection-through-window`
- `in-context-cafe/vera-in-context-cafe-bar-through-glass`
- `in-context-cafe/vera-in-context-cafe-bar-wide-record-shelf`
- `in-context-cafe/vera-in-context-cafe-barista-dosing-grinder`
- `in-context-cafe/vera-in-context-cafe-barista-espresso-machine-prep`
- `in-context-cafe/vera-in-context-cafe-barista-locking-portafilter`
- `in-context-cafe/vera-in-context-cafe-barista-pouring-grinders-cup-stacks`
- `in-context-cafe/vera-in-context-cafe-barista-steaming-milk`
- `in-context-cafe/vera-in-context-cafe-brass-roaster-detail`
- `in-context-cafe/vera-in-context-cafe-espresso-grinder-on-counter`
- `in-context-cafe/vera-in-context-cafe-espresso-machine-branded-panel`
- `in-context-cafe/vera-in-context-cafe-espresso-machine-detail`
- `in-context-cafe/vera-in-context-cafe-espresso-machine-gauge-closeup`
- `in-context-cafe/vera-in-context-cafe-espresso-machine-glassware`
- `in-context-cafe/vera-in-context-cafe-espresso-machine-group-head-detail`
- `in-context-cafe/vera-in-context-cafe-espresso-machine-moody`
- `in-context-cafe/vera-in-context-cafe-espresso-machine-record-shelf`
- `in-context-cafe/vera-in-context-cafe-espresso-shot-pulling-into-cup`
- `in-context-cafe/vera-in-context-cafe-grinder-barista-background`
- `in-context-cafe/vera-in-context-cafe-grinders-cup-stacks`
- `in-context-cafe/vera-in-context-cafe-interior-bar-wide-01`
- `in-context-cafe/vera-in-context-cafe-interior-bar-wide-02`
- `in-context-cafe/vera-in-context-cafe-interior-bar-wide-03`
- `in-context-cafe/vera-in-context-cafe-interior-counter-customer`
- `in-context-cafe/vera-in-context-cafe-la-marzocco-cups-on-top`
- `in-context-cafe/vera-in-context-cafe-pastry-counter-retail-bag`
- `in-context-cafe/vera-in-context-cafe-retail-bag-cup-stacks-01`
- `in-context-cafe/vera-in-context-cafe-retail-bag-cup-stacks-02`
- `in-context-cafe/vera-in-context-cafe-retail-bags-warm-shelf`
- `in-context-cafe/vera-in-context-cafe-retail-shelving-books`
- `in-context-cafe/vera-in-context-cafe-wholesale-bags-on-shelves`

### `white-label-roastery/` (48 photos)

- `white-label-roastery/vera-white-label-roastery-bag-lineup-on-conveyor`
- `white-label-roastery/vera-white-label-roastery-cooling-tray-beans-dropping`
- `white-label-roastery/vera-white-label-roastery-cooling-tray-beans-motion`
- `white-label-roastery/vera-white-label-roastery-cooling-tray-beans-stirring`
- `white-label-roastery/vera-white-label-roastery-cooling-tray-chute-scale`
- `white-label-roastery/vera-white-label-roastery-cupping-breaking-crust`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-batch-brewer`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-brew-station`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-cup-shelves`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-cup-shelves-wide`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-espresso-machine-detail`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-grinder-detail`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-grinder-espresso`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-grinder-kettle`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-tool-shelf`
- `white-label-roastery/vera-white-label-roastery-cupping-lab-wide`
- `white-label-roastery/vera-white-label-roastery-cupping-slurping-spoon`
- `white-label-roastery/vera-white-label-roastery-green-coffee-sacks-pallets`
- `white-label-roastery/vera-white-label-roastery-green-coffee-sacks-shelving`
- `white-label-roastery/vera-white-label-roastery-green-coffee-sacks-storage-bins`
- `white-label-roastery/vera-white-label-roastery-lab-moisture-meter-shelf`
- `white-label-roastery/vera-white-label-roastery-retail-bag-on-conveyor`
- `white-label-roastery/vera-white-label-roastery-retail-bags-on-conveyor-closeup`
- `white-label-roastery/vera-white-label-roastery-roasted-beans-pouring-from-hopper-01`
- `white-label-roastery/vera-white-label-roastery-roasted-beans-pouring-from-hopper-02`
- `white-label-roastery/vera-white-label-roastery-roasted-beans-pouring-front-view`
- `white-label-roastery/vera-white-label-roastery-roasted-beans-pouring-low-angle`
- `white-label-roastery/vera-white-label-roastery-roasted-beans-weigh-bin-scale`
- `white-label-roastery/vera-white-label-roastery-roaster-candid-through-machinery`
- `white-label-roastery/vera-white-label-roastery-roaster-checking-cooling-tray-01`
- `white-label-roastery/vera-white-label-roastery-roaster-checking-cooling-tray-02`
- `white-label-roastery/vera-white-label-roastery-roaster-operating-loring`
- `white-label-roastery/vera-white-label-roastery-roaster-over-shoulder-destoner`
- `white-label-roastery/vera-white-label-roastery-roaster-portrait-seated-loring-01`
- `white-label-roastery/vera-white-label-roastery-roaster-portrait-seated-loring-02`
- `white-label-roastery/vera-white-label-roastery-roaster-portrait-seated-wide`
- `white-label-roastery/vera-white-label-roastery-roaster-portrait-standing-loring`
- `white-label-roastery/vera-white-label-roastery-roaster-portrait-warehouse`
- `white-label-roastery/vera-white-label-roastery-roaster-sight-glass-detail`
- `white-label-roastery/vera-white-label-roastery-roastery-floor-wide`
- `white-label-roastery/vera-white-label-roastery-roasting-team-at-control-station`
- `white-label-roastery/vera-white-label-roastery-roasting-team-duo-portrait`
- `white-label-roastery/vera-white-label-roastery-sample-roaster`
- `white-label-roastery/vera-white-label-roastery-warehouse-aisle-bins`
- `white-label-roastery/vera-white-label-roastery-warehouse-aisle-bulk-bags`
- `white-label-roastery/vera-white-label-roastery-warehouse-aisle-green-coffee`
- `white-label-roastery/vera-white-label-roastery-warehouse-aisle-shelving`
- `white-label-roastery/vera-white-label-roastery-warehouse-bins-and-sacks`
