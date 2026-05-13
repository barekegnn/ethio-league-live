"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ClubCrest } from "@/components/ClubCrest";
import { useSearch } from "@/lib/api/hooks/search";

const ITEMS_PER_PAGE = 10;

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [leaguesPage, setLeaguesPage] = useState(1);
  const [clubsPage, setClubsPage] = useState(1);
  const [playersPage, setPlayersPage] = useState(1);
  
  const { data: results, isLoading, error, refetch } = useSearch(q);

  // Reset pagination when search query changes
  const handleSearchChange = (value: string) => {
    setQ(value);
    setLeaguesPage(1);
    setClubsPage(1);
    setPlayersPage(1);
  };

  const hasResults =
    (results?.leagues?.length ?? 0) > 0 ||
    (results?.clubs?.length ?? 0) > 0 ||
    (results?.players?.length ?? 0) > 0;

  // Pagination logic
  const paginatedLeagues = useMemo(() => {
    if (!results?.leagues) return [];
    const start = (leaguesPage - 1) * ITEMS_PER_PAGE;
    return results.leagues.slice(start, start + ITEMS_PER_PAGE);
  }, [results?.leagues, leaguesPage]);
  const leaguesTotalPages = Math.ceil((results?.leagues?.length || 0) / ITEMS_PER_PAGE);

  const paginatedClubs = useMemo(() => {
    if (!results?.clubs) return [];
    const start = (clubsPage - 1) * ITEMS_PER_PAGE;
    return results.clubs.slice(start, start + ITEMS_PER_PAGE);
  }, [results?.clubs, clubsPage]);
  const clubsTotalPages = Math.ceil((results?.clubs?.length || 0) / ITEMS_PER_PAGE);

  const paginatedPlayers = useMemo(() => {
    if (!results?.players) return [];
    const start = (playersPage - 1) * ITEMS_PER_PAGE;
    return results.players.slice(start, start + ITEMS_PER_PAGE);
  }, [results?.players, playersPage]);
  const playersTotalPages = Math.ceil((results?.players?.length || 0) / ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search clubs, players, leagues..."
          className="pl-9 h-12 text-base"
        />
      </div>

      {/* Empty state */}
      {!q && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Start typing to search across clubs, players, and leagues.
        </p>
      )}

      {/* Loading */}
      {isLoading && q.length >= 2 && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Search failed. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {/* No results */}
      {!isLoading && !error && q.length >= 2 && !hasResults && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No results for &ldquo;{q}&rdquo;.
        </p>
      )}

      {/* Leagues */}
      {(results?.leagues?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Leagues ({results!.leagues.length})
            </h2>
          </div>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {paginatedLeagues.map((l) => (
              <Link key={l.id} href={`/leagues/${l.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                <div className="w-8 h-8 rounded bg-primary/10 grid place-items-center text-primary text-xs font-bold shrink-0">
                  {l.shortName.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.season}</div>
                </div>
              </Link>
            ))}
          </div>
          {/* Pagination */}
          {leaguesTotalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="text-xs text-muted-foreground">
                Showing {((leaguesPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(leaguesPage * ITEMS_PER_PAGE, results!.leagues.length)} of {results!.leagues.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeaguesPage((p) => Math.max(1, p - 1))}
                  disabled={leaguesPage === 1}
                >
                  Previous
                </Button>
                <div className="text-xs font-medium px-3 py-1.5">
                  Page {leaguesPage} of {leaguesTotalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeaguesPage((p) => Math.min(leaguesTotalPages, p + 1))}
                  disabled={leaguesPage === leaguesTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Clubs */}
      {(results?.clubs?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Clubs ({results!.clubs.length})
            </h2>
          </div>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {paginatedClubs.map((c) => (
              <Link key={c.id} href={`/clubs/${c.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                <ClubCrest clubId={c.id} logoUrl={c.logoUrl} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}</div>
                </div>
              </Link>
            ))}
          </div>
          {/* Pagination */}
          {clubsTotalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="text-xs text-muted-foreground">
                Showing {((clubsPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(clubsPage * ITEMS_PER_PAGE, results!.clubs.length)} of {results!.clubs.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClubsPage((p) => Math.max(1, p - 1))}
                  disabled={clubsPage === 1}
                >
                  Previous
                </Button>
                <div className="text-xs font-medium px-3 py-1.5">
                  Page {clubsPage} of {clubsTotalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClubsPage((p) => Math.min(clubsTotalPages, p + 1))}
                  disabled={clubsPage === clubsTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Players */}
      {(results?.players?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Players ({results!.players.length})
            </h2>
          </div>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {paginatedPlayers.map((p) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                <ClubCrest clubId={p.clubId} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">#{p.number} · {p.position}</div>
                </div>
              </Link>
            ))}
          </div>
          {/* Pagination */}
          {playersTotalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="text-xs text-muted-foreground">
                Showing {((playersPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(playersPage * ITEMS_PER_PAGE, results!.players.length)} of {results!.players.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlayersPage((p) => Math.max(1, p - 1))}
                  disabled={playersPage === 1}
                >
                  Previous
                </Button>
                <div className="text-xs font-medium px-3 py-1.5">
                  Page {playersPage} of {playersTotalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlayersPage((p) => Math.min(playersTotalPages, p + 1))}
                  disabled={playersPage === playersTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
