"use client";

import Link from "next/link";
import { useRatingsPlayers, useRatingsClubs } from "@/lib/api/hooks/ratings";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { ClubCrest } from "@/components/ClubCrest";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function RatingsPage() {
  const {
    data: players,
    isLoading: playersLoading,
    error: playersError,
    refetch: refetchPlayers,
  } = useRatingsPlayers();

  const {
    data: clubs,
    isLoading: clubsLoading,
    error: clubsError,
    refetch: refetchClubs,
  } = useRatingsClubs();

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Ratings</h1>

      <Tabs defaultValue="players">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
        </TabsList>

        {/* PLAYERS */}
        <TabsContent value="players" className="mt-4">
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
          {players && players.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No ratings yet.</div>
          )}
          {players && players.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
              {players.map((p) => (
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
          )}
        </TabsContent>

        {/* CLUBS */}
        <TabsContent value="clubs" className="mt-4">
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
          {clubs && clubs.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No ratings yet.</div>
          )}
          {clubs && clubs.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
              {clubs.map((c) => (
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
