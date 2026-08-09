import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NotificationService } from '@/lib/notifications/service';
import { withErrorHandler, AppError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const result = await NotificationService.getNotifications(userId, { limit, offset });
  return NextResponse.json(result);
});
