"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/SupabaseAuthProvider";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageSquare } from "lucide-react";

interface ConversationResponse {
  conversation: {
    id: string;
    userAId: string;
    userBId: string;
  };
  otherUser: { id: string; name: string | null; username: string; avatar: string | null } | null;
}

export default function ChatWindowPage() {
  const params = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery<ConversationResponse>({
    queryKey: ["chat", params.id, "meta"],
    queryFn: async () => {
      const res = await fetch("/api/chat/conversations?conversationId=" + params.id);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!params.id && !!user?.id,
  });

  if (authLoading || isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  }

  if (!user) {
    return <EmptyState icon={MessageSquare} title="Sign in required" description="Log in to view chats." action={{ label: "Sign in", href: "/auth/login" }} />;
  }

  if (error || !data) {
    return <EmptyState icon={MessageSquare} title="Conversation not found" description="It may have been deleted." />;
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-9rem)] flex flex-col">
      <ChatWindow
        conversationId={params.id}
        ownId={user.id}
        otherUser={data.otherUser}
      />
    </div>
  );
}

