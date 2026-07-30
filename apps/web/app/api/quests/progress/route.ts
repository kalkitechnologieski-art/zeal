import { NextResponse } from "next/server";

export async function GET() {
  // Mock progress data
  const progress = {
    q1: { id: "p1", userId: "u1", questId: "q1", progress: 1, isCompleted: true },
    q2: { id: "p2", userId: "u1", questId: "q2", progress: 7, isCompleted: false },
    q3: { id: "p3", userId: "u1", questId: "q3", progress: 5, isCompleted: true },
  };
  return NextResponse.json(progress);
}
