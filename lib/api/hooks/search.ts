import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api/client";
import { adaptSearchResult, type RawSearchResult } from "@/lib/api/adapters";
import type { AdaptedSearchResult } from "@/lib/api/adapters";

const STALE_30S = 30 * 1000;
const DEBOUNCE_MS = 300;

// ---------------------------------------------------------------------------
// useSearch — global search with debounce and minimum query length
// ---------------------------------------------------------------------------

export function useSearch(query: string, type?: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const isEnabled = debouncedQuery.length >= 2;

  return useQuery<AdaptedSearchResult>({
    queryKey: ["search", debouncedQuery, type],
    queryFn: async () => {
      const raw = await apiFetch<RawSearchResult>("/api/fan/search", {
        q: debouncedQuery,
        type,
      });
      return adaptSearchResult(raw);
    },
    enabled: isEnabled,
    staleTime: STALE_30S,
    placeholderData: {
      query: debouncedQuery,
      leagues: [],
      clubs: [],
      players: [],
    },
  });
}
