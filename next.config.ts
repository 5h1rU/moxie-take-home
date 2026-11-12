import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The exercise has one business; real booking links always carry a slug.
  // A config redirect answers before any page renders, so `/` skips the
  // render (and the instant-navigation validation a page redirect trips).
  async redirects() {
    return [
      { source: "/", destination: "/booking/gold-spa", permanent: false },
    ];
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
