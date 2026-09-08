import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata = {
  title: "Zeal – Faith & Wellness Platform",
  description: "Connect with trusted healers, astrologers, and wellness experts.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark"]}
          disableTransitionOnChange
        >
          <SupabaseAuthProvider>
            <div className="flex flex-col min-h-screen min-h-dvh">
              <TopBar />
              <main className="flex-1 overflow-y-auto pb-14 md:pb-20">
                {children}
              </main>
              <BottomNav />
            </div>
          </SupabaseAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
