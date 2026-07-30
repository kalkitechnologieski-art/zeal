import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const allActivities = [
    { id: "1", type: "cheer", actor: { id: "u1", username: "user1", avatar: "https://ui-avatars.com/api/?name=User+1&background=9D7DC5&color=fff" }, target: { id: "p1", content: "Amazing post!" }, sparksEarned: 2, createdAt: new Date(Date.now() - 1000*60*5).toISOString() },
    { id: "2", type: "comment", actor: { id: "u2", username: "user2", avatar: "https://ui-avatars.com/api/?name=User+2&background=9D7DC5&color=fff" }, target: { id: "p2", content: "Great insight!" }, sparksEarned: 3, createdAt: new Date(Date.now() - 1000*60*30).toISOString() },
  ];
  let filtered = allActivities;
  if (filter !== "all") {
    filtered = allActivities.filter(a => a.type === filter);
  }
  return NextResponse.json(filtered);
}
