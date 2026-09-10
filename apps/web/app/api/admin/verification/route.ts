import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { sendEmail } from "@/lib/emails";
import { emailTemplates } from "@/lib/emails/templates";
import { z } from "zod";

const VerifySchema = z.object({
  consultantId: z.string().cuid(),
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().max(500).optional(),
  subdomain: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{1,30}$/)
    .optional(),
});

async function requireSuperAdmin(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden - SUPER_ADMIN only", 403, ErrorCode.AUTH_FORBIDDEN);
  }
  return userId;
}

export const GET = withErrorHandler(async () => {
  await requireSuperAdmin();

  const pending = await prisma.consultant.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true, username: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ consultants: pending });
});

export const POST = withErrorHandler(async (req: Request) => {
  const adminId = await requireSuperAdmin();

  const body = await req.json();
  const { consultantId, action, reason, subdomain } = VerifySchema.parse(body);

  const consultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    include: { user: true },
  });

  if (!consultant) {
    throw new AppError("Consultant not found", 404, ErrorCode.NOT_FOUND);
  }

  if (action === "APPROVE") {
    if (subdomain) {
      const existing = await prisma.consultant.findUnique({
        where: { subdomain },
        select: { id: true },
      });
      if (existing && existing.id !== consultantId) {
        throw new AppError("Subdomain already taken", 409, ErrorCode.BOOKING_CONFLICT);
      }
    }

    await withTransaction(async (tx) => {
      await tx.consultant.update({
        where: { id: consultantId },
        data: {
          status: "VERIFIED",
          isActive: true,
          isVerified: true,
          approvedBy: adminId,
          approvedAt: new Date(),
          rejectionReason: null,
          subdomain: subdomain || consultant.user.username,
          subdomainActive: true,
          theme: {
            primaryColor: "#9D7DC5",
            accentColor: "#533AFD",
            welcomeMessage: "Welcome to " + (consultant.user.name || "my") + " practice",
          },
        },
      });

      await tx.user.update({
        where: { id: consultant.userId },
        data: { role: "CLIENT_ADMIN" },
      });
    });

    try {
      const tpl = emailTemplates.consultantVerified(consultant.user.name || "Consultant");
      await sendEmail({
        to: consultant.user.email,
        subject: tpl.subject,
        html: tpl.html,
      });
    } catch (err) {
      console.warn("[Verification] Email failed:", err);
    }

    return NextResponse.json({ success: true, action: "APPROVED" });
  }

  await withTransaction(async (tx) => {
    await tx.consultant.update({
      where: { id: consultantId },
      data: {
        status: "REJECTED",
        isActive: false,
        isVerified: false,
        rejectionReason: reason || "Not specified",
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });
  });

  try {
    const tpl = emailTemplates.consultantRejected(
      consultant.user.name || "Applicant",
      reason || "Not specified",
    );
    await sendEmail({
      to: consultant.user.email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    console.warn("[Verification] Email failed:", err);
  }

  return NextResponse.json({ success: true, action: "REJECTED" });
});

// BATCH1_APPLIED
