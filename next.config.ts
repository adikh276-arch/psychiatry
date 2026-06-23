import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/psychiatry",
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/tools/:path*",
        destination: "/:path*",
      },
      {
        source: "/trackers/:path*",
        destination: "/:path*",
      },
      {
        source: "/exercises/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
