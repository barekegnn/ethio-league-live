"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useMatches } from "@/lib/api/hooks/matches";
import { useLeagues } from "@/lib/api/hooks/leagues";
import { MatchCard } from "@/components/MatchCard";
import { ClubCrest } from "@/components/ClubCrest";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
import type { Match } from "@/data/types";

type Filter = "live" | "today" | "upcoming" | "results";

// ── Collapsible section ───────────────────────────────────────────────────────
// A clickable header that expands/collapses its content.
function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header — click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{title}</span>
          {badge && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Collapsible body */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Live timer hook ───────────────────────────────────────────────────────────
function useLiveMinute(liveStartedAt: string | null | undefined): number {
  const [minute, setMinute] = useState(() => {
    if (!liveStartedAt) return 0;
    return Math.floor((Date.now() - new Date(liveStartedAt).getTime()) / 60000);
  });

  useEffect(() => {
    if (!liveStartedAt) return;
    const update = () =>
      setMinute(Math.floor((Date.now() - new Date(liveStartedAt).getTime()) / 60000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [liveStartedAt]);

  return minute;
}

// ── Compact match row (live + results) ────────────────────────────────────────
function MatchRow({ m }: { m: Match }) {
  const isLive = m.status === "live";
  const liveMinute = useLiveMinute(isLive ? m.liveStartedAt : null);

  return (
    <Link
      href={`/match/${m.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-sm font-semibold truncate text-right">
          {m.homeClubName ?? m.homeId}
        </span>
        <ClubCrest clubId={m.homeId} logoUrl={m.homeClubLogo} size={24} />
      </div>
      <div className="flex flex-col items-center shrink-0 min-w-[60px]">
        {isLive ? (
          <>
            <span className="font-display font-bold text-base tabular-nums text-live">
              {m.homeScore}–{m.awayScore}
            </span>
            <span className="text-[9px] font-bold text-live flex items-center gap-0.5">
              <span className="live-dot w-1 h-1" />{liveMinute}&apos;
            </span>
          </>
        ) : (
          <>
            <span className="font-display font-bold text-base tabular-nums">
              {m.homeScore}–{m.awayScore}
            </span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">FT</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ClubCrest clubId={m.awayId} logoUrl={m.awayClubLogo} size={24} />
        <span className="text-sm font-semibold truncate">
          {m.awayClubName ?? m.awayId}
        </span>
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const [filter, setFilter] = useState<Filter>("live");
  const { data: allMatches, isLoading, error, refetch } = useMatches();
  const { data: leagues } = useLeagues();
  const [seasonToLeagueNameMap, setSeasonToLeagueNameMap] = useState<Map<string, string>>(new Map());

  // ── DEBUG: log raw matches data from the API ──────────────────────────────
  useEffect(() => {
    if (!allMatches) return;

    const live = allMatches.filter(m => m.status === "live");

    console.group(`🔴 Live matches (${live.length})`);
    if (live.length === 0) {
      console.log("No live matches right now.");
    } else {
      live.forEach(m => console.log(m));
    }
    console.groupEnd();
  }, [allMatches]);
  // ─────────────────────────────────────────────────────────────────────────

  // Create a simple league ID → league name map as fallback
  const leagueIdToNameMap = useMemo(() => {
    const map = new Map<string, string>();
    leagues?.forEach((league) => {
      map.set(league.id, league.name);
    });
    return map;
  }, [leagues]);

  // Fetch season data to build seasonId → leagueName map
  useEffect(() => {
    if (!allMatches || allMatches.length === 0) return;

    // Get unique season IDs from all matches
    const uniqueSeasonIds = Array.from(new Set(allMatches.map(m => m.leagueId)));

    // Fetch season data for each unique season ID
    Promise.all(
      uniqueSeasonIds.map(async (seasonId) => {
        try {
          const seasonData = await apiFetch<{
            id: string;
            name: string;
            league: { id: string; name: string };
          }>(`/api/fan/seasons/${seasonId}`);
          return { seasonId, leagueName: seasonData.league.name };
        } catch (err) {
          console.error(`Failed to fetch season ${seasonId}:`, err);
          return { seasonId, leagueName: "Unknown League" };
        }
      })
    ).then((results) => {
      const map = new Map<string, string>();
      results.forEach(({ seasonId, leagueName }) => {
        map.set(seasonId, leagueName);
      });
      setSeasonToLeagueNameMap(map);
    });
  }, [allMatches]);

  // ── Derived lists ──────────────────────────────────────────────────────────
  const live = useMemo(
    () => allMatches?.filter((m) => m.status === "live") ?? [],
    [allMatches]
  );
  const today = useMemo(() => {
    const key = new Date().toDateString();
    return allMatches?.filter((m) => new Date(m.kickoff).toDateString() === key) ?? [];
  }, [allMatches]);
  const upcoming = useMemo(
    () =>
      (allMatches?.filter((m) => m.status === "scheduled") ?? []).sort(
        (a, b) => +new Date(a.kickoff) - +new Date(b.kickoff)
      ),
    [allMatches]
  );
  const results = useMemo(
    () =>
      (allMatches?.filter((m) => m.status === "completed") ?? []).sort(
        (a, b) => +new Date(b.kickoff) - +new Date(a.kickoff)
      ),
    [allMatches]
  );

  // ── Group live by league → round ──────────────────────────────────────────
  const liveByLeagueAndRound = useMemo(() => {
    const leagueMap = new Map<string, { name: string; rounds: Map<number, Match[]> }>();
    for (const m of live) {
      if (!leagueMap.has(m.leagueId)) {
        leagueMap.set(m.leagueId, {
          // Use embedded league name from match, or season map, or fall back to league map lookup
          name: m.leagueName || seasonToLeagueNameMap.get(m.leagueId) || leagueIdToNameMap.get(m.leagueId) || "Unknown League",
          rounds: new Map(),
        });
      }
      const leagueData = leagueMap.get(m.leagueId)!;
      const round = m.matchday ?? 0;
      if (!leagueData.rounds.has(round)) leagueData.rounds.set(round, []);
      leagueData.rounds.get(round)!.push(m);
    }
    return Array.from(leagueMap.entries()).map(([leagueId, data]) => ({
      leagueId,
      leagueName: data.name,
      rounds: Array.from(data.rounds.entries()).sort(([a], [b]) => a - b),
    }));
  }, [live, leagueIdToNameMap, seasonToLeagueNameMap]);

  // ── Group upcoming by league → round ──────────────────────────────────────
  const upcomingByLeagueAndRound = useMemo(() => {
    const leagueMap = new Map<string, { name: string; rounds: Map<number, Match[]> }>();
    for (const m of upcoming) {
      if (!leagueMap.has(m.leagueId)) {
        leagueMap.set(m.leagueId, {
          name: m.leagueName || seasonToLeagueNameMap.get(m.leagueId) || leagueIdToNameMap.get(m.leagueId) || "Unknown League",
          rounds: new Map(),
        });
      }
      const leagueData = leagueMap.get(m.leagueId)!;
      const round = m.matchday ?? 0;
      if (!leagueData.rounds.has(round)) leagueData.rounds.set(round, []);
      leagueData.rounds.get(round)!.push(m);
    }
    return Array.from(leagueMap.entries()).map(([leagueId, data]) => ({
      leagueId,
      leagueName: data.name,
      rounds: Array.from(data.rounds.entries()).sort(([a], [b]) => a - b),
    }));
  }, [upcoming, seasonToLeagueNameMap, leagueIdToNameMap]);

  // ── Group results by league → round ───────────────────────────────────────
  const resultsByLeagueAndRound = useMemo(() => {
    const leagueMap = new Map<string, { name: string; rounds: Map<number, Match[]> }>();
    for (const m of results) {
      if (!leagueMap.has(m.leagueId)) {
        leagueMap.set(m.leagueId, {
          name: m.leagueName || seasonToLeagueNameMap.get(m.leagueId) || leagueIdToNameMap.get(m.leagueId) || "Unknown League",
          rounds: new Map(),
        });
      }
      const leagueData = leagueMap.get(m.leagueId)!;
      const round = m.matchday ?? 0;
      if (!leagueData.rounds.has(round)) leagueData.rounds.set(round, []);
      leagueData.rounds.get(round)!.push(m);
    }
    return Array.from(leagueMap.entries()).map(([leagueId, data]) => ({
      leagueId,
      leagueName: data.name,
      rounds: Array.from(data.rounds.entries()).sort(([a], [b]) => b - a), // most recent first
    }));
  }, [results, seasonToLeagueNameMap, leagueIdToNameMap]);

  const liveCount = live.length;

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Matches</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex gap-1">
          <TabsTrigger value="live" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
            <span className={cn(liveCount > 0 && "live-dot w-1.5 h-1.5")} />
            Live
            {liveCount > 0 && (
              <span className="text-[10px] tabular-nums opacity-70">{liveCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="today" className="text-xs sm:text-sm px-2 sm:px-3">Today</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm px-2 sm:px-3">Upcoming</TabsTrigger>
          <TabsTrigger value="results" className="text-xs sm:text-sm px-2 sm:px-3">Results</TabsTrigger>
        </TabsList>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !isLoading && (
          <div className="mt-4 bg-card rounded-xl border border-border p-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Failed to load matches.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LIVE — collapsible by league → round
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="live" className="mt-4 space-y-2">
            {liveCount === 0 ? (
              <div className="bg-card rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
                No live matches right now.
              </div>
            ) : liveByLeagueAndRound.length === 1 && liveByLeagueAndRound[0].rounds.length === 1 ? (
              // Only one league and one round — show matches directly without collapsible
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border overflow-hidden">
                {liveByLeagueAndRound[0].rounds[0][1].map((m) => <MatchRow key={m.id} m={m} />)}
              </div>
            ) : (
              // Multiple leagues or rounds — organize by league (collapsible) → round (collapsible)
              liveByLeagueAndRound.map(({ leagueId, leagueName, rounds }, leagueIdx) => {
                const totalMatches = rounds.reduce((sum, [, matches]) => sum + matches.length, 0);
                
                return (
                  <CollapsibleSection
                    key={leagueId}
                    title={leagueName}
                    badge={`${totalMatches} live`}
                    defaultOpen={leagueIdx === 0}
                  >
                    <div className="space-y-0">
                      {/* Rounds within this league */}
                      {rounds.map(([round, matches], roundIdx) => (
                        <div key={`${leagueId}-${round}`} className="border-t border-border first:border-t-0">
                          <CollapsibleSection
                            title={`Round ${round}`}
                            badge={`${matches.length} match${matches.length !== 1 ? "es" : ""}`}
                            defaultOpen={roundIdx === 0}
                          >
                            <div className="divide-y divide-border">
                              {matches.map((m) => <MatchRow key={m.id} m={m} />)}
                            </div>
                          </CollapsibleSection>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                );
              })
            )}
          </TabsContent>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TODAY — flat list grouped by time
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="today" className="mt-4">
            {today.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No matches today.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {today
                  .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
                  .map((m) => <MatchCard key={m.id} match={m} showLeague />)}
              </div>
            )}
          </TabsContent>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            UPCOMING — collapsible by league → round
            First round of first league open by default, rest collapsed
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="upcoming" className="mt-4 space-y-2">
            {upcomingByLeagueAndRound.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No upcoming fixtures.</div>
            ) : (
              upcomingByLeagueAndRound.map(({ leagueId, leagueName, rounds }, leagueIdx) => {
                const totalMatches = rounds.reduce((sum, [, matches]) => sum + matches.length, 0);
                
                return (
                  <CollapsibleSection
                    key={leagueId}
                    title={leagueName}
                    badge={`${totalMatches} match${totalMatches !== 1 ? "es" : ""}`}
                    defaultOpen={leagueIdx === 0}
                  >
                    <div className="space-y-0">
                      {/* Rounds within this league */}
                      {rounds.map(([round, matches], roundIdx) => (
                        <div key={`${leagueId}-${round}`} className="border-t border-border first:border-t-0">
                          <CollapsibleSection
                            title={`Round ${round}`}
                            badge={`${matches.length} match${matches.length !== 1 ? "es" : ""}`}
                            defaultOpen={roundIdx === 0}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 divide-border">
                              {matches.map((m) => (
                                <div key={m.id} className="p-2 sm:border-r border-border last:border-r-0">
                                  <MatchCard match={m} className="border-0 shadow-none hover:bg-secondary/30" />
                                </div>
                              ))}
                            </div>
                          </CollapsibleSection>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                );
              })
            )}
          </TabsContent>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            RESULTS — collapsible by league → round
            Latest round of first league open by default, older rounds collapsed
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="results" className="mt-4 space-y-2">
            {resultsByLeagueAndRound.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No results yet.</div>
            ) : (
              resultsByLeagueAndRound.map(({ leagueId, leagueName, rounds }, leagueIdx) => {
                const totalMatches = rounds.reduce((sum, [, matches]) => sum + matches.length, 0);
                
                return (
                  <CollapsibleSection
                    key={leagueId}
                    title={leagueName}
                    badge={`${totalMatches} match${totalMatches !== 1 ? "es" : ""}`}
                    defaultOpen={leagueIdx === 0}
                  >
                    <div className="space-y-0">
                      {/* Rounds within this league */}
                      {rounds.map(([round, matches], roundIdx) => (
                        <div key={`${leagueId}-${round}`} className="border-t border-border first:border-t-0">
                          <CollapsibleSection
                            title={`Round ${round}`}
                            badge={`${matches.length} match${matches.length !== 1 ? "es" : ""}`}
                            defaultOpen={roundIdx === 0}
                          >
                            <div className="divide-y divide-border">
                              {matches.map((m) => <MatchRow key={m.id} m={m} />)}
                            </div>
                          </CollapsibleSection>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                );
              })
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
