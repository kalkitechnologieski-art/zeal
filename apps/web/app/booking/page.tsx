"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { BookingWizard } from "@/components/booking/BookingWizard";

function BookingPageInner() {
  const params = useSearchParams();
  const consultantId = params.get("consultantId");

  const { data, isLoading, error } = useQuery({
    queryKey: ["consultant-for-booking", consultantId],
    enabled: !!consultantId,
    queryFn: async () => {
      const res = await fetch(`/api/users/${consultantId}/profile`);
      if (!res.ok) throw new Error("Consultant not found");
      return res.json();
    },
  });

  if (!consultantId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-[#B8A1D9]">
        Missing consultant ID
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" />
      </div>
    );
  }

  if (error || !data?.user?.consultant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-red-500">
        Consultant not found
      </div>
    );
  }

  const c = data.user.consultant;
  const consultant = {
    id: c.id,
    name: data.user.name || data.user.username,
    avatar: data.user.avatar,
    category: c.category,
    chatRate: c.chatRate,
    audioRate: c.audioRate,
    videoRate: c.videoRate,
    physicalRate: c.physicalRate,
    perMinuteRate: c.perMinuteRate || 50,
  };

  return (
    <div className="px-4 py-6">
      <BookingWizard consultant={consultant} />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" />
        </div>
      }
    >
      <BookingPageInner />
    </Suspense>
  );
}

// BATCH_F2_APPLIED
