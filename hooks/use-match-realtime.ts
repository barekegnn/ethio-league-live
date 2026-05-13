/**
 * Custom hook for real-time match updates via Pusher
 * 
 * Subscribes to a match-specific Pusher channel and handles:
 * - Match events (goals, cards, substitutions)
 * - Score updates
 * - Match status changes
 * - Live match timer
 */

import { useEffect, useRef, useState } from "react";
import { getPusherClient, PUSHER_EVENTS, getMatchChannelName } from "@/lib/pusher-client";
import type {
  MatchEventPayload,
  ScoreUpdatePayload,
  StatusChangePayload,
  EventDeletePayload,
} from "@/lib/pusher-types";

interface UseMatchRealtimeOptions {
  matchId: string;
  initialStatus?: string;
  initialLiveStartedAt?: string | null;
  onEventCreated?: (event: MatchEventPayload) => void;
  onEventUpdated?: (event: MatchEventPayload) => void;
  onEventDeleted?: (eventId: string) => void;
  onScoreUpdated?: (score: ScoreUpdatePayload) => void;
  onStatusChanged?: (status: StatusChangePayload) => void;
}

export function useMatchRealtime({
  matchId,
  initialStatus = "scheduled",
  initialLiveStartedAt = null,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
  onScoreUpdated,
  onStatusChanged,
}: UseMatchRealtimeOptions) {
  const [status, setStatus] = useState(initialStatus);
  const [liveStartedAt, setLiveStartedAt] = useState<string | null>(initialLiveStartedAt);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Sync status/liveStartedAt when the REST API data arrives (after initial mount).
  // Pusher events take precedence once they start arriving, but we need the
  // correct baseline from the API so the timer starts correctly on page load.
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setLiveStartedAt(initialLiveStartedAt ?? null);
  }, [initialLiveStartedAt]);

  // Keep callbacks in refs so the Pusher subscription effect only runs when
  // matchId changes — not every time the parent re-renders with new inline fns.
  const onEventCreatedRef = useRef(onEventCreated);
  const onEventUpdatedRef = useRef(onEventUpdated);
  const onEventDeletedRef = useRef(onEventDeleted);
  const onScoreUpdatedRef = useRef(onScoreUpdated);
  const onStatusChangedRef = useRef(onStatusChanged);

  useEffect(() => { onEventCreatedRef.current = onEventCreated; }, [onEventCreated]);
  useEffect(() => { onEventUpdatedRef.current = onEventUpdated; }, [onEventUpdated]);
  useEffect(() => { onEventDeletedRef.current = onEventDeleted; }, [onEventDeleted]);
  useEffect(() => { onScoreUpdatedRef.current = onScoreUpdated; }, [onScoreUpdated]);
  useEffect(() => { onStatusChangedRef.current = onStatusChanged; }, [onStatusChanged]);

  // Subscribe to Pusher channel — only re-runs when matchId changes
  useEffect(() => {
    if (!matchId) return;

    try {
      const pusher = getPusherClient();
      const channelName = getMatchChannelName(matchId);
      const channel = pusher.subscribe(channelName);

      // Event created (goal, card, sub, etc.)
      channel.bind(PUSHER_EVENTS.EVENT_CREATED, (data: MatchEventPayload) => {
        console.log("[Pusher] Event created:", data);
        onEventCreatedRef.current?.(data);
      });

      // Event updated by MEA
      channel.bind(PUSHER_EVENTS.EVENT_UPDATED, (data: MatchEventPayload) => {
        console.log("[Pusher] Event updated:", data);
        onEventUpdatedRef.current?.(data);
      });

      // Event deleted
      channel.bind(PUSHER_EVENTS.EVENT_DELETED, (data: EventDeletePayload) => {
        console.log("[Pusher] Event deleted:", data);
        onEventDeletedRef.current?.(data.id);
      });

      // Score updated
      channel.bind(PUSHER_EVENTS.SCORE_UPDATED, (data: ScoreUpdatePayload) => {
        console.log("[Pusher] Score updated:", data);
        onScoreUpdatedRef.current?.(data);
      });

      // Status changed
      channel.bind(PUSHER_EVENTS.STATUS_CHANGED, (data: StatusChangePayload) => {
        console.log("[Pusher] Status changed:", data);
        setStatus(data.status);
        setLiveStartedAt(data.liveStartedAt);
        onStatusChangedRef.current?.(data);
      });

      console.log(`[Pusher] Subscribed to channel: ${channelName}`);

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
        console.log(`[Pusher] Unsubscribed from channel: ${channelName}`);
      };
    } catch (error) {
      console.error("[Pusher] Failed to subscribe:", error);
    }
  }, [matchId]); // only matchId — callbacks are accessed via refs

  // Live match timer
  useEffect(() => {
    if (status !== "live" || !liveStartedAt) {
      setElapsedMinutes(0);
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(liveStartedAt).getTime();
      const now = Date.now();
      const mins = Math.floor((now - startTime) / 60000);
      setElapsedMinutes(mins);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [status, liveStartedAt]);

  return {
    status,
    liveStartedAt,
    elapsedMinutes,
    isLive: status === "live",
  };
}
