"use client";

import { useAuth } from "@/components/providers/SupabaseAuthProvider";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, LogIn, Pencil, LayoutDashboard, Check } from "lucide-react";
import { Button, Avatar, AvatarImage, AvatarFallback, Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";
import { PostGrid } from "@/components/profile/PostGrid";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#F4E8F7] dark:bg-gray-800 flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-[#9D7DC5]" />
        </div>
        <h2 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-2">
          Please log in to view your profile
        </h2>
        <p className="text-[#B8A1D9] dark:text-gray-400 mb-6 max-w-sm">
          Sign in to access your profile, manage consultations, and connect with healers.
        </p>
        <Link href="/auth/login">
          <Button variant="primary" className="flex items-center gap-2 btn-luxury">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </Link>
        <p className="mt-4 text-sm text-[#B8A1D9] dark:text-gray-400">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-[#9D7DC5] hover:underline">
            Register
          </Link>
        </p>
      </div>
    );
  }

  const profile = {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
    bio: user.user_metadata?.bio || "Exploring spirituality and wellness.",
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.avatar || "https://ui-avatars.com/api/?name=U&background=9D7DC5&color=fff",
    sparks: 0,
    posts: 0,
    followers: 0,
    isVerified: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-[#E1C5E7]">
            <AvatarImage src={profile.avatar} alt={profile.username} />
            <AvatarFallback>{profile.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-[#9D7DC5] rounded-full p-0.5">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <h1 className="mt-3 text-xl font-bold text-[#5E4B8B] dark:text-white">@{profile.username}</h1>
        <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{profile.bio}</p>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-[#FFD700]" />
            <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.sparks.toLocaleString()}</span>
            <span className="text-sm text-[#B8A1D9] dark:text-gray-400">Sparks</span>
          </div>
          <div className="w-px h-6 bg-[#E1C5E7]" />
          <div>
            <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.posts}</span>
            <span className="text-sm text-[#B8A1D9] dark:text-gray-400 ml-1">Posts</span>
          </div>
          <div className="w-px h-6 bg-[#E1C5E7]" />
          <div>
            <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.followers}</span>
            <span className="text-sm text-[#B8A1D9] dark:text-gray-400 ml-1">Followers</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 w-full max-w-xs">
          <Link href="/profile/edit" className="flex-1">
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="w-full justify-center">
          <TabsTrigger value="posts">📸 Posts</TabsTrigger>
          <TabsTrigger value="saved">💾 Saved</TabsTrigger>
          <TabsTrigger value="tagged">🏷️ Tagged</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <PostGrid userId={profile.id} />
        </TabsContent>
        <TabsContent value="saved">
          <div className="text-center py-12 text-[#B8A1D9] dark:text-gray-400">No saved posts yet</div>
        </TabsContent>
        <TabsContent value="tagged">
          <div className="text-center py-12 text-[#B8A1D9] dark:text-gray-400">No tagged posts yet</div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
