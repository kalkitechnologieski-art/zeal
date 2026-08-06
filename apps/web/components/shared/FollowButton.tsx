"use client";

import * as React from "react";
import { Button } from "@zeal/ui";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onToggle: (userId: string, isFollowing: boolean) => void;
}

export function FollowButton({ userId, isFollowing, onToggle }: FollowButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [following, setFollowing] = React.useState(isFollowing);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setFollowing(!following);
        onToggle(userId, !following);
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1"
    >
      {following ? (
        <><UserMinus className="w-4 h-4" /> Unfollow</>
      ) : (
        <><UserPlus className="w-4 h-4" /> Follow</>
      )}
    </Button>
  );
}
