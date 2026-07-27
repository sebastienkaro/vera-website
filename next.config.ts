import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
        // `search` is deliberately left unset (implying `**`): Shopify appends
        // a per-asset cache-busting `?v=<timestamp>` that changes whenever an
        // image is re-uploaded, so it can't be pinned to a fixed value.
      },
    ],
  },
};

export default nextConfig;
