"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  imageUrl: string;
  cheerCount: number;
  commentCount: number;
}

export function PostGrid({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => {});
  }, [userId]);

  if (posts.length === 0) {
    return <div className="text-center py-12 text-[#B8A1D9]">No posts yet</div>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <div
            key={post.id}
            className="aspect-square relative cursor-pointer group"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
              <span className="flex items-center gap-1">
                <Heart className="w-5 h-5 fill-white" />
                {post.cheerCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5" />
                {post.commentCount}
              </span>
            </div>
          </div>
        ))}
      </div>
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden">
            <img
              src={selectedPost.imageUrl}
              alt="Post"
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
