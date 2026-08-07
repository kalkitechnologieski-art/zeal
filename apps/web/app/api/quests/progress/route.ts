import { prisma } from "@zeal/database";
import { NextResponse } from "next/server";
import { QuestProgress } from "@zeal/types";

// Mock data – replace with database query
const mockProgress: Record<string, QuestProgress> = {
  q1: {
    id: "p1",
    userId: "u1",
    questId: "q1",
    progress: 1,
    isCompleted: true,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  q2: {
    id: "p2",
    userId: "u1",
    questId: "q2",
    progress: 7,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  q3: {
    id: "p3",
    userId: "u1",
    questId: "q3",
    progress: 5,
    isCompleted: true,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export async function GET() {
  return NextResponse.json(mockProgress);
}
