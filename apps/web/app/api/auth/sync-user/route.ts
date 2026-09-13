import { NextResponse } from "next/server";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler } from "@/lib/errors";
import { sendEmail } from "@/lib/emails";
import { emailTemplates } from "@/lib/emails/templates";
import { enforceRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const SyncUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = await enforceRateLimit("sync-user:" + ip, 10, 60);
  if (limited) return limited;

  const body = await req.json();
  const { id, email, name, avatar, username: providedUsername } = SyncUserSchema.parse(body);

  let base = providedUsername?.trim() || email.split("@")[0] || "user";
  base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user";
  let candidate = base;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) {
    suffix++;
    candidate = base + suffix;
  }

  const existingConsultant = await prisma.consultant.findUnique({
    where: { userId: id },
    select: { id: true, status: true },
  });
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  let role: "USER" | "CLIENT_ADMIN" | "SUPER_ADMIN" = "USER";
  if (existingUser?.role === "SUPER_ADMIN") role = "SUPER_ADMIN";
  else if (existingConsultant?.status === "VERIFIED") role = "CLIENT_ADMIN";

  const { user, wallet } = await withTransaction(async (tx) => {
    const u = await tx.user.upsert({
      where: { id },
      update: {
        email,
        name: name || undefined,
        avatar: avatar || undefined,
        username: candidate,
        role,
        updatedAt: new Date(),
      },
      create: {
        id,
        email,
        name: name || undefined,
        avatar: avatar || undefined,
        username: candidate,
        role,
        sparks: 0,
        isVerified: false,
      },
    });

    const w = await tx.wallet.upsert({
      where: { userId: id },
      update: {},
      create: { userId: id, balance: 0, escrow: 0, pendingIn: 0, pendingOut: 0, blocked: 0 },
    });

    return { user: u, wallet: w };
  });

  if (!existingUser) {
    try {
      const tpl = emailTemplates.welcome(user.name || "Seeker");
      await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
    } catch (err) {
      console.warn("[SyncUser] Welcome email failed:", err);
    }
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    },
    wallet: { id: wallet.id, balance: wallet.balance },
    redirectTo:
      role === "SUPER_ADMIN" ? "/dashboard"
      : role === "CLIENT_ADMIN" ? "/consultant/dashboard"
      : "/dashboard",
  });
});

