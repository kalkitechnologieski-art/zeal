'use client';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Sparkles, Check, Pencil, LayoutDashboard, MessageCircle, Phone, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Avatar, AvatarImage, AvatarFallback, Badge } from '@zeal/ui';
import { PostGrid } from '@/components/profile/PostGrid';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/appStore';

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { user: appUser, wallet } = useAppStore();
  const { unreadCount } = useRealtimeNotifications(clerkUser?.id);

  // Use clerkUser if available, else fallback to appUser
  const profile = {
    id: clerkUser?.id || appUser?.id || 'user1',
    username: appUser?.username || clerkUser?.username || 'seeker',
    bio: appUser?.bio || 'Exploring spirituality and wellness.',
    avatar: clerkUser?.imageUrl || appUser?.avatar || 'https://ui-avatars.com/api/?name=U&background=9D7DC5&color=fff',
    sparks: appUser?.sparks || 0,
    posts: 23,
    followers: 56,
    isVerified: appUser?.isVerified || false,
    isHealer: appUser?.role === 'HEALER' || false,
    perMinuteRate: 0,
    isAvailable: false,
    walletBalance: wallet?.balance || 0,
  };

  const isOwnProfile = clerkUser?.id === profile.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-animated rounded-2xl p-6 border border-[#E1C5E7]/30 dark:border-gray-700/30"
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-[#9D7DC5]/20">
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback className="bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] text-white text-2xl">
                {profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-[#9D7DC5] rounded-full p-0.5 shadow-lg">
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
            <div className="w-px h-6 bg-[#E1C5E7]/50" />
            <div>
              <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.posts}</span>
              <span className="text-sm text-[#B8A1D9] dark:text-gray-400 ml-1">Posts</span>
            </div>
            <div className="w-px h-6 bg-[#E1C5E7]/50" />
            <div>
              <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.followers}</span>
              <span className="text-sm text-[#B8A1D9] dark:text-gray-400 ml-1">Followers</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-[#5E4B8B] dark:text-white">
            <span className="font-medium">Wallet:</span>
            <span className="font-bold text-[#9D7DC5]">₹{profile.walletBalance.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-3 mt-4 w-full max-w-xs">
            {isOwnProfile ? (
              <>
                <Link href="/profile/edit" className="flex-1">
                  <Button variant="secondary" className="w-full glass flex items-center justify-center gap-2">
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="primary" className="w-full btn-luxury flex items-center justify-center gap-2 relative">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              profile.isHealer && (
                <>
                  <Link href={`/booking?consultantId=${profile.id}`} className="flex-1">
                    <Button variant="primary" className="w-full btn-luxury flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" /> Book
                    </Button>
                  </Link>
                  <Link href={`/chat/${profile.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full glass flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Chat
                    </Button>
                  </Link>
                  <Link href={`/call/${profile.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full glass flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> Call
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>

        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="w-full justify-center glass rounded-xl p-1">
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
    </div>
  );
}
