"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ClubCrest } from "@/components/ClubCrest";
import { useSearch } from "@/lib/api/hooks/search";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const { data: results, isLoading, error, refetch } = useSearch(q);

  const hasResults =
    (results?.leagues?.length ?? 0) > 0 ||
    (results?.clubs?.length ?? 0) > 0 ||
    (results?.players?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
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
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Leagues</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {results!.leagues.map((l) => (
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
        </section>
      )}

      {/* Clubs */}
      {(results?.clubs?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Clubs</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {results!.clubs.map((c) => (
              <Link key={c.id} href={`/clubs/${c.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                <ClubCrest clubId={c.id} logoUrl={c.logoUrl} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Players */}
      {(results?.players?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Players</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {results!.players.map((p) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                <ClubCrest clubId={p.clubId} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">#{p.number} · {p.position}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
