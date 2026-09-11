import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans-stack",
  display: "swap",
});

export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display-stack",
  display: "swap",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
