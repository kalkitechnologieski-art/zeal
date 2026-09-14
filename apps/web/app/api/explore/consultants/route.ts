import { NextResponse } from "next/server";
import { createServerClientFromCookies } from "@zeal/database";
import { withErrorHandler } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: Request) => {
  const supabase = await createServerClientFromCookies();
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "60"), 200);

  let q = supabase
    .from("Consultant")
    .select(`
      id, userId, category, specialties, languages, bio, perMinuteRate,
      rating, totalConsultations, isVerified, isActive, faith, subdomain,
      chatRate, audioRate, videoRate,
      user:User!Consultant_userId_fkey (id, name, username, avatar)
    `)
    .eq("status", "VERIFIED")
    .eq("isActive", true)
    .order("rating", { ascending: false })
    .limit(limit);

  if (category) q = q.eq("category", category);

  const { data, error } = await q;
  if (error) return NextResponse.json({ items: [], total: 0 }, { status: 500 });

  const items = (data || []).map((c: Record<string, unknown>) => {
    const user = c.user as Record<string, unknown> || {};
    return {
      id: c.id, userId: c.userId,
      name: user.name || user.username,
      username: user.username, avatar: user.avatar || "",
      bio: c.bio || "", category: c.category,
      isVerified: c.isVerified, isOnline: c.isActive,
      perMinuteRate: c.perMinuteRate, rating: c.rating,
      totalConsultations: c.totalConsultations,
      languages: c.languages || [], specialties: c.specialties || [],
      faith: c.faith, subdomain: c.subdomain,
      chatRate: c.chatRate, audioRate: c.audioRate, videoRate: c.videoRate,
    };
  });

  return NextResponse.json({ items, total: items.length });
});
