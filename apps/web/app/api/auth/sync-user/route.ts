import { NextResponse } from "next/server";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { sendEmail } from "@/lib/emails";
import { emailTemplates } from "@/lib/emails/templates";
import { z } from "zod";

const SyncUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { id, email, name, avatar, username: providedUsername } = SyncUserSchema.parse(body);

  // Generate unique username
  let base = providedUsername?.trim() || email.split("@")[0] || "user";
  base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user";
  let candidate = base;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) {
    suffix++;
    candidate = base + suffix;
  }

  // Determine role
  const existingConsultant = await prisma.consultant.findUnique({
    where: { userId: id },
    select: { id: true, status: true },
  });

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  let role: "USER" | "CLIENT_ADMIN" | "SUPER_ADMIN" = "USER";
  if (existingUser?.role === "SUPER_ADMIN") {
    role = "SUPER_ADMIN";
  } else if (existingConsultant?.status === "VERIFIED") {
    role = "CLIENT_ADMIN";
  }

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
      create: {
        userId: id,
        balance: 0,
        escrow: 0,
        pendingIn: 0,
        pendingOut: 0,
        blocked: 0,
      },
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
    wallet: {
      id: wallet.id,
      balance: wallet.balance,
    },
    redirectTo:
      role === "SUPER_ADMIN"
        ? "/dashboard"
        : role === "CLIENT_ADMIN"
        ? "/consultant/dashboard"
        : "/dashboard",
  });
});

// BATCH1_APPLIED
