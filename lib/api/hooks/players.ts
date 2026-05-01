import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  adaptPlayer,
  adaptPlayerDetail,
  type RawPlayer,
  type RawPlayerDetail,
} from "@/lib/api/adapters";
import { resolveId } from "@/lib/api/slugMap";
import type { PlayerProfile } from "@/data/types";

const STALE_5MIN = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// usePlayers — list players
// ---------------------------------------------------------------------------

interface UsePlayersParams {
  search?: string;
  nationality?: string;
  positionId?: number;
  clubId?: string;
  leagueId?: string;
  seasonId?: string;
}

export function usePlayers(params?: UsePlayersParams) {
  return useQuery<PlayerProfile[]>({
    queryKey: ["players", params],
    queryFn: async () => {
      const raw = await apiFetch<RawPlayer[]>(
        "/api/fan/players",
        params as Record<string, string | number | boolean | null | undefined>
      );
      return raw.map(adaptPlayer);
    },
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// usePlayer — single player detail
// ---------------------------------------------------------------------------

export function usePlayer(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<PlayerProfile>({
    queryKey: ["player", resolvedId],
    queryFn: async () => {
      const raw = await apiFetch<RawPlayerDetail>(
        `/api/fan/players/${resolvedId}`
      );
      return adaptPlayerDetail(raw);
    },
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// usePlayerStats — all-time stats for a player
// ---------------------------------------------------------------------------

export interface PlayerStats {
  totalAppearances: number;
  totalGoals: number;
  totalAssists: number;
  totalYellowCards: number;
  totalRedCards: number;
  goalsPerMatch: number;
  bestSeason?: { seasonId: string; seasonName: string; goals: number } | null;
  totalClubs: number;
  clubs: Array<{ clubId: string; clubName: string }>;
  totalLeagues: number;
  leagues: Array<{ leagueId: string; leagueName: string }>;
  rating?: { score: number; computedAt: string } | null;
}

export function usePlayerStats(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<PlayerStats>({
    queryKey: ["player-stats", resolvedId],
    queryFn: () =>
      apiFetch<PlayerStats>(`/api/fan/players/${resolvedId}/stats`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// usePlayerSeasons — career history
// ---------------------------------------------------------------------------

export interface PlayerSeasonEntry {
  seasonId: string;
  seasonName: string;
  leagueName: string;
  clubName: string;
  jerseyNumber: number;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  ratingScore?: number | null;
}

export function usePlayerSeasons(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<PlayerSeasonEntry[]>({
    queryKey: ["player-seasons", resolvedId],
    queryFn: () =>
      apiFetch<PlayerSeasonEntry[]>(`/api/fan/players/${resolvedId}/seasons`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// usePlayerMatches — match appearances for a player
// ---------------------------------------------------------------------------

export interface PlayerMatchAppearance {
  matchId: string;
  matchDate: string;
  homeClub: { id: string; name: string; logoUrl?: string | null };
  awayClub: { id: string; name: string; logoUrl?: string | null };
  homeScore: number;
  awayScore: number;
  lineupType: "starting" | "bench";
  shirtNumber: number;
  isCaptain: boolean;
  position?: { id: number; name: string; code: string } | null;
}

export function usePlayerMatches(
  playerId: string | undefined,
  params?: { seasonId?: string; clubId?: string }
) {
  const resolvedId = playerId ? resolveId(playerId) : undefined;
  return useQuery<PlayerMatchAppearance[]>({
    queryKey: ["player-matches", resolvedId, params],
    queryFn: () =>
      apiFetch<PlayerMatchAppearance[]>(
        `/api/fan/players/${resolvedId}/matches`,
        params as Record<string, string | number | boolean | null | undefined>
      ),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}
