"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { PostGrid } from "@/components/profile/PostGrid";
import { ActionButtons } from "@/components/profile/ActionButtons";

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.id}/profile`)
        .then((res) => res.json())
        .then((data) => { setProfile(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading || !profile) return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-[#E1C5E7]">
            <AvatarImage src={profile.avatar || user?.imageUrl} alt={profile.username} />
            <AvatarFallback>{profile.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-[#9D7DC5] rounded-full p-0.5">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <h1 className="mt-3 text-xl font-bold text-[#5E4B8B]">@{profile.username}</h1>
        <p className="text-sm text-[#B8A1D9]">{profile.bio}</p>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-[#FFD700]" />
            <span className="font-bold text-[#5E4B8B]">{profile.sparks.toLocaleString()}</span>
            <span className="text-sm text-[#B8A1D9]">Sparks</span>
          </div>
          <div className="w-px h-6 bg-[#E1C5E7]" />
          <div>
            <span className="font-bold text-[#5E4B8B]">{profile.posts}</span>
            <span className="text-sm text-[#B8A1D9] ml-1">Posts</span>
          </div>
          <div className="w-px h-6 bg-[#E1C5E7]" />
          <div>
            <span className="font-bold text-[#5E4B8B]">{profile.followers}</span>
            <span className="text-sm text-[#B8A1D9] ml-1">Followers</span>
          </div>
        </div>

        <ActionButtons
          healerId={profile.id}
          healerName={profile.username}
          perMinuteRate={profile.perMinuteRate || 0}
          isAvailable={profile.isAvailable}
        />
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
          <div className="text-center py-12 text-[#B8A1D9]">No saved posts yet</div>
        </TabsContent>
        <TabsContent value="tagged">
          <div className="text-center py-12 text-[#B8A1D9]">No tagged posts yet</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
