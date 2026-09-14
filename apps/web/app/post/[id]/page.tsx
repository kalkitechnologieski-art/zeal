"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PostCard, type PostCardData } from "@/components/feed/PostCard";
import { CommentThread } from "@/components/feed/CommentThread";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileQuestion } from "lucide-react";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery<{ post: PostCardData }>({
    queryKey: ["post", params.id],
    queryFn: async () => {
      const res = await fetch("/api/posts/" + params.id);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!params.id,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  if (error || !data?.post) return <EmptyState icon={FileQuestion} title="Post not found" description="This post may have been deleted." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#9D7DC5] hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </Link>
      <PostCard post={data.post} />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 p-4">
        <h2 className="font-semibold text-[#5E4B8B] dark:text-white mb-4">Comments</h2>
        <CommentThread postId={params.id} />
      </div>
    </div>
  );
}

