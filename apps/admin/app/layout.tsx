import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "Admin – Zeal",
  description: "Admin dashboard for Zeal platform",
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
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body className="bg-gray-50 dark:bg-gray-900 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
