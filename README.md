# Vera Coffee Solutions

Website for Vera Coffee Solutions, built with [Next.js](https://nextjs.org) and
[Tailwind CSS](https://tailwindcss.com).

## Status

Early scaffold. Branding (logo, colors, fonts, copy) and final page structure
are placeholders — see `src/lib/site-config.ts` and `src/app/globals.css` for
the values to swap out once brand assets are available.

Products come from the Shopify Storefront API once it's configured — see
[Connecting Shopify](#connecting-shopify).

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project structure

- `src/app` — pages and layout (Next.js App Router)
- `src/components` — shared UI components (Header, Footer, Hero, ...)
- `src/lib/site-config.ts` — site name, nav links, tagline, contact info
- `src/lib/products.ts` — the catalog every component reads from
- `src/lib/shopify/` — Storefront API client, queries, and normalization
- `src/lib/mock-products.ts` — placeholder catalog used when Shopify is unset
- `src/app/globals.css` — theme colors and fonts

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the project
- `npm run shopify:check` — verify the Shopify credentials and catalog mapping

## Connecting Shopify

The catalog is read through `src/lib/products.ts`. When the store credentials
are present it calls the Shopify Storefront API; when they aren't it serves the
placeholder catalog in `src/lib/mock-products.ts` and logs a warning, so a fresh
clone still runs. Components never see the difference.

### 1. Create a storefront access token

In the Shopify admin: **Settings → Apps and sales channels → Develop apps →
Create an app**, then under **Configuration → Storefront API** grant at least
`unauthenticated_read_product_listings`. Install the app and copy the
**Storefront API access token** from the **API credentials** tab.

This is the public, read-only storefront token. Don't use an Admin API token.

### 2. Set the environment

Copy `.env.example` to `.env.local` and fill in:

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
```

`.env.example` documents the optional variables (API version, cache lifetime,
specs metafield). Then confirm the connection:

```bash
npm run shopify:check
```

It prints the shop it reached, how many published products the token can see,
and how each one was categorized — which is the fastest way to tell a bad token
apart from products that simply aren't published to that sales channel.

### 3. Map your products

**Categories.** The site's filter row has three buckets. Each product resolves
to one of them, in this order:

1. a `category:machines`, `category:grinders`, or `category:parts-accessories`
   tag on the product — an explicit override
2. the product type (`Espresso Machine` → machines, `Grinder` → grinders, ...)
3. any other tag, matched the same way

Anything that matches nothing lands in parts & accessories. The keyword lists
live in `resolveCategory` in `src/lib/shopify/normalize.ts`.

**Specs.** The spec table on the product page comes from a product metafield,
`custom.specs` by default (override with `SHOPIFY_SPECS_METAFIELD`). Give it
storefront access in the metafield definition, and use any of these shapes:

```json
[{ "label": "Boiler type", "value": "Dual boiler" }]
{ "Boiler type": "Dual boiler" }
["Boiler type: Dual boiler"]
```

Products without the metafield just render no spec section.

### 4. Keep the site in sync

Storefront responses are cached and revalidated every hour by default
(`SHOPIFY_REVALIDATE_SECONDS`). To have edits appear immediately, add webhooks
in **Settings → Notifications → Webhooks** for `products/create`,
`products/update`, and `products/delete`, pointed at:

```
https://<your-site>/api/shopify/revalidate
```

Copy the webhook signing secret into `SHOPIFY_WEBHOOK_SECRET`. The route
verifies Shopify's HMAC signature and rejects anything unsigned, so it won't
accept requests until that secret is set.
