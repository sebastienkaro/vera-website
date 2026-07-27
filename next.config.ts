import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product images come from Shopify's CDN. next/image rejects remote hosts
    // that aren't listed here, so the catalog won't render without this.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
