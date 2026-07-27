# Vera Coffee Solutions

Website for Vera Coffee Solutions, built with [Next.js](https://nextjs.org) and
[Tailwind CSS](https://tailwindcss.com).

## Status

Early scaffold. Branding (logo, colors, fonts, copy) and final page structure
are placeholders — see `src/lib/site-config.ts` and `src/app/globals.css` for
the values to swap out once brand assets are available.

## Getting Started

Install dependencies, add the Shopify credentials, and run the dev server:

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

The credentials come from the Shopify admin under **Headless → Storefront
API**. Without them the build fails immediately with a message saying which
variable is missing — the catalog is fetched at build time, so there is no
degraded mode.

## Products

The catalog is read from the Shopify Storefront API at build time. A product
appears on the site only if it belongs to one of the collections listed in
`CATEGORY_COLLECTIONS` in `src/lib/shopify.ts`, which is also what decides
whether it shows under Machines, Grinders, or Parts & Accessories. To publish
a product, add it to the relevant collection in Shopify.

Pages revalidate hourly. To push a change through sooner, call
`revalidateTag(PRODUCTS_CACHE_TAG, 'max')` from a Server Action or Route
Handler — for example from a Shopify `products/update` webhook.

## Project structure

- `src/app` — pages and layout (Next.js App Router)
- `src/components` — shared UI components (Header, Footer, Hero, ...)
- `src/lib/shopify.ts` — Storefront API client, product mapping, caching
- `src/lib/products.ts` — the app's catalog API (`getProducts`, `getProduct`)
- `src/lib/site-config.ts` — site name, nav links, tagline, contact info
- `src/app/globals.css` — theme colors and fonts

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the project
