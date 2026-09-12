"use client";

import { ConfigurationProvider } from "@/features/configuration/configuration-store";

export default function ConfigurationLayout({ children }: { children: React.ReactNode }) {
  return <ConfigurationProvider>{children}</ConfigurationProvider>;
}
