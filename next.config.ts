import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Pin the project root: a stray lockfile in a parent folder otherwise
  // makes Next.js guess the wrong workspace root for file tracing.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
