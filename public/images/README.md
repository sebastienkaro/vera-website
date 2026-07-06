# Image slots

Every real photo on the site lives under one of the folders below, under an
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
| `why-vera/1/background`, `why-vera/1/accent` | 1st "Why Vera" feature block (background + accent photo) |
| `why-vera/2/background`, `why-vera/2/accent` | 2nd "Why Vera" feature block |
| `why-vera/3/background`, `why-vera/3/accent` | 3rd "Why Vera" feature block |
| `products/placeholder/<file>` | Product galleries (all products share this one folder — see below) |

Product photos are throwaway placeholders until products pull from Shopify —
accuracy doesn't matter, so they all live flat in `products/placeholder/`
instead of one folder per product, and several products intentionally share
or mismatch photos. Current filenames: `linea-mini-front-view`,
`linea-mini-side-view`, `linea-mini-steam-wand-detail`,
`linea-mini-group-head-detail`, `linea-pb-main`, `gs3-main`, `kb90-main`,
`grinder-main`, `grinder-e65t`, `grinder-shotmaster`,
`grinder-linea-mini-alt`, `accessory-portafilter`, `accessory-knockbox`.

To add another product photo, add an entry to that product's `images` array
in `src/lib/products.ts` (pick a unique `file` name) and drop a matching file
in `products/placeholder/`.

The `.gitkeep` files just keep these empty folders in git — delete one once
you've added a real image to that folder.
