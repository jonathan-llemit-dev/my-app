import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // next/image refuses to optimize a remote URL unless its origin is
  // allow-listed here. The Fake Store API serves product photos from
  // https://fakestoreapi.com/img/... — without this the optimizer answers 400.
  // Narrow `pathname` as much as you can: it is an SSRF guard, not just a hint.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        pathname: "/img/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
