"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Loader2 } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";

interface RazorpayButtonProps {
  amount: number;
  purpose: string;
  topup?: boolean;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function RazorpayButton({
  amount,
  purpose,
  topup = false,
  onSuccess,
  onError,
  disabled = false,
  className = "",
  label,
}: RazorpayButtonProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const { pay, isProcessing } = useRazorpay({
    onSuccess: async (response) => {
      try {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        });
        if (!verifyRes.ok) {
          throw new Error("Payment verification failed");
        }
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLocalError(error.message);
        onError?.(error);
      }
    },
    onError: (err) => {
      setLocalError(err.message);
      onError?.(err);
    },
    onDismiss: () => {
      setLocalError(null);
    },
  });

  const handleClick = async () => {
    setLocalError(null);
    try {
      const endpoint = topup ? "/api/wallet/topup" : "/api/payments/create-order";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, purpose }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Failed to create order");
      }

      const data = await res.json();
      const orderId = data.orderId || data.paymentRequestId;
      const keyId = data.keyId;

      if (!orderId || !keyId) {
        throw new Error("Invalid order response");
      }

      await pay({
        orderId,
        amount: data.amount || amount,
        currency: data.currency || "INR",
        keyId,
        description: purpose,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setLocalError(error.message);
      onError?.(error);
    }
  };

  return (
    <div className="w-full">
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: disabled || isProcessing ? 1 : 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`w-full py-4 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium shadow-lg shadow-[#9D7DC5]/25 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {label || `Pay ₹${amount.toFixed(2)}`}
          </>
        )}
      </motion.button>

      {localError && (
        <p className="mt-2 text-sm text-red-500 text-center">{localError}</p>
      )}
    </div>
  );
}

// BATCH_F2_APPLIED
