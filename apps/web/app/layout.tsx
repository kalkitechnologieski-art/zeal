import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomBar } from "@/components/layout/BottomBar";

export const metadata: Metadata = {
  title: "Zeal — Cinematic Metaphysics & AI Intelligence",
  description: "Enterprise-grade Vedic astrology and AI neural consultation platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased selection:bg-purple-500/30 pb-20 md:pb-0">
        <Navbar />
        <main>{children}</main>
        <BottomBar />
      </body>
    </html>
  );
}
