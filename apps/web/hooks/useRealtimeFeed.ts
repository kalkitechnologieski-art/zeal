"use client";

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeFeed(userId: string | undefined) {
  const { subscribe, isConnected } = useWebSocket(userId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !userId) return;

    const unsubscribe = subscribe('new_post', (data) => {
      // Optimistically update the feed
      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old) return [data.post];
        return [data.post, ...old];
      });
      // Invalidate for fresh data
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    });

    return () => unsubscribe();
  }, [isConnected, userId, subscribe, queryClient]);

  const sendCheer = useCallback((postId: string) => {
    // Optimistic update is handled in the component
    // This is just for sending the event
  }, []);

  return { sendCheer };
}
