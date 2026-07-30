import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'set' : 'missing',
    clerkSecretKey: process.env.CLERK_SECRET_KEY ? 'set' : 'missing',
    databaseUrl: process.env.DATABASE_URL ? 'set' : 'missing',
  });
}
