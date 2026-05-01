import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  adaptMatch,
  adaptMatchEvent,
  type RawMatch,
  type RawMatchEvent,
} from "@/lib/api/adapters";
import { resolveId } from "@/lib/api/slugMap";
import type { Match, MatchEventLite } from "@/data/types";

const STALE_1MIN = 1 * 60 * 1000;
const STALE_30S = 30 * 1000;
const STALE_5MIN = 5 * 60 * 1000;
const REFETCH_30S = 30 * 1000;

// ---------------------------------------------------------------------------
// useMatches — list matches with optional filters
// ---------------------------------------------------------------------------

interface UseMatchesParams {
  seasonId?: string;
  clubId?: string;
  status?: string;
  round?: number;
  from?: string;
  to?: string;
  stadiumId?: string;
}

export function useMatches(params?: UseMatchesParams) {
  return useQuery<Match[]>({
    queryKey: ["matches", params],
    queryFn: async () => {
      const raw = await apiFetch<RawMatch[]>(
        "/api/fan/matches",
        params as Record<string, string | number | boolean | null | undefined>
      );
      return raw.map(adaptMatch);
    },
    staleTime: STALE_1MIN,
  });
}

// ---------------------------------------------------------------------------
// useMatch — single match detail with live auto-refetch
// ---------------------------------------------------------------------------

export function useMatch(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<Match>({
    queryKey: ["match", resolvedId],
    queryFn: async () => {
      const raw = await apiFetch<RawMatch>(`/api/fan/matches/${resolvedId}`);
      return adaptMatch(raw);
    },
    enabled: !!resolvedId,
    staleTime: STALE_30S,
    // Refetch every 30s; the interval is controlled by the component
    // using the returned data.status to decide whether to keep polling.
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "live" ? REFETCH_30S : false;
    },
  });
}

// ---------------------------------------------------------------------------
// useMatchEvents — timeline events with live auto-refetch
// ---------------------------------------------------------------------------

export function useMatchEvents(
  matchId: string | undefined,
  matchStatus?: string
) {
  const resolvedId = matchId ? resolveId(matchId) : undefined;
  return useQuery<MatchEventLite[]>({
    queryKey: ["match-events", resolvedId],
    queryFn: async () => {
      const raw = await apiFetch<RawMatchEvent[]>(
        `/api/fan/matches/${resolvedId}/events`
      );
      return raw.map(adaptMatchEvent);
    },
    enabled: !!resolvedId,
    staleTime: matchStatus === "live" ? 0 : STALE_5MIN,
    refetchInterval: matchStatus === "live" ? REFETCH_30S : false,
  });
}

// ---------------------------------------------------------------------------
// useMatchLineups — starting XI and bench
// ---------------------------------------------------------------------------

export interface MatchLineupPlayer {
  playerId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  shirtNumber: number;
  position?: { id: number; name: string; code: string } | null;
  isCaptain: boolean;
  lineupType: "starting" | "bench";
}

export interface MatchLineupSide {
  clubId: string;
  clubName: string;
  clubLogo?: string | null;
  starting: MatchLineupPlayer[];
  bench: MatchLineupPlayer[];
}

export interface MatchLineups {
  home: MatchLineupSide;
  away: MatchLineupSide;
}

export function useMatchLineups(matchId: string | undefined) {
  const resolvedId = matchId ? resolveId(matchId) : undefined;
  return useQuery<MatchLineups>({
    queryKey: ["match-lineups", resolvedId],
    queryFn: () =>
      apiFetch<MatchLineups>(`/api/fan/matches/${resolvedId}/lineups`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useMatchMedia — photos and videos
// ---------------------------------------------------------------------------

export interface MatchMedia {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string | null;
  sortOrder: number;
}

export function useMatchMedia(
  matchId: string | undefined,
  params?: { mediaType?: "image" | "video" }
) {
  const resolvedId = matchId ? resolveId(matchId) : undefined;
  return useQuery<MatchMedia[]>({
    queryKey: ["match-media", resolvedId, params],
    queryFn: () =>
      apiFetch<MatchMedia[]>(`/api/fan/matches/${resolvedId}/media`, params),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}
