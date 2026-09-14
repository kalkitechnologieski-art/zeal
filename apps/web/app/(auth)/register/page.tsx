"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { User, Stethoscope, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"USER" | "CONSULTANT">("USER");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role: activeTab === "CONSULTANT" ? "USER" : "USER", // Elevated roles should be verified later
            is_consultant_applicant: activeTab === "CONSULTANT",
          }
        }
      });

      if (error) throw new Error(error.message);
      
      toast.success("Registration successful! Welcome to Zeal.");

      if (activeTab === "CONSULTANT") {
        router.push("/consultant/onboarding");
      } else {
        router.push("/dashboard");
      }

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an Account</h1>
          <p className="text-sm text-gray-500 mt-2">Join the Zeal community</p>
        </div>

        <Tabs defaultValue="USER" onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="flex w-full bg-gray-100 p-1 rounded-lg mb-6">
            <TabsTrigger value="USER" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-gray-600 data-[state=active]:text-indigo-600 cursor-pointer outline-none">
              <User size={16} /> User
            </TabsTrigger>
            <TabsTrigger value="CONSULTANT" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-gray-600 data-[state=active]:text-indigo-600 cursor-pointer outline-none">
              <Stethoscope size={16} /> Provider
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleRegister} className="space-y-5">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="johndoe"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
            </div>
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
                type="password" required minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium flex items-center justify-center transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : `Sign Up as ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => router.push('/login')} className="text-sm text-indigo-600 hover:underline">
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
