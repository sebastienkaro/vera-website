# Image slots

Every real photo on the site lives under one of the folders below, under an
exact filename the code already expects. Drop a file in with that name (any
of `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`) and it appears on the site —
delete it and that spot goes back to the striped placeholder. No code
changes needed either way.

| Slot | Where it shows |
| --- | --- |
| `hero/cafe-interior` | Homepage hero background |
| `about/roastery` | "About Vera" section background |
| `why-vera/1/background`, `why-vera/1/accent` | 1st "Why Vera" feature block (background + accent photo) |
| `why-vera/2/background`, `why-vera/2/accent` | 2nd "Why Vera" feature block |
| `why-vera/3/background`, `why-vera/3/accent` | 3rd "Why Vera" feature block |
| `products/linea-mini/front-view` | Linea Mini gallery |
| `products/linea-mini/side-view` | Linea Mini gallery |
| `products/linea-mini/steam-wand-detail` | Linea Mini gallery |
| `products/linea-mini/group-head-detail` | Linea Mini gallery |
| `products/linea-pb/main` | Linea PB gallery |
| `products/gs3/main` | GS3 gallery |
| `products/kb90/main` | KB90 gallery |

To add another product photo, add an entry to that product's `images` array
in `src/lib/products.ts` (pick a `file` name) and drop a matching file in
its `products/<handle>/` folder.

The `.gitkeep` files just keep these empty folders in git — delete one once
you've added a real image to that folder.
