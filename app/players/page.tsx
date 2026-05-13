"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRatingsPlayers } from "@/lib/api/hooks/ratings";
import { ClubCrest } from "@/components/ClubCrest";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Show top-rated players — much more relevant for fans than a raw alphabetical list
  const { data: players, isLoading, error, refetch } = useRatingsPlayers({ limit: 200 });

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    if (!searchQuery.trim()) return players;
    
    const query = searchQuery.toLowerCase();
    return players.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const clubName = p.club?.name?.toLowerCase() || "";
      const position = p.position?.code?.toLowerCase() || "";
      return fullName.includes(query) || clubName.includes(query) || position.includes(query);
    });
  }, [players, searchQuery]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlayers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPlayers, currentPage]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader
        title="Top Players"
        action={
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-0.5 rounded bg-secondary">
            <Star className="w-3 h-3" /> Rated
          </span>
        }
      />

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search players by name, club, or position..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {isLoading && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-6 h-4 rounded" />
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Failed to load players.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {!isLoading && !error && filteredPlayers.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {searchQuery ? `No players found matching "${searchQuery}"` : "No player ratings yet."}
          </p>
        </div>
      )}

      {paginatedPlayers.length > 0 && (
        <>
          <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
            {paginatedPlayers.map((p) => (
              <Link
                key={p.playerId}
                href={`/players/${p.playerId}`}
                className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors"
              >
                {/* Rank */}
                <span className="w-6 text-center font-display font-bold text-muted-foreground text-sm tabular-nums shrink-0">
                  {p.rank}
                </span>
                {/* Avatar */}
                <PlayerAvatar
                  name={`${p.firstName} ${p.lastName}`}
                  photoUrl={p.photoUrl ?? undefined}
                  size={36}
                  ring={false}
                />
                {/* Club crest */}
                {p.club && <ClubCrest clubId={p.club.id} logoUrl={p.club.logoUrl ?? undefined} size={24} />}
                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.position?.code && (
                      <span className="mr-1 font-medium">{p.position.code}</span>
                    )}
                    {p.club?.name && <span>{p.club.name}</span>}
                  </div>
                </div>
                {/* Rating score */}
                <div className="text-right shrink-0">
                  <div className="font-display font-bold text-lg tabular-nums">
                    {p.ratingScore.toFixed(1)}
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground">Rating</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="text-xs text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPlayers.length)} of {filteredPlayers.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-xs font-medium px-3 py-1.5">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
