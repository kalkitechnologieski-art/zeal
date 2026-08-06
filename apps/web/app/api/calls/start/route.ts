import { NextResponse } from 'next/server';
import { prisma } from '@zeal/database';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { consultantId, isAI, isPaid } = await req.json();

    const session = await prisma.callSession.create({
      data: {
        userId,
        healerId: consultantId,
        isAI: isAI || false,
        aiConsultantId: isAI ? consultantId : undefined,
        status: 'initiated',
      },
    });

    // Notify the consultant (via WebSocket)
    // In production: publish to Redis

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Call start error:', error);
    return NextResponse.json(
      { error: 'Failed to start call' },
      { status: 500 }
    );
  }
}
