import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NotificationService } from '@/lib/notifications/service';
import { withErrorHandler, AppError } from '@/lib/errors';

export const POST = withErrorHandler(async () => {
  const supabase = createServerClientFromCookies();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  await NotificationService.markAllAsRead(userId);
  return NextResponse.json({ success: true });
});
