'use client';
import { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@zeal/ui';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    imageUrl?: string;
    author: {
      username: string;
      avatar: string;
    };
    cheerCount: number;
    commentCount: number;
    shareCount: number;
    createdAt: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  const [cheered, setCheered] = useState(false);
  const [cheers, setCheers] = useState(post.cheerCount);

  const handleCheer = async () => {
    const newCount = cheered ? cheers - 1 : cheers + 1;
    setCheers(newCount);
    setCheered(!cheered);
    // In production, call API to toggle cheer
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author.avatar} alt={post.author.username} />
          <AvatarFallback>{post.author.username?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-[#5E4B8B] dark:text-white">@{post.author.username}</p>
          <p className="text-xs text-[#B8A1D9] dark:text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post" className="w-full aspect-square object-cover" />
      )}
      <p className="p-4 text-[#5E4B8B] dark:text-white">{post.content}</p>
      <div className="flex items-center justify-around p-3 border-t border-[#E1C5E7] dark:border-gray-700">
        <button
          onClick={handleCheer}
          className={`flex items-center gap-1 text-sm transition-colors ${cheered ? 'text-red-500' : 'text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5]'}`}
        >
          <Heart className={`w-5 h-5 ${cheered ? 'fill-red-500' : ''}`} />
          <span>{cheers}</span>
        </button>
        <button className="flex items-center gap-1 text-sm text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post.commentCount}</span>
        </button>
        <button className="flex items-center gap-1 text-sm text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors">
          <Share2 className="w-5 h-5" />
          <span>{post.shareCount}</span>
        </button>
      </div>
    </motion.div>
  );
}
