import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [];
  },
  trailingSlash: false, // Optional, helps with route consistency
};

export default nextConfig;
