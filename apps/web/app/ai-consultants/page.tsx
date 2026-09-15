"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ShieldCheck, ArrowRight, User } from "lucide-react";

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .or("role.eq.admin,role.eq.superadmin");
      
      if (data && data.length > 0) {
        setConsultants(data);
      } else {
        setConsultants([
          { id: "1", full_name: "Acharya Rajesh Shastri", role: "admin", email: "shastri@zeal.astro" },
          { id: "2", full_name: "Dr. Elena Vance", role: "superadmin", email: "elena@zeal.astro" },
          { id: "3", full_name: "Master Chen", role: "admin", email: "chen@zeal.astro" },
        ]);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Verified Astrological Advisors</h1>
          <p className="text-gray-500 font-medium mt-2">Connect with verified masters for personalized chart analysis and guidance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultants.map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {c.full_name ? c.full_name.charAt(0) : "A"}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{c.full_name || "Senior Astrologer"}</h4>
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-6 font-medium">Specialized in Vedic transits, Synastry, and Life Path optimization.</p>
              <Link
                href={`/login?next=/chat?consultant=${c.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors"
              >
                Schedule Consultation <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
