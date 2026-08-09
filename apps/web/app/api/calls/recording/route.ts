import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { withErrorHandler, AppError } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const { sessionId, recordingUrl } = await req.json();
  if (!sessionId || !recordingUrl) {
    throw new AppError('sessionId and recordingUrl required', 400, 'MISSING_DATA');
  }

  const session = await prisma.callSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');

  await prisma.callSession.update({
    where: { id: sessionId },
    data: { recordingUrl, recordingReady: true },
  });

  return NextResponse.json({ success: true });
});
