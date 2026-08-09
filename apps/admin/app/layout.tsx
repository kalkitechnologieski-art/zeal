import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/lib/query/provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata = {
  title: 'Zeal Admin',
  description: 'Admin dashboard for Zeal platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      afterSignOutUrl="/login"
      appearance={{
        variables: {
          colorPrimary: '#9D7DC5',
          colorBackground: '#FFFFFF',
          colorText: '#5E4B8B',
          borderRadius: '1rem',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="bg-[#F4E8F7] dark:bg-gray-900 antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            themes={["light", "dark"]}
            disableTransitionOnChange
          >
            <QueryProvider>
              <div className="min-h-screen">{children}</div>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
