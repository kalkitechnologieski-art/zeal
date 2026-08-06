import { NextResponse } from "next/server";
import { SparkBazaarListing } from "@zeal/types";

// Mock data – replace with database query
const mockListings: SparkBazaarListing[] = [
  {
    id: "l1",
    userId: "u1",
    user: {
      id: "u1",
      name: "Astrologer Raj",
      email: "raj@zeal.com",
      avatar: "https://ui-avatars.com/api/?name=Raj&background=9D7DC5&color=fff",
      sparks: 12500,
      role: "USER",
    },
    sparks: 12500,
    rank: 1,
    tier: "gold",
    isAvailable: true,
  },
  {
    id: "l2",
    userId: "u2",
    user: {
      id: "u2",
      name: "Healer Priya",
      email: "priya@zeal.com",
      avatar: "https://ui-avatars.com/api/?name=Priya&background=9D7DC5&color=fff",
      sparks: 8500,
      role: "USER",
    },
    sparks: 8500,
    rank: 2,
    tier: "silver",
    isAvailable: true,
  },
  {
    id: "l3",
    userId: "u3",
    user: {
      id: "u3",
      name: "Tarot Sana",
      email: "sana@zeal.com",
      avatar: "https://ui-avatars.com/api/?name=Sana&background=9D7DC5&color=fff",
      sparks: 3200,
      role: "USER",
    },
    sparks: 3200,
    rank: 3,
    tier: "bronze",
    isAvailable: false,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get("tier") || "all";

  const filtered = tier === "all"
    ? mockListings
    : mockListings.filter((l) => l.tier === tier);

  return NextResponse.json(filtered);
}
