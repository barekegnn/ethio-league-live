/**
 * TypeScript types for Pusher real-time match events
 */

/**
 * Match event payload received from Pusher
 */
export interface MatchEventPayload {
  id: string;
  matchId: string;
  minute: number;
  extraTime?: number | null;
  description?: string | null;
  eventType: {
    id: string;
    name: string; // "goal", "substitution", "yellow_card", etc.
  };
  player: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  relatedPlayer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  club: {
    id: string;
    name: string;
  } | null;
  createdAt?: string; // ISO timestamp
}

/**
 * Score update payload received from Pusher
 */
export interface ScoreUpdatePayload {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

/**
 * Match status change payload received from Pusher
 */
export interface StatusChangePayload {
  matchId: string;
  status: string; // "scheduled", "live", "completed"
  liveStartedAt: string | null; // ISO timestamp when match went live
}

/**
 * Event deletion payload received from Pusher
 */
export interface EventDeletePayload {
  id: string;
}

/**
 * Event type names and their display icons
 */
export const EVENT_TYPE_ICONS: Record<string, string> = {
  goal: "⚽",
  penalty_goal: "⚽",
  own_goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔁",
  assist: "🅰️",
  var: "📺",
} as const;

/**
 * Get display text for an event
 */
export function getEventDisplayText(event: MatchEventPayload): string {
  const playerName = event.player
    ? `${event.player.firstName} ${event.player.lastName}`
    : "";
  const relatedPlayerName = event.relatedPlayer
    ? `${event.relatedPlayer.firstName} ${event.relatedPlayer.lastName}`
    : "";

  switch (event.eventType.name) {
    case "goal":
      return `⚽ ${playerName}`;
    case "penalty_goal":
      return `⚽ (P) ${playerName}`;
    case "own_goal":
      return `⚽ (OG) ${playerName}`;
    case "yellow_card":
      return `🟨 ${playerName}`;
    case "red_card":
      return `🟥 ${playerName}`;
    case "substitution":
      return `🔁 ${playerName} → ${relatedPlayerName}`;
    case "assist":
      return `🅰️ ${playerName}`;
    default:
      return playerName || event.eventType.name;
  }
}
