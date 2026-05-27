import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/theme-provider";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InstantPoll — Twórz ankiety w sekundy",
    template: "%s — InstantPoll",
  },
  description:
    "Twórz i udostępniaj ankiety online bez zakładania konta. Anonimowe głosowanie, podgląd wyników w czasie rzeczywistym.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${geist.className} antialiased min-h-screen bg-zinc-50 dark:bg-zinc-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}