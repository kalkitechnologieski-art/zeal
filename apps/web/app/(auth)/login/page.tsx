"use client";
export const dynamic = 'force-dynamic';
import { SignIn } from "@clerk/nextjs";
export default function LoginPage() {
  return <div className="flex min-h-screen items-center justify-center bg-[#F4E8F7]"><SignIn /></div>;
}
