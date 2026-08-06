"use client";

import * as React from "react";
import Link from "next/link";
import { ConsultantProfile } from "@zeal/types";
import { Badge } from "@zeal/ui";
import { useTheme } from "next-themes";

interface ConsultantCardProps {
  consultant: ConsultantProfile;
  variant?: "horizontal" | "vertical";
}

export function ConsultantCard({ consultant, variant = "vertical" }: ConsultantCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Generate a unique gradient for each consultant based on their ID
  const gradientId = `gradient-${consultant.id}`;
  const patternId = `pattern-${consultant.id}`;

  // Theme-aware colors
  const colors = {
    cardBg: isDark ? "bg-gray-900" : "bg-white",
    cardBorder: isDark ? "border-gray-700" : "border-[#E1C5E7]",
    titleColor: isDark ? "text-white" : "text-[#5E4B8B]",
    subtitleColor: isDark ? "text-gray-400" : "text-[#B8A1D9]",
    buttonBg: isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-[#F4E8F7] hover:bg-[#E1C5E7]",
    buttonText: isDark ? "text-white" : "text-[#5E4B8B]",
    buttonSolidBg: isDark ? "bg-[#9D7DC5] hover:bg-[#533AFD]" : "bg-[#9D7DC5] hover:bg-[#533AFD]",
    buttonSolidText: "text-white",
  };

  const isVertical = variant === "vertical";

  return (
    <div className={`${isVertical ? "w-64" : "w-full"} flex-shrink-0`}>
      <div className={`
        relative flex flex-col items-center rounded-2xl overflow-hidden 
        border ${colors.cardBorder} ${colors.cardBg}
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${isVertical ? "h-[420px]" : "h-[320px]"}
      `}>
        {/* Card Image / Gradient Background */}
        <div className="absolute inset-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 540 450" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#2d1b3d" : "#F4E8F7"} />
                <stop offset="100%" stopColor={isDark ? "#1a0f26" : "#E1C5E7"} />
              </linearGradient>
              <pattern id={patternId} patternUnits="userSpaceOnUse" width="300" height="250" x="0" y="0" viewBox="0 0 1080 900">
                <g fillOpacity="0.15">
                  <polygon fill={isDark ? "#6B4F8A" : "#B8A1D9"} points="90 150 0 300 180 300" />
                  <polygon fill={isDark ? "#4A3A6B" : "#D1C4E8"} points="90 150 180 0 0 0" />
                  <polygon fill={isDark ? "#6B4F8A" : "#C9B5E0"} points="270 150 360 0 180 0" />
                  <polygon fill={isDark ? "#8B6FA8" : "#E1D4F0"} points="450 150 360 300 540 300" />
                  <polygon fill={isDark ? "#5E4B8B" : "#D1C4E8"} points="450 150 540 0 360 0" />
                  <polygon fill={isDark ? "#7A5A9E" : "#C9B5E0"} points="630 150 540 300 720 300" />
                  <polygon fill={isDark ? "#8B6FA8" : "#E1D4F0"} points="630 150 720 0 540 0" />
                  <polygon fill={isDark ? "#4A3A6B" : "#B8A1D9"} points="810 150 720 300 900 300" />
                  <polygon fill={isDark ? "#A588C0" : "#F0E8F8"} points="810 150 900 0 720 0" />
                  <polygon fill={isDark ? "#8B6FA8" : "#E1D4F0"} points="990 150 900 300 1080 300" />
                  <polygon fill={isDark ? "#4A3A6B" : "#B8A1D9"} points="990 150 1080 0 900 0" />
                </g>
              </pattern>
            </defs>
            <rect x="0" y="0" fill={`url(#${gradientId})`} width="100%" height="100%" />
            <rect x="0" y="0" fill={`url(#${patternId})`} width="100%" height="100%" />
          </svg>
        </div>

        {/* Avatar */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[114px] h-[114px] rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg overflow-hidden">
            {consultant.avatar ? (
              <img
                src={consultant.avatar}
                alt={consultant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg viewBox="0 0 128 128" className="w-full h-full">
                <circle cx="64" cy="64" fill="#9D7DC5" r="60" />
                <circle cx="64" cy="64" fill="#533AFD" opacity="0.3" r="48" />
                <path d="m64 14a32 32 0 0 1 32 32v41a6 6 0 0 1 -6 6h-52a6 6 0 0 1 -6-6v-41a32 32 0 0 1 32-32z" fill="#7f3838" />
                <circle cx="89" cy="65" fill="#F4E8F7" r="7" />
                <circle cx="39" cy="65" fill="#F4E8F7" r="7" />
                <path d="m64 91a25 25 0 0 1 -25-25v-16.48a25 25 0 1 1 50 0v16.48a25 25 0 0 1 -25 25z" fill="#FFD8C9" />
                <circle cx="76" cy="62.28" fill="#515570" r="3" />
                <circle cx="52" cy="62.28" fill="#515570" r="3" />
                <path d="m64 84c5 0 7-3 7-3h-14s2 3 7 3z" fill="#F85565" opacity="0.4" />
                <path d="m65.07 78.93-.55.55a.73.73 0 0 1 -1 0l-.55-.55c-1.14-1.14-2.93-.93-4.27.47l-1.7 1.6h14l-1.66-1.6c-1.34-1.4-3.13-1.61-4.27-.47z" fill="#F85565" />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <div className="mt-14">
            <h3 className={`font-semibold text-lg ${colors.titleColor}`}>
              {consultant.name}
            </h3>
            <p className={`text-sm ${colors.subtitleColor} mt-1`}>
              @{consultant.username}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-yellow-500 text-sm">⭐ {consultant.rating}</span>
              <span className={`text-xs ${colors.subtitleColor}`}>
                ₹{consultant.perMinuteRate}/min
              </span>
              {consultant.isOnline && (
                <Badge variant="online" className="text-[10px] px-1.5 py-0.5">Online</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <Link href={`/consultant/${consultant.id}`}>
              <button className={`
                px-4 py-1.5 text-xs font-bold uppercase rounded border-2 
                ${colors.buttonBg} ${colors.buttonText}
                transition-all duration-300 hover:scale-105
              `}>
                Profile
              </button>
            </Link>
            <Link href={`/booking?consultantId=${consultant.id}`}>
              <button className={`
                px-4 py-1.5 text-xs font-bold uppercase rounded
                ${colors.buttonSolidBg} ${colors.buttonSolidText}
                transition-all duration-300 hover:scale-105
              `}>
                Book
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
