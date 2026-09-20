import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript/JSX source rather than a build step.
  transpilePackages: ["@tau/ui", "@tau/identity", "@tau/curriculum", "@tau/admissions", "@tau/students", "@tau/lms", "@tau/graduation", "@tau/registration"],
};

export default nextConfig;
