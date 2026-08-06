import Link from "next/link";
import { Button } from "@zeal/ui";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center"
    >
      <h1 className="text-6xl font-bold text-[#9D7DC5] dark:text-[#9D7DC5]">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-[#5E4B8B] dark:text-white">Page Not Found</h2>
      <p className="mt-2 text-[#B8A1D9] dark:text-gray-400 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard">
          <Button variant="primary">Go Home</Button>
        </Link>
        <Link href="/explore">
          <Button variant="secondary">Explore</Button>
        </Link>
      </div>
    </motion.div>
  );
}
