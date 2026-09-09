import { NextResponse } from "next/server";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { z } from "zod";

const SyncUserSchema = z.object({
  id: z.string(),
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
    candidate = `${base}${suffix}`;
  }

  // Upsert in a transaction
  const { user, wallet } = await withTransaction(async (tx) => {
    const u = await tx.user.upsert({
      where: { id },
      update: { email, name, avatar, username: candidate, updatedAt: new Date() },
      create: { id, email, name, avatar, username: candidate, role: "USER", sparks: 0, isVerified: false },
    });
    const w = await tx.wallet.upsert({
      where: { userId: id },
      update: {},
      create: { userId: id, balance: 0, escrow: 0, pendingIn: 0, pendingOut: 0, blocked: 0 },
    });
    return { user: u, wallet: w };
  });

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, username: user.username, name: user.name, avatar: user.avatar, role: user.role },
    wallet: { id: wallet.id, balance: wallet.balance },
  });
});

// AUTH_ENTERPRISE_APPLIED
