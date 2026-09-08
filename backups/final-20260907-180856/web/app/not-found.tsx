import * as React from "react";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@zeal/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <h1 className="text-6xl font-bold text-[#9D7DC5] dark:text-[#9D7DC5] mb-4">404</h1>
      <h2 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-2">Page Not Found</h2>
      <p className="text-sm text-[#B8A1D9] dark:text-gray-400 mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/dashboard">
          <Button variant="primary" className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Button>
        </Link>
        <Link href="/explore">
          <Button variant="secondary" className="flex items-center gap-2">
            <Search className="w-4 h-4" /> Explore
          </Button>
        </Link>
      </div>
    </div>
  );
}
