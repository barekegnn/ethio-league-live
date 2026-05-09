"use client";

import Link from "next/link";
import { useRatingsPlayers } from "@/lib/api/hooks/ratings";
import { ClubCrest } from "@/components/ClubCrest";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function PlayersPage() {
  // Show top-rated players — much more relevant for fans than a raw alphabetical list
  const { data: players, isLoading, error, refetch } = useRatingsPlayers({ limit: 50 });

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

      {players && (
        <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
          {players.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No player ratings yet.</div>
          )}
          {players.map((p) => (
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
      )}
    </div>
  );
}
