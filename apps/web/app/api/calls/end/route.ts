import { NextResponse } from 'next/server';
import { prisma } from '@zeal/database';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { consultantId, isAI, duration } = await req.json();

    // Find the active call session
    const session = await prisma.callSession.findFirst({
      where: {
        userId,
        status: 'initiated',
        isAI: isAI || false,
        ...(isAI ? { aiConsultantId: consultantId } : { healerId: consultantId }),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (session) {
      const amount = isAI && session.isAI ? (duration / 60) * 2 : 0; // ₹2/min for AI calls
      await prisma.callSession.update({
        where: { id: session.id },
        data: {
          endTime: new Date(),
          duration,
          amount,
          status: 'ended',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Call end error:', error);
    return NextResponse.json(
      { error: 'Failed to end call' },
      { status: 500 }
    );
  }
}
