import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Workspace packages ship TypeScript/JSX source rather than a build step.
  transpilePackages: ["@tau/ui", "@tau/identity", "@tau/admissions", "@tau/curriculum", "@tau/students", "@tau/lms", "@tau/graduation", "@tau/registration"],
};

export default nextConfig;
