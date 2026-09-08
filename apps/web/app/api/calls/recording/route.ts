import { NextResponse } from 'next/server';
import { getUserId } from "@/lib/auth";
import { prisma } from '@zeal/database';
import { withErrorHandler, AppError } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const { sessionId, recordingUrl } = await req.json();
  if (!sessionId || !recordingUrl) {
    throw new AppError('sessionId and recordingUrl required', 400, 'MISSING_DATA');
  }

  const callSession = await prisma.callSession.findUnique({
    where: { id: sessionId },
  });
  if (!callSession) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');

  await prisma.callSession.update({
    where: { id: sessionId },
    data: { recordingUrl, recordingReady: true },
  });

  return NextResponse.json({ success: true });
});
