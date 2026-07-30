"use client";
import { ConsultantProfile } from "@zeal/types";
import Link from "next/link";

interface ConsultantCardProps {
  consultant: ConsultantProfile;
  variant?: "horizontal" | "vertical";
}

export function ConsultantCard({ consultant, variant = "vertical" }: ConsultantCardProps) {
  const isVertical = variant === "vertical";
  return (
    <Link href={`/consultant/${consultant.id}`} className="block">
      <div className={`bg-white rounded-xl border border-[#E1C5E7] overflow-hidden hover:shadow-md transition-all ${isVertical ? "w-48" : "w-full"}`}>
        <div className="relative">
          <img
            src={consultant.avatar}
            alt={consultant.name}
            className={`${isVertical ? "w-full h-32" : "w-16 h-16 rounded-full"} object-cover ${isVertical ? "" : "absolute left-3 top-3 border-2 border-white"}`}
          />
          {consultant.isOnline && (
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Online</span>
          )}
        </div>
        <div className="p-3">
          <p className="font-semibold text-[#5E4B8B] text-sm truncate">{consultant.name}</p>
          <p className="text-xs text-[#B8A1D9] truncate">@{consultant.username}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium text-[#9D7DC5]">₹{consultant.perMinuteRate}/min</span>
            <span className="text-xs text-[#B8A1D9]">⭐ {consultant.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
