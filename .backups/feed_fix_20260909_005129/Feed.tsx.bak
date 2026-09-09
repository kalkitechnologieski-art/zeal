'use client';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFeed } from '@/hooks/useFeed';
import { PostCard } from './PostCard';
import { Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAppStore } from '@/lib/store/appStore';

export function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useFeed();
  const { ref: loadMoreRef, inView } = useInView();
  const socket = useSocket();
  const { addNotification } = useAppStore();

  // Real-time new post
  useEffect(() => {
    if (!socket) return;
    const handleNewPost = (newPost: any) => {
      refetch();
      addNotification({
        id: Date.now().toString(),
        type: 'new_post',
        message: `${newPost.author?.username || 'Someone'} posted something new!`,
        redirectUrl: '/dashboard',
        read: false,
        actorId: newPost.author?.id || 'system',
        createdAt: new Date().toISOString(),
      });
    };
    socket.on('feed:new_post', handleNewPost);
    return () => {
      socket.off('feed:new_post', handleNewPost);
    };
  }, [socket, refetch, addNotification]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-12 text-red-500">Failed to load feed. Please refresh.</div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (!posts.length) {
    return (
      <div className="text-center py-12 text-[#B8A1D9] dark:text-gray-400">
        No posts yet. Follow consultants to see their updates!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={loadMoreRef} className="h-8 flex justify-center">
        {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-[#9D7DC5]" />}
      </div>
    </div>
  );
}
