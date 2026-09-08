"use client";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
export function HomeClient() {
  const { isLoaded, isSignedIn } = useUser();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-[#5E4B8B]">Welcome to Zeal</h1>
      <p className="mt-4 text-lg text-[#B8A1D9]">Connect with trusted healers across all faiths.</p>
      <div className="mt-8 space-x-4">
        {!isLoaded ? <p>Loading...</p> : isSignedIn ? <UserButton /> : (
          <>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-[#9D7DC5] text-white rounded-xl hover:bg-[#533AFD] transition-all">Sign In</button>
            </SignInButton>
            <Link href="/register">
              <button className="px-6 py-2 border border-[#9D7DC5] text-[#9D7DC5] rounded-xl hover:bg-[#F4E8F7] transition-all">Register</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
