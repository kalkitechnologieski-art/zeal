import { Skeleton } from "@zeal/ui";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-[60vh] p-4"
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0s]" />
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.4s]" />
          <span className="w-2.5 h-2.5 bg-[#533AFD] rounded-full animate-bounce [animation-delay:0.6s]" />
          <span className="w-2.5 h-2.5 bg-[#533AFD] rounded-full animate-bounce [animation-delay:0.8s]" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4 w-full">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    </motion.div>
  );
}
