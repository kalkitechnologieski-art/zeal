import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function supabaseMiddleware(req: NextRequest) {
  // Placeholder – in production, use real Supabase middleware
  const res = NextResponse.next();
  return res;
}
