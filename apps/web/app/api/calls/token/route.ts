import { prisma } from "@zeal/database";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, generate a LiveKit token or EasyCall token
    // For now, return a mock token
    return NextResponse.json({
      token: `mock-token-${Date.now()}`,
      url: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.zeal.com',
    });
  } catch (error) {
    console.error('Token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
