import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
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

  // Generate a username if not provided or empty
  let username: string;
  if (providedUsername && providedUsername.trim().length > 0) {
    username = providedUsername.trim();
  } else {
    // Derive from email (remove domain, special characters)
    const base = email.split("@")[0] || "user";
    username = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    // If empty after cleaning, use a default
    if (!username) username = "user";
  }

  // Ensure uniqueness
  let candidate = username;
  let suffix = 0;
  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) break;
    suffix++;
    candidate = `${username}${suffix}`;
  }

  const user = await prisma.user.upsert({
    where: { id },
    update: {
      email,
      name: name || undefined,
      avatar: avatar || undefined,
      username: candidate,
      updatedAt: new Date(),
    },
    create: {
      id,
      email,
      name: name || undefined,
      avatar: avatar || undefined,
      username: candidate,
      role: "USER",
      sparks: 0,
      isVerified: false,
    },
  });

  const wallet = await prisma.wallet.upsert({
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
  });
});
