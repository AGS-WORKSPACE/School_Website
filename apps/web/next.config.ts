import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Workspace packages ship TypeScript/JSX source rather than a build step.
  transpilePackages: ["@tau/ui"],
};

export default nextConfig;
