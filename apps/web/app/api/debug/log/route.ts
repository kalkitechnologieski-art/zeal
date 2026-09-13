import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Receives log entries from the client.
 * In production, ship these to your log aggregator.
 * For now: print to server console so they show in Vercel logs.
 */
export async function POST(req: Request) {
  try {
    const entry = await req.json();

    // Vercel captures stdout/stderr — these will appear in function logs
    const prefix = `[${entry.channel}/${entry.level}]`;
    const message = `${prefix} ${entry.event}${
      entry.message ? ` — ${entry.message}` : ""
    }`;

    if (entry.level === "error") {
      console.error(message, entry.data ?? "", entry.error ?? "");
    } else if (entry.level === "warn") {
      console.warn(message, entry.data ?? "");
    } else {
      console.log(message, entry.data ?? "");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
