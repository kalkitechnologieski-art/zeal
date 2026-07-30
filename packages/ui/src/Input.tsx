import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "./utils";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={cn("w-full px-4 py-3 border border-[#E1C5E7] rounded-xl focus:ring-2 focus:ring-[#9D7DC5] outline-none bg-white", className)} {...props} />
  )
);
Input.displayName = "Input";
