"use client";

import * as React from "react";
import { Button } from "@zeal/ui";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
        Oops! Something went wrong
      </h2>
      <p className="text-[#B8A1D9] dark:text-gray-400 mb-4">{error.message}</p>
      <Button onClick={reset} variant="primary">
        Try again
      </Button>
    </motion.div>
  );
}
