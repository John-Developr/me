import type { NextConfig } from "next";

/** Media Library files are served from Supabase Storage (public "media" bucket). */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  devIndicators: false,
  // Pin the project root: a stray lockfile in a parent folder otherwise
  // makes Next.js guess the wrong workspace root for file tracing.
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/media/**" }]
      : [],
  },
};

export default nextConfig;
