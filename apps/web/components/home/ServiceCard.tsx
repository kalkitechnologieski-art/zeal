"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

interface ServiceCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  isFree: boolean;
  route: string;
  isAIPowered?: boolean;
  tags?: string[];
}

export function ServiceCard({
  id,
  name,
  icon,
  description,
  isFree,
  route,
  isAIPowered = false,
  tags = [],
}: ServiceCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colors = {
    cardBg: isDark ? "bg-gray-900" : "bg-white",
    cardBorder: isDark ? "border-gray-700" : "border-[#E1C5E7]",
    titleColor: isDark ? "text-white" : "text-[#5E4B8B]",
    descColor: isDark ? "text-gray-400" : "text-[#B8A1D9]",
    listColor: isDark ? "text-gray-400" : "text-[#B8A1D9]",
    iconColor: isDark ? "text-[#9D7DC5]" : "text-[#9D7DC5]",
    buttonBg: isDark ? "bg-[#9D7DC5] hover:bg-[#533AFD]" : "bg-[#9D7DC5] hover:bg-[#533AFD]",
    buttonText: "text-gray-900 dark:text-gray-900",
  };

  const features = [
    isFree ? "Free access" : "Paid service",
    isAIPowered ? "AI-powered" : "Human-guided",
    ...tags,
  ];

  return (
    <div className={`flex-shrink-0 w-72 h-full`}>
      <Link href={route} className="block h-full">
        <div className={`
          flex flex-col rounded-lg border ${colors.cardBorder} ${colors.cardBg}
          p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full
        `}>
          <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-3">{icon}</div>
            <h3 className={`text-xl font-bold ${colors.titleColor}`}>{name}</h3>
            <p className={`text-sm mt-1 ${colors.descColor}`}>{description}</p>
          </div>

          <ul className={`mt-4 flex-1 space-y-2 text-sm ${colors.listColor}`}>
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 flex-shrink-0 ${colors.iconColor}`}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <span className={`
              block w-full text-center py-2.5 px-4 rounded font-semibold uppercase tracking-wide
              ${colors.buttonBg} ${colors.buttonText}
              transition-all duration-300 hover:scale-105
            `}>
              {isFree ? "Get Started" : "Try Now"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
