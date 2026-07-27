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

Product photos are **not** in this folder. They come from Shopify and are
served from `cdn.shopify.com` — to change one, change it on the product in
the Shopify admin. Alt text comes from the image's alt field in Shopify and
falls back to the product title when it's blank (most of the catalog).

`products/placeholder/` holds the throwaway photos the site used before it
was wired to Shopify. Nothing references them any more and the folder can be
deleted.

The `.gitkeep` files just keep these empty folders in git — delete one once
you've added a real image to that folder.
