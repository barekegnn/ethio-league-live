"use client";

import Link from "next/link";
import { useLeagues } from "@/lib/api/hooks/leagues";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tierBadge = (tier: number) =>
  tier === 1 ? "Tier 1" : tier === 2 ? "Tier 2" : "Tier 3";

export default function LeaguesPage() {
  const { data: leagues, isLoading, error, refetch } = useLeagues();

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader title="Ethiopian Leagues" />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Failed to load leagues.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {leagues && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {leagues.map((l) => (
            <Link
              key={l.id}
              href={`/leagues/${l.id}`}
              className="group bg-card rounded-xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all p-4 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] grid place-items-center text-primary-foreground shrink-0">
                {l.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.logoUrl} alt={l.name} className="w-10 h-10 object-contain rounded" />
                ) : (
                  <Trophy className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold truncate">{l.name}</div>
                <div className="text-xs text-muted-foreground">
                  {tierBadge(l.tier)} · {l.season}
                  {l.gender && ` · ${l.gender === "men" ? "Men" : "Women"}`}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
          {leagues.length === 0 && (
            <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
              No leagues found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
