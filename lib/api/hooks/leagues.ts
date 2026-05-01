import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  adaptLeague,
  adaptLeagueDetail,
  type RawLeague,
} from "@/lib/api/adapters";
import { resolveId } from "@/lib/api/slugMap";
import type { League } from "@/data/types";

const STALE_5MIN = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// useLeagues — list all active leagues
// ---------------------------------------------------------------------------

interface UseLeaguesParams {
  search?: string;
  genderCategory?: string;
  ageCategory?: string;
  status?: string;
}

export function useLeagues(params?: UseLeaguesParams) {
  return useQuery<League[]>({
    queryKey: ["leagues", params],
    queryFn: async () => {
      const raw = await apiFetch<RawLeague[]>("/api/fan/leagues", params as Record<string, string | number | boolean | null | undefined>);
      return raw.map(adaptLeague);
    },
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useLeague — single league detail
// ---------------------------------------------------------------------------

export function useLeague(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<League>({
    queryKey: ["league", resolvedId],
    queryFn: async () => {
      const raw = await apiFetch<RawLeague>(`/api/fan/leagues/${resolvedId}`);
      return adaptLeagueDetail(raw);
    },
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useLeagueSeasons — all seasons for a league
// ---------------------------------------------------------------------------

export interface RawSeason {
  id: string;
  name: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  _count?: { seasonClubs?: number; matches?: number } | null;
}

export function useLeagueSeasons(
  leagueId: string | undefined,
  params?: { status?: string }
) {
  const resolvedId = leagueId ? resolveId(leagueId) : undefined;
  return useQuery<RawSeason[]>({
    queryKey: ["league-seasons", resolvedId, params],
    queryFn: () =>
      apiFetch<RawSeason[]>(`/api/fan/leagues/${resolvedId}/seasons`, params),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useLeagueStats — all-time stats for a league
// ---------------------------------------------------------------------------

export interface LeagueStats {
  totalSeasons: number;
  totalMatches: number;
  totalGoals: number;
  totalClubs: number;
  avgGoalsPerMatch: number;
  topScorer?: {
    playerId: string;
    playerName: string;
    clubName: string;
    goals: number;
  } | null;
  mostTitlesClub?: {
    clubId: string;
    clubName: string;
    titles: number;
  } | null;
}

export function useLeagueStats(leagueId: string | undefined) {
  const resolvedId = leagueId ? resolveId(leagueId) : undefined;
  return useQuery<LeagueStats>({
    queryKey: ["league-stats", resolvedId],
    queryFn: () =>
      apiFetch<LeagueStats>(`/api/fan/leagues/${resolvedId}/stats`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}
