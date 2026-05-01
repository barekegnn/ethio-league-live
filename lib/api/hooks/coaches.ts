import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { resolveId } from "@/lib/api/slugMap";

const STALE_5MIN = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// useCoach — single coach detail
// ---------------------------------------------------------------------------

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  nationality?: string | null;
  licenseLevel?: string | null;
  experienceYears?: number | null;
  originClub?: { id: string; name: string; logoUrl?: string | null } | null;
}

export function useCoach(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<Coach>({
    queryKey: ["coach", resolvedId],
    queryFn: () => apiFetch<Coach>(`/api/fan/coaches/${resolvedId}`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}

// ---------------------------------------------------------------------------
// useCoachSeasons — career history for a coach
// ---------------------------------------------------------------------------

export interface CoachSeasonEntry {
  seasonId: string;
  seasonName: string;
  leagueName: string;
  clubId: string;
  clubName: string;
  role: string;
  startDate_assignment?: string | null;
  endDate_assignment?: string | null;
}

export function useCoachSeasons(id: string | undefined) {
  const resolvedId = id ? resolveId(id) : undefined;
  return useQuery<CoachSeasonEntry[]>({
    queryKey: ["coach-seasons", resolvedId],
    queryFn: () =>
      apiFetch<CoachSeasonEntry[]>(`/api/fan/coaches/${resolvedId}/seasons`),
    enabled: !!resolvedId,
    staleTime: STALE_5MIN,
  });
}
