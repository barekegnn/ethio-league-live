"use client";

import Link from "next/link";
import { usePlayers } from "@/lib/api/hooks/players";
import { ClubCrest } from "@/components/ClubCrest";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PlayersPage() {
  const { data: players, isLoading, error, refetch } = usePlayers();

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader title="Players" />

      {isLoading && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Failed to load players.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {players && (
        <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
          {players.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No players found.</div>
          )}
          {players.map((p) => (
            <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
              <PlayerAvatar name={p.name} photoUrl={p.photoUrl} size={32} ring={false} />
              <ClubCrest clubId={p.clubId} size={24} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.number ? `#${p.number} · ` : ""}{p.position}
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-display font-bold text-base text-foreground tabular-nums">{p.goals}</span>
                <span className="text-muted-foreground"> G</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
