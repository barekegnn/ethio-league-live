import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

const STALE_5MIN = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// useRatingsPlayers — ranked player ratings
// ---------------------------------------------------------------------------

export interface RatedPlayer {
  rank: number;
  playerId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  nationality?: string | null;
  position?: { id: number; name: string; code: string } | null;
  club?: { id: string; name: string; logoUrl?: string | null } | null;
  ratingScore: number;
  ratingComputedAt: string;
}

export function useRatingsPlayers(params?: {
  leagueId?: string;
  seasonId?: string;
  limit?: number;
  search?: string;
}) {
  return useQuery<RatedPlayer[]>({
    queryKey: ["ratings-players", params],
    queryFn: () =>
      apiFetch<RatedPlayer[]>(
        "/api/fan/ratings/players",
        params as Record<string, string | number | boolean | null | undefined>
      ),
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useRatingsClubs — ranked club ratings
// ---------------------------------------------------------------------------

export interface RatedClub {
  rank: number;
  clubId: string;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
  country?: string | null;
  league?: { id: string; name: string } | null;
  ratingScore: number;
  ratingComputedAt: string;
}

export function useRatingsClubs(params?: {
  leagueId?: string;
  limit?: number;
  search?: string;
}) {
  return useQuery<RatedClub[]>({
    queryKey: ["ratings-clubs", params],
    queryFn: () =>
      apiFetch<RatedClub[]>(
        "/api/fan/ratings/clubs",
        params as Record<string, string | number | boolean | null | undefined>
      ),
    staleTime: STALE_5MIN,
  });
}
