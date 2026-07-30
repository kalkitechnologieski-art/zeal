import { NextResponse } from "next/server";
export async function GET() {
  const posts = [
    { id: "p1", content: "Today I learned something new about Vedic astrology.", imageUrl: "https://picsum.photos/seed/1/600/600", author: { username: "astrologer_raj", avatar: "https://ui-avatars.com/api/?name=Raj&background=9D7DC5&color=fff" }, cheerCount: 12, commentCount: 3, shareCount: 2, createdAt: new Date(Date.now() - 1000*60*15).toISOString() },
    { id: "p2", content: "Meditation is the key to inner peace.", imageUrl: "https://picsum.photos/seed/2/600/600", author: { username: "spiritual_guru", avatar: "https://ui-avatars.com/api/?name=Guru&background=9D7DC5&color=fff" }, cheerCount: 25, commentCount: 8, shareCount: 5, createdAt: new Date(Date.now() - 1000*60*45).toISOString() },
  ];
  return NextResponse.json(posts);
}
