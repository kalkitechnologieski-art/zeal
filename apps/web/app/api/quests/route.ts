import { NextResponse } from "next/server";

export async function GET() {
  const quests = [
    {
      id: "q1",
      name: "Daily Post",
      description: "Create a post today",
      type: "daily",
      requirement: 1,
      reward: 25,
      icon: "📝",
      isActive: true,
    },
    {
      id: "q2",
      name: "Social Butterfly",
      description: "Cheer 10 posts",
      type: "daily",
      requirement: 10,
      reward: 30,
      icon: "🦋",
      isActive: true,
    },
    {
      id: "q3",
      name: "Community Builder",
      description: "Comment on 5 posts",
      type: "daily",
      requirement: 5,
      reward: 20,
      icon: "💬",
      isActive: true,
    },
    {
      id: "q4",
      name: "Weekly Streak",
      description: "Log in 7 days in a row",
      type: "weekly",
      requirement: 7,
      reward: 100,
      icon: "🔥",
      isActive: true,
    },
  ];
  return NextResponse.json(quests);
}
