import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image; trace from the
  // monorepo root so workspace packages are included.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Workspace packages ship TypeScript/JSX source rather than a build step.
  transpilePackages: ["@tau/ui", "@tau/identity", "@tau/curriculum", "@tau/admissions", "@tau/students", "@tau/lms", "@tau/graduation", "@tau/registration", "@tau/odl"],
};

export default nextConfig;
