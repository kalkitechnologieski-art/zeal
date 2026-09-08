"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@zeal/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global error:", error);
    // In production, send to Sentry or logging service
    if (typeof window !== "undefined") {
      try {
        fetch("/api/error-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      } catch (_) {}
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4E8F7] dark:bg-gray-900 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-sm text-[#B8A1D9] dark:text-gray-400 mb-4">
              {error.message || "An unexpected error occurred. Our team has been notified."}
            </p>
            {error.digest && (
              <p className="text-xs text-[#B8A1D9] dark:text-gray-400 mb-4 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Go Home
              </Button>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
