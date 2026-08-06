"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, Check, Pencil, LayoutDashboard, MessageCircle, Phone, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { PostGrid } from "@/components/profile/PostGrid";
import { ActionButtons } from "@/components/profile/ActionButtons";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Link from "next/link";

// Mock profile data – replace with real API
const mockProfile = {
  id: "user1",
  username: "spiritual_seeker",
  bio: "Exploring spirituality and wellness.",
  avatar: "https://ui-avatars.com/api/?name=Seeker&background=9D7DC5&color=fff",
  sparks: 4500,
  posts: 23,
  followers: 56,
  isVerified: false,
  isHealer: false,
  perMinuteRate: 0,
  isAvailable: false,
};

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { unreadCount } = useRealtimeNotifications(user?.id);

  React.useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setProfile({ ...mockProfile, id: user?.id || "user1" });
      setLoading(false);
    }, 500);
  }, [user]);

  if (loading || !profile) {
    return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading profile...</div>;
  }

  const isOwnProfile = profile.id === user?.id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-6"
    >
      {/* Profile Header */}
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

        {/* Own Profile Actions */}
        {isOwnProfile && (
          <div className="flex items-center gap-3 mt-4 w-full max-w-xs">
            <Link href="/profile/edit" className="flex-1">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2 relative">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        )}

        {/* Other Profile: Booking/Chat/Call */}
        {!isOwnProfile && profile.isHealer && (
          <div className="flex items-center gap-3 mt-4 w-full max-w-xs">
            <Link href={`/booking/${profile.id}`} className="flex-1">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" /> Book
              </Button>
            </Link>
            <Link href={`/chat/${profile.id}`} className="flex-1">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Chat
              </Button>
            </Link>
            <Link href={`/call/${profile.id}`} className="flex-1">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
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
