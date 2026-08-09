import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { CallBilling } from '@/lib/calls/billing';
import { withErrorHandler, AppError } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const { sessionId } = await req.json();
  if (!sessionId) throw new AppError('Session ID required', 400, 'MISSING_SESSION_ID');

  const session = await prisma.callSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');

  const ended = await CallBilling.endSession(sessionId);

  return NextResponse.json({ session: ended });
});
