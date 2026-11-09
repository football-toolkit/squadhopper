import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { APP_NAME } from "@/lib/app-name";
import { cn } from "@/lib/utils";
import "./globals.css";

// "block" waits briefly for the self-hosted font instead of flashing a fallback.
const inter = Inter({
  subsets: ["latin"],
  display: "block",
  variable: "--font-inter",
});

const barlowCondensed = Barlow_Condensed({
  weight: "800",
  style: "italic",
  subsets: ["latin"],
  display: "block",
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: APP_NAME,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "dark scheme-dark",
        inter.variable,
        barlowCondensed.variable,
      )}
    >
      <body>{children}</body>
    </html>
  );
}
