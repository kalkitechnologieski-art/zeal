import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Mock data – replace with database query
  const posts = [
    { id: "p1", imageUrl: "https://picsum.photos/seed/1/600/600", cheerCount: 12, commentCount: 3 },
    { id: "p2", imageUrl: "https://picsum.photos/seed/2/600/600", cheerCount: 25, commentCount: 8 },
  ];
  return NextResponse.json(posts);
}
