"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMatches } from "@/lib/api/hooks/matches";
import { MatchCard } from "@/components/MatchCard";
import { ClubCrest } from "@/components/ClubCrest";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match } from "@/data/types";

type Filter = "live" | "today" | "upcoming" | "results";

// ── Compact dropdown ──────────────────────────────────────────────────────────
function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "all";
  options: Array<{ value: T; label: string; count?: number }>;
  onChange: (v: T | "all") => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={String(value)}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "all" ? "all" : (v as unknown as T));
        }}
        className={cn(
          "appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold",
          "bg-secondary border border-border text-foreground",
          "hover:bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-primary",
          "cursor-pointer transition-colors"
        )}
        aria-label={label}
      >
        <option value="all">{label}</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}{o.count !== undefined ? ` (${o.count})` : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ── Compact match row (used in live + round views) ────────────────────────────
function MatchRow({ m }: { m: Match }) {
  const isLive = m.status === "live";
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
              <span className="live-dot w-1 h-1" />{m.minute}&apos;
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

  // ── League options for Live filter ────────────────────────────────────────
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const leagueOptions = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const m of live) {
      const id = m.leagueId;
      // Use season id as key; display as "League" since we don't have name here
      if (!map.has(id)) map.set(id, { name: id.slice(0, 8) + "…", count: 0 });
      map.get(id)!.count++;
    }
    return Array.from(map.entries()).map(([id, { name, count }]) => ({
      value: id,
      label: name,
      count,
    }));
  }, [live]);

  const filteredLive = useMemo(
    () => (selectedLeague === "all" ? live : live.filter((m) => m.leagueId === selectedLeague)),
    [live, selectedLeague]
  );

  // ── Round options for Upcoming / Results ──────────────────────────────────
  const [selectedUpcomingRound, setSelectedUpcomingRound] = useState<number | "all">("all");
  const [selectedResultsRound, setSelectedResultsRound] = useState<number | "all">("all");

  const upcomingRounds = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of upcoming) {
      const r = m.matchday ?? 0;
      map.set(r, (map.get(r) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([r, count]) => ({ value: r, label: `Round ${r}`, count }));
  }, [upcoming]);

  const resultsRounds = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of results) {
      const r = m.matchday ?? 0;
      map.set(r, (map.get(r) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b - a) // most recent first
      .map(([r, count]) => ({ value: r, label: `Round ${r}`, count }));
  }, [results]);

  // Auto-select latest round for results — undefined when no results yet
  const defaultResultsRound: number | undefined = resultsRounds[0]?.value;

  const filteredUpcoming = useMemo(
    () =>
      selectedUpcomingRound === "all"
        ? upcoming
        : upcoming.filter((m) => (m.matchday ?? 0) === selectedUpcomingRound),
    [upcoming, selectedUpcomingRound]
  );

  const activeResultsRound: number | undefined =
    selectedResultsRound === "all" ? defaultResultsRound : (selectedResultsRound as number);
  const filteredResults = useMemo(
    () =>
      activeResultsRound === undefined
        ? results
        : results.filter((m) => (m.matchday ?? 0) === activeResultsRound),
    [results, activeResultsRound]
  );

  const liveCount = live.length;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const groupByDate = (list: Match[]) => {
    const groups = new Map<string, Match[]>();
    for (const m of list) {
      const key = new Date(m.kickoff).toDateString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    return Array.from(groups.entries());
  };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Matches</h1>

      <Tabs
        value={filter}
        onValueChange={(v) => {
          setFilter(v as Filter);
          // Reset sub-filters when switching tabs
          setSelectedLeague("all");
          setSelectedUpcomingRound("all");
          setSelectedResultsRound("all");
        }}
      >
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="live" className="gap-1.5">
            <span className={cn(liveCount > 0 && "live-dot w-1.5 h-1.5")} />
            Live
            {liveCount > 0 && (
              <span className="text-[10px] tabular-nums opacity-70">{liveCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
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
            LIVE TAB — filter by league dropdown
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="live" className="mt-4 space-y-3">
            {/* League dropdown — only show if there are multiple leagues */}
            {leagueOptions.length > 1 && (
              <div className="flex items-center gap-2">
                <Dropdown
                  label="All Leagues"
                  value={selectedLeague}
                  options={leagueOptions}
                  onChange={setSelectedLeague}
                />
                {selectedLeague !== "all" && (
                  <button
                    onClick={() => setSelectedLeague("all")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {filteredLive.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
                {liveCount === 0 ? "No live matches right now." : "No matches for this league."}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border overflow-hidden">
                {filteredLive.map((m) => <MatchRow key={m.id} m={m} />)}
              </div>
            )}
          </TabsContent>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TODAY TAB — grouped by date (no extra filter needed)
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="today" className="mt-4">
            {today.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No matches today.</div>
            ) : (
              <div className="space-y-6">
                {groupByDate(today).map(([date, list]) => (
                  <section key={date}>
                    <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: "long", month: "long", day: "numeric",
                      })}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {list.map((m) => <MatchCard key={m.id} match={m} showLeague />)}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            UPCOMING TAB — filter by round dropdown
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {upcomingRounds.length > 0 && (
              <div className="flex items-center gap-2">
                <Dropdown
                  label="All Rounds"
                  value={selectedUpcomingRound}
                  options={upcomingRounds}
                  onChange={setSelectedUpcomingRound}
                />
                <span className="text-xs text-muted-foreground">
                  {filteredUpcoming.length} fixture{filteredUpcoming.length !== 1 ? "s" : ""}
                </span>
                {selectedUpcomingRound !== "all" && (
                  <button
                    onClick={() => setSelectedUpcomingRound("all")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {filteredUpcoming.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No upcoming fixtures.</div>
            ) : selectedUpcomingRound === "all" ? (
              // All rounds: show each round as a card
              <div className="space-y-4">
                {upcomingRounds.map(({ value: round }) => {
                  const roundMatches = filteredUpcoming.filter((m) => (m.matchday ?? 0) === round);
                  if (roundMatches.length === 0) return null;
                  return (
                    <div key={round} className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
                      <div className="px-4 py-2.5 bg-secondary/50 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Round {round}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {roundMatches.length} match{roundMatches.length !== 1 ? "es" : ""}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
                        {roundMatches.map((m) => (
                          <div key={m.id} className="p-2">
                            <MatchCard match={m} className="border-0 shadow-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Single round selected: flat grid
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredUpcoming.map((m) => <MatchCard key={m.id} match={m} showLeague />)}
              </div>
            )}
          </TabsContent>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            RESULTS TAB — filter by round dropdown (defaults to latest)
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="results" className="mt-4 space-y-3">
            {resultsRounds.length > 0 && (
              <div className="flex items-center gap-2">
                <Dropdown
                  label="Select Round"
                  value={activeResultsRound ?? "all"}
                  options={resultsRounds}
                  onChange={setSelectedResultsRound}
                />
                <span className="text-xs text-muted-foreground">
                  {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {filteredResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No results yet.</div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-4 py-2.5 bg-secondary/50 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Round {typeof activeResultsRound === "number" ? activeResultsRound : "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {filteredResults.length} match{filteredResults.length !== 1 ? "es" : ""}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {filteredResults.map((m) => <MatchRow key={m.id} m={m} />)}
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
