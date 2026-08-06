"use client";

import * as React from "react";
import { Button } from "@zeal/ui";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global error:", error);
    // Optionally send to Sentry or logging service
  }, [error]);

  return (
    <html>
      <body>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#F4E8F7] dark:bg-gray-900"
        >
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Something went wrong
            </h2>
            <p className="text-[#B8A1D9] dark:text-gray-400 mb-4">
              {error.message || "An unexpected error occurred."}
            </p>
            {error.digest && (
              <p className="text-xs text-[#B8A1D9] mb-4">Error ID: {error.digest}</p>
            )}
            <Button onClick={reset} variant="primary">
              Try again
            </Button>
          </div>
        </motion.div>
      </body>
    </html>
  );
}
