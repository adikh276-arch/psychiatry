import type { NextConfig } from "next";

// Ponytail pattern: No hacky rewrites. Native file-system routing only.
const nextConfig: NextConfig = {
  basePath: "/psychiatry",
  output: "standalone",
};

export default nextConfig;
