import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  adaptSeasonStandingsRow,
  adaptSeasonMatch,
  adaptPlayer,
  type RawStandingsRow,
  type RawSeasonMatch,
  type RawPlayer,
} from "@/lib/api/adapters";
import type { StandingsRow, Match, PlayerProfile } from "@/data/types";

const STALE_2MIN = 2 * 60 * 1000;
const STALE_1MIN = 1 * 60 * 1000;
const STALE_5MIN = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// useSeasonStandings
// ---------------------------------------------------------------------------

export function useSeasonStandings(
  seasonId: string | undefined,
  params?: { clubId?: string }
) {
  return useQuery<StandingsRow[]>({
    queryKey: ["season-standings", seasonId, params],
    queryFn: async () => {
      const raw = await apiFetch<RawStandingsRow[]>(
        `/api/fan/seasons/${seasonId}/standings`,
        params
      );
      return raw.map(adaptSeasonStandingsRow);
    },
    enabled: !!seasonId,
    staleTime: STALE_2MIN,
  });
}

// ---------------------------------------------------------------------------
// useSeasonMatches
// ---------------------------------------------------------------------------

interface SeasonMatchesParams {
  round?: number;
  clubId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export function useSeasonMatches(
  seasonId: string | undefined,
  params?: SeasonMatchesParams
) {
  return useQuery<Match[]>({
    queryKey: ["season-matches", seasonId, params],
    queryFn: async () => {
      const raw = await apiFetch<RawSeasonMatch[]>(
        `/api/fan/seasons/${seasonId}/matches`,
        params as Record<string, string | number | boolean | null | undefined>
      );
      return raw.map(adaptSeasonMatch);
    },
    enabled: !!seasonId,
    staleTime: STALE_1MIN,
  });
}

// ---------------------------------------------------------------------------
// useSeasonTopScorers
// ---------------------------------------------------------------------------

export interface TopScorer {
  playerId: string;
  playerName: string;
  playerPhoto?: string | null;
  clubId: string;
  clubName: string;
  clubLogo?: string | null;
  goals: number;
}

export function useSeasonTopScorers(
  seasonId: string | undefined,
  params?: { limit?: number; clubId?: string }
) {
  return useQuery<TopScorer[]>({
    queryKey: ["season-top-scorers", seasonId, params],
    queryFn: () =>
      apiFetch<TopScorer[]>(
        `/api/fan/seasons/${seasonId}/top-scorers`,
        params as Record<string, string | number | boolean | null | undefined>
      ),
    enabled: !!seasonId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useSeasonDiscipline
// ---------------------------------------------------------------------------

export interface SeasonDiscipline {
  byPlayer: Array<{
    playerId: string;
    playerName: string;
    clubName: string;
    yellowCards: number;
    redCards: number;
  }>;
  byClub: Array<{
    clubId: string;
    clubName: string;
    yellowCards: number;
    redCards: number;
  }>;
}

export function useSeasonDiscipline(
  seasonId: string | undefined,
  params?: { clubId?: string; limit?: number }
) {
  return useQuery<SeasonDiscipline>({
    queryKey: ["season-discipline", seasonId, params],
    queryFn: () =>
      apiFetch<SeasonDiscipline>(
        `/api/fan/seasons/${seasonId}/discipline`,
        params as Record<string, string | number | boolean | null | undefined>
      ),
    enabled: !!seasonId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useSeasonPlayers — all players in a season
// ---------------------------------------------------------------------------

export function useSeasonPlayers(
  seasonId: string | undefined,
  params?: {
    search?: string;
    clubId?: string;
    positionId?: number;
    nationality?: string;
  }
) {
  return useQuery<PlayerProfile[]>({
    queryKey: ["season-players", seasonId, params],
    queryFn: async () => {
      const raw = await apiFetch<RawPlayer[]>(
        `/api/fan/seasons/${seasonId}/players`,
        params as Record<string, string | number | boolean | null | undefined>
      );
      return raw.map(adaptPlayer);
    },
    enabled: !!seasonId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useSeasonClubs — all clubs in a season
// ---------------------------------------------------------------------------

export interface SeasonClub {
  id: string;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
  country?: string | null;
  primaryStadium?: { id: string; name: string; capacity?: number | null } | null;
  squadSize?: number;
  coachCount?: number;
}

export function useSeasonClubs(
  seasonId: string | undefined,
  params?: { search?: string }
) {
  return useQuery<SeasonClub[]>({
    queryKey: ["season-clubs", seasonId, params],
    queryFn: () =>
      apiFetch<SeasonClub[]>(
        `/api/fan/seasons/${seasonId}/clubs`,
        params as Record<string, string | number | boolean | null | undefined>
      ),
    enabled: !!seasonId,
    staleTime: STALE_5MIN,
  });
}
