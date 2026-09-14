"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { User, Stethoscope, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"USER" | "CONSULTANT" | "ADMIN">("USER");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) throw new Error(authError?.message || "Login failed");

      // Fetch precise role from DB
      const { data: userRecord } = await supabase
        .from("User")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const userRole = (userRecord as any)?.role || "USER";

      if (activeTab === "ADMIN") {
        if (userRole !== "SUPER_ADMIN" && userRole !== "CLIENT_ADMIN") {
          await supabase.auth.signOut();
          throw new Error("Unauthorized: You lack administrative privileges.");
        }
        window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
        return;
      }

      if (activeTab === "CONSULTANT") {
        const { data: consultant } = await supabase
          .from("Consultant")
          .select("status")
          .eq("userId", authData.user.id)
          .maybeSingle();

        if (!consultant || (consultant as any).status === "PENDING" || (consultant as any).status === "REJECTED") {
          router.push("/consultant/onboarding");
        } else {
          router.push("/consultant/dashboard");
        }
        return;
      }

      // Default User Dashboard
      router.push("/dashboard");

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your Zeal account</p>
        </div>

        <Tabs defaultValue="USER" onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="flex w-full bg-gray-100 p-1 rounded-lg mb-6">
            <TabsTrigger value="USER" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-gray-600 data-[state=active]:text-indigo-600 cursor-pointer outline-none">
              <User size={16} /> User
            </TabsTrigger>
            <TabsTrigger value="CONSULTANT" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-gray-600 data-[state=active]:text-indigo-600 cursor-pointer outline-none">
              <Stethoscope size={16} /> Provider
            </TabsTrigger>
            <TabsTrigger value="ADMIN" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-gray-600 data-[state=active]:text-red-600 cursor-pointer outline-none">
              <ShieldAlert size={16} /> Admin
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
                activeTab === "ADMIN" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
              } disabled:opacity-70`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : `Sign In as ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => router.push('/register')} className="text-sm text-indigo-600 hover:underline">
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
