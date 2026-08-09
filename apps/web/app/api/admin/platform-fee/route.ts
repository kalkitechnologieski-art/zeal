import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { withErrorHandler, AppError, ValidationError } from '@/lib/errors';
import { PlatformFeeSchema } from '@zeal/types';

export const GET = withErrorHandler(async () => {
  return NextResponse.json({ feePercent: 10, minFee: 0, maxFee: 500 });
});

export const PUT = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const body = await req.json();
  const parsed = PlatformFeeSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid fee data', parsed.error.flatten());
  }

  return NextResponse.json({ success: true, fee: parsed.data.feePercent });
});
