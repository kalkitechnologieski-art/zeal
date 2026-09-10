"use client";

import { useState, useCallback } from "react";
import { openRazorpayCheckout, type RazorpaySuccessResponse } from "@/lib/payments/razorpay-client";
import { useAppStore } from "@/lib/store/appStore";

interface UseRazorpayParams {
  onSuccess?: (response: RazorpaySuccessResponse) => void;
  onError?: (error: Error) => void;
  onDismiss?: () => void;
}

export function useRazorpay({ onSuccess, onError, onDismiss }: UseRazorpayParams = {}) {
  const { user } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const pay = useCallback(
    async (params: {
      orderId: string;
      amount: number;
      currency?: string;
      keyId: string;
      description?: string;
      notes?: Record<string, string>;
    }) => {
      setIsProcessing(true);
      try {
        await openRazorpayCheckout({
          key: params.keyId,
          amount: Math.round(params.amount * 100),
          currency: params.currency || "INR",
          name: "Zeal",
          description: params.description || "Zeal Payment",
          order_id: params.orderId,
          prefill: {
            name: user?.name || undefined,
            email: user?.email || undefined,
          },
          notes: params.notes,
          theme: { color: "#9D7DC5" },
          handler: (response) => {
            setIsProcessing(false);
            onSuccess?.(response);
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              onDismiss?.();
            },
            escape: true,
            backdropclose: false,
          },
        });
      } catch (err) {
        setIsProcessing(false);
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      }
    },
    [user, onSuccess, onError, onDismiss],
  );

  return { pay, isProcessing };
}

// BATCH_F2_APPLIED
