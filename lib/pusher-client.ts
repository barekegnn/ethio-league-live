/**
 * Pusher client singleton for real-time match updates
 * 
 * The admin system broadcasts live match events via Pusher.
 * This client subscribes to match-specific channels to receive:
 * - Match events (goals, cards, substitutions)
 * - Score updates
 * - Match status changes
 */

import PusherClient from "pusher-js";

let client: PusherClient | null = null;

/**
 * Get or create the Pusher client instance
 * @returns Pusher client singleton
 */
export function getPusherClient(): PusherClient {
  if (client) return client;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error(
      "Missing Pusher configuration. Please set NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER in your environment variables."
    );
  }

  client = new PusherClient(key, {
    cluster,
  });

  return client;
}

/**
 * Pusher event names broadcast by the admin system
 */
export const PUSHER_EVENTS = {
  EVENT_CREATED: "match-event.created",
  EVENT_UPDATED: "match-event.updated",
  EVENT_DELETED: "match-event.deleted",
  SCORE_UPDATED: "match.score-updated",
  STATUS_CHANGED: "match.status-changed",
} as const;

/**
 * Get the channel name for a specific match
 * @param matchId - The match ID
 * @returns Channel name in format "match-{matchId}"
 */
export function getMatchChannelName(matchId: string): string {
  return `match-${matchId}`;
}
