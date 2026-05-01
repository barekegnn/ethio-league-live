import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  adaptClub,
  adaptClubDetail,
  adaptSeasonMatch,
  adaptPlayer,
  type RawClub,
  type RawClubDetail,
  type RawSeasonMatch,
  type RawPlayer,
} from "@/lib/api/adapters";
import { resolveId } from "@/lib/api/slugMap";
import type { Club, Match, PlayerProfile } from "@/data/types";

// ---------------------------------------------------------------------------
// Shared types for new hooks
// ---------------------------------------------------------------------------

export interface ClubCoach {
  coachId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  nationality?: string | null;
  licenseLevel?: string | null;
  role: string;
  season?: { id: string; name: string; status: string } | null;
}

export interface ClubStats {
  totalSeasons: number;
  totalMatches: number;
  totalWins: number;
  totalDraws: number;
  totalLosses: number;
  totalGoalsScored: number;
  totalGoalsConceded: number;
  winRate: number;
  bestSeason?: { seasonId: string; seasonName: string; points: number } | null;
  trophies: number;
  rating?: { score: number; computedAt: string } | null;
}

export interface ClubSeasonEntry {
  seasonId: string;
  seasonName: string;
  leagueName: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  topScorer?: { playerId: string; playerName: string; goals: number } | null;
}

const STALE_5MIN = 5 * 60 * 1000;
const STALE_1MIN = 1 * 60 * 1000;

// ---------------------------------------------------------------------------
// useClubCoaches — coaching staff for a club
// ---------------------------------------------------------------------------

export function useClubCoaches(
  clubId: string | undefined,
  params?: { seasonId?: string }
) {
  const resolvedId = clubId ? resolveId(clubId) : undefined;
  return useQuery<ClubCoach[]>({
    queryKey: ["club-coaches", resolvedId, params],
    queryFn: () =>
      apiFetch<ClubCoach[]>(
        `/api/fan/clubs/${resolvedId}/coaches`,
        params as Record<string, string | number | boolean | null | undefined>
      ),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useClubStats — all-time stats for a club
// ---------------------------------------------------------------------------

export function useClubStats(clubId: string | undefined) {
  const resolvedId = clubId ? resolveId(clubId) : undefined;
  return useQuery<ClubStats>({
    queryKey: ["club-stats", resolvedId],
    queryFn: () =>
      apiFetch<ClubStats>(`/api/fan/clubs/${resolvedId}/stats`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useClubSeasons — season history for a club
// ---------------------------------------------------------------------------

export function useClubSeasons(clubId: string | undefined) {
  const resolvedId = clubId ? resolveId(clubId) : undefined;
  return useQuery<ClubSeasonEntry[]>({
    queryKey: ["club-seasons", resolvedId],
    queryFn: () =>
      apiFetch<ClubSeasonEntry[]>(`/api/fan/clubs/${resolvedId}/seasons`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useClubs — list all clubs
// ---------------------------------------------------------------------------

interface UseClubsParams {
  search?: string;
  leagueId?: string;
  city?: string;
  country?: string;
}

export function useClubs(params?: UseClubsParams) {
  return useQuery<Club[]>({
    queryKey: ["clubs", params],
    queryFn: async () => {
      const raw = await apiFetch<RawClub[]>("/api/fan/clubs", params as Record<string, string | number | boolean | null | undefined>);
      return raw.map(adaptClub);
    },
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useClub — single club detail
// ---------------------------------------------------------------------------

export function useClub(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<Club>({
    queryKey: ["club", resolvedId],
    queryFn: async () => {
      const raw = await apiFetch<RawClubDetail>(
        `/api/fan/clubs/${resolvedId}`
      );
      return adaptClubDetail(raw);
    },
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useClubMatches — matches for a club
// ---------------------------------------------------------------------------

interface UseClubMatchesParams {
  seasonId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export function useClubMatches(
  clubId: string | undefined,
  params?: UseClubMatchesParams
) {
  const resolvedId = clubId ? resolveId(clubId) : undefined;
  return useQuery<Match[]>({
    queryKey: ["club-matches", resolvedId, params],
    queryFn: async () => {
      const raw = await apiFetch<RawSeasonMatch[]>(
        `/api/fan/clubs/${resolvedId}/matches`,
        params as Record<string, string | number | boolean | null | undefined>
      );
      return raw.map(adaptSeasonMatch);
    },
    enabled: !!resolvedId,
    staleTime: STALE_1MIN,
  });
}

// ---------------------------------------------------------------------------
// useClubPlayers — squad for a club
// ---------------------------------------------------------------------------

interface UseClubPlayersParams {
  seasonId?: string;
  positionId?: number;
  search?: string;
}

export function useClubPlayers(
  clubId: string | undefined,
  params?: UseClubPlayersParams
) {
  const resolvedId = clubId ? resolveId(clubId) : undefined;
  return useQuery<PlayerProfile[]>({
    queryKey: ["club-players", resolvedId, params],
    queryFn: async () => {
      const raw = await apiFetch<RawPlayer[]>(
        `/api/fan/clubs/${resolvedId}/players`,
        params as Record<string, string | number | boolean | null | undefined>
      );
      return raw.map(adaptPlayer);
    },
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}
