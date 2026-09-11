import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript/JSX source rather than a build step.
  transpilePackages: ["@tau/ui", "@tau/identity"],
};

export default nextConfig;
