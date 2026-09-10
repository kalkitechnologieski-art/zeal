import { notFound } from "next/navigation";
import { prisma } from "@zeal/database";
import { normalizeTheme, themeToCssVars } from "@/lib/white-label/theme";
import Link from "next/link";

interface WhiteLabelLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function WhiteLabelLayout({
  children,
  params,
}: WhiteLabelLayoutProps) {
  const { subdomain } = await params;

  const consultant = await prisma.consultant.findUnique({
    where: { subdomain },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  if (!consultant || !consultant.subdomainActive) {
    notFound();
  }

  const theme = normalizeTheme(consultant.theme);
  const displayName = consultant.user.name || consultant.user.username;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div style={themeToCssVars(theme)} className="min-h-screen bg-[#FDFBF7]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[#E1C5E7]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={`/white-label/${subdomain}`}
            className="flex items-center gap-2"
          >
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.logoUrl}
                alt="Logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#9D7DC5]/20 flex items-center justify-center text-sm font-bold text-[#9D7DC5]">
                {avatarInitial}
              </div>
            )}
            <span className="font-semibold text-[#5E4B8B]">{displayName}</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href={`/white-label/${subdomain}`}
              className="text-[#5E4B8B] hover:text-[#9D7DC5]"
            >
              Home
            </Link>
            <Link
              href={`/white-label/${subdomain}/services`}
              className="text-[#5E4B8B] hover:text-[#9D7DC5]"
            >
              Services
            </Link>
            <Link
              href={`/white-label/${subdomain}/book`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium"
            >
              Book
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[#E1C5E7] py-6 text-center text-xs text-[#B8A1D9]">
        Powered by Zeal
      </footer>
    </div>
  );
}

// BATCH3_FIX_APPLIED

export const dynamic = "force-dynamic";
