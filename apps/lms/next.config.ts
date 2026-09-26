import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript/JSX source rather than a build step.
  transpilePackages: ["@tau/ui", "@tau/identity", "@tau/students", "@tau/lms", "@tau/odl", "@tau/scheduling", "@tau/student-dashboard"],
  // Keep Turbopack inside this monorepo when another lockfile exists higher up.
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
