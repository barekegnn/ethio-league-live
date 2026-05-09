"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMatches } from "@/lib/api/hooks/matches";
import { MatchCard } from "@/components/MatchCard";
import { ClubCrest } from "@/components/ClubCrest";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Match } from "@/data/types";

type Filter = "live" | "today" | "upcoming" | "results";

const groupByDate = (list: Match[]) => {
  const groups = new Map<string, Match[]>();
  for (const m of list) {
    const key = new Date(m.kickoff).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return Array.from(groups.entries());
};

const groupByRound = (list: Match[]) => {
  const groups = new Map<number, Match[]>();
  for (const m of list) {
    const round = m.matchday ?? 0;
    if (!groups.has(round)) groups.set(round, []);
    groups.get(round)!.push(m);
  }
  // Sort rounds descending (most recent first)
  return Array.from(groups.entries()).sort(([a], [b]) => b - a);
};

export default function MatchesPage() {
  const [filter, setFilter] = useState<Filter>("today");
  const { data: allMatches, isLoading, error, refetch } = useMatches();

  const filtered = useMemo(() => {
    if (!allMatches) return [];
    const todayKey = new Date().toDateString();
    switch (filter) {
      case "live":
        return allMatches.filter((m) => m.status === "live");
      case "today":
        return allMatches.filter((m) => new Date(m.kickoff).toDateString() === todayKey);
      case "upcoming":
        return allMatches
          .filter((m) => m.status === "scheduled")
          .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
      case "results":
        return allMatches
          .filter((m) => m.status === "completed")
          .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff));
    }
  }, [filter, allMatches]);

  const groupedByDate = useMemo(() => groupByDate(filtered), [filtered]);
  const groupedByRound = useMemo(
    () => (filter === "results" ? groupByRound(filtered) : []),
    [filter, filtered]
  );

  const liveCount = allMatches?.filter((m) => m.status === "live").length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Matches</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="live" className="gap-1.5">
            <span className={cn(liveCount > 0 && "live-dot w-1.5 h-1.5")} />
            Live
          </TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load matches.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
            </div>
          )}

          {/* ── Results: grouped by round ── */}
          {!isLoading && !error && filter === "results" && (
            groupedByRound.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No results yet.</div>
            ) : (
              <div className="space-y-4">
                {groupedByRound.map(([round, matches]) => (
                  <div key={round} className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
                    <div className="px-4 py-2.5 bg-secondary/50 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Round {round}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {matches.length} match{matches.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {matches.map((m) => (
                        <Link
                          key={m.id}
                          href={`/match/${m.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <span className="text-sm font-semibold truncate text-right">
                              {m.homeClubName ?? m.homeId}
                            </span>
                            <ClubCrest clubId={m.homeId} logoUrl={m.homeClubLogo} size={24} />
                          </div>
                          <div className="flex flex-col items-center shrink-0 min-w-[56px]">
                            <span className="font-display font-bold text-base tabular-nums">
                              {m.homeScore}–{m.awayScore}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground">FT</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <ClubCrest clubId={m.awayId} logoUrl={m.awayClubLogo} size={24} />
                            <span className="text-sm font-semibold truncate">
                              {m.awayClubName ?? m.awayId}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Live / Today / Upcoming: grouped by date ── */}
          {!isLoading && !error && filter !== "results" && (
            groupedByDate.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No matches in this view.</div>
            ) : (
              <div className="space-y-6">
                {groupedByDate.map(([date, list]) => (
                  <section key={date}>
                    <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {list.map((m) => (
                        <MatchCard key={m.id} match={m} showLeague />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
