"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRatingsPlayers, useRatingsClubs } from "@/lib/api/hooks/ratings";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { ClubCrest } from "@/components/ClubCrest";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function RatingsPage() {
  const [playerSearch, setPlayerSearch] = useState("");
  const [clubSearch, setClubSearch] = useState("");
  const [playerPage, setPlayerPage] = useState(1);
  const [clubPage, setClubPage] = useState(1);

  const {
    data: players,
    isLoading: playersLoading,
    error: playersError,
    refetch: refetchPlayers,
  } = useRatingsPlayers({ limit: 200 });

  const {
    data: clubs,
    isLoading: clubsLoading,
    error: clubsError,
    refetch: refetchClubs,
  } = useRatingsClubs({ limit: 100 });

  // Filter players
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    if (!playerSearch.trim()) return players;
    
    const query = playerSearch.toLowerCase();
    return players.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const clubName = p.club?.name?.toLowerCase() || "";
      const position = p.position?.code?.toLowerCase() || "";
      return fullName.includes(query) || clubName.includes(query) || position.includes(query);
    });
  }, [players, playerSearch]);

  // Filter clubs
  const filteredClubs = useMemo(() => {
    if (!clubs) return [];
    if (!clubSearch.trim()) return clubs;
    
    const query = clubSearch.toLowerCase();
    return clubs.filter((c) => {
      const name = c.name.toLowerCase();
      const city = c.city?.toLowerCase() || "";
      return name.includes(query) || city.includes(query);
    });
  }, [clubs, clubSearch]);

  // Paginate players
  const playerTotalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = useMemo(() => {
    const start = (playerPage - 1) * ITEMS_PER_PAGE;
    return filteredPlayers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPlayers, playerPage]);

  // Paginate clubs
  const clubTotalPages = Math.ceil(filteredClubs.length / ITEMS_PER_PAGE);
  const paginatedClubs = useMemo(() => {
    const start = (clubPage - 1) * ITEMS_PER_PAGE;
    return filteredClubs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClubs, clubPage]);

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Ratings</h1>

      <Tabs defaultValue="players">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
        </TabsList>

        {/* PLAYERS */}
        <TabsContent value="players" className="mt-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search players by name, club, or position..."
              value={playerSearch}
              onChange={(e) => {
                setPlayerSearch(e.target.value);
                setPlayerPage(1);
              }}
              className="pl-9 h-10"
            />
          </div>

          {playersLoading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          )}
          {playersError && !playersLoading && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load player ratings.</p>
              <Button variant="outline" size="sm" onClick={() => refetchPlayers()}>Try again</Button>
            </div>
          )}
          {!playersLoading && !playersError && filteredPlayers.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {playerSearch ? `No players found matching "${playerSearch}"` : "No ratings yet."}
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
                    className="flex items-center gap-3 p-3 hover:bg-secondary/40"
                  >
                    <span className="w-6 text-center font-display font-bold text-muted-foreground tabular-nums">
                      {p.rank}
                    </span>
                    <PlayerAvatar
                      name={`${p.firstName} ${p.lastName}`}
                      photoUrl={p.photoUrl ?? undefined}
                      size={36}
                      ring={false}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.position?.code && <span>{p.position.code}</span>}
                        {p.position?.code && p.club?.name && <span> · </span>}
                        {p.club?.name && <span>{p.club.name}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-2xl tabular-nums">
                        {p.ratingScore.toFixed(1)}
                      </div>
                      <div className="text-[10px] uppercase text-muted-foreground">Rating</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {playerTotalPages > 1 && (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {((playerPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(playerPage * ITEMS_PER_PAGE, filteredPlayers.length)} of {filteredPlayers.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlayerPage((p) => Math.max(1, p - 1))}
                      disabled={playerPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-xs font-medium px-3 py-1.5">
                      Page {playerPage} of {playerTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlayerPage((p) => Math.min(playerTotalPages, p + 1))}
                      disabled={playerPage === playerTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* CLUBS */}
        <TabsContent value="clubs" className="mt-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search clubs by name or city..."
              value={clubSearch}
              onChange={(e) => {
                setClubSearch(e.target.value);
                setClubPage(1);
              }}
              className="pl-9 h-10"
            />
          </div>

          {clubsLoading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          )}
          {clubsError && !clubsLoading && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load club ratings.</p>
              <Button variant="outline" size="sm" onClick={() => refetchClubs()}>Try again</Button>
            </div>
          )}
          {!clubsLoading && !clubsError && filteredClubs.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {clubSearch ? `No clubs found matching "${clubSearch}"` : "No ratings yet."}
              </p>
            </div>
          )}
          {paginatedClubs.length > 0 && (
            <>
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {paginatedClubs.map((c) => (
                  <Link
                    key={c.clubId}
                    href={`/clubs/${c.clubId}`}
                    className="flex items-center gap-3 p-3 hover:bg-secondary/40"
                  >
                    <span className="w-6 text-center font-display font-bold text-muted-foreground tabular-nums">
                      {c.rank}
                    </span>
                    <ClubCrest clubId={c.clubId} logoUrl={c.logoUrl ?? undefined} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      {c.city && (
                        <div className="text-xs text-muted-foreground truncate">{c.city}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-2xl tabular-nums">
                        {c.ratingScore.toFixed(1)}
                      </div>
                      <div className="text-[10px] uppercase text-muted-foreground">Rating</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {clubTotalPages > 1 && (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {((clubPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(clubPage * ITEMS_PER_PAGE, filteredClubs.length)} of {filteredClubs.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClubPage((p) => Math.max(1, p - 1))}
                      disabled={clubPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-xs font-medium px-3 py-1.5">
                      Page {clubPage} of {clubTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClubPage((p) => Math.min(clubTotalPages, p + 1))}
                      disabled={clubPage === clubTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
