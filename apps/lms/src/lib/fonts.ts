import { DM_Sans } from "next/font/google";

export const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-stack",
  display: "swap",
});

export const fontDisplay = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display-stack",
  weight: ["500", "700", "800"],
  display: "swap",
});
