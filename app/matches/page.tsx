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

// ── Compact match row (live + results) ────────────────────────────────────────
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

  // ── Group live by league (leagueId = seasonId from API) ───────────────────
  const liveByLeague = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of live) {
      if (!map.has(m.leagueId)) map.set(m.leagueId, []);
      map.get(m.leagueId)!.push(m);
    }
    return Array.from(map.entries());
  }, [live]);

  // ── Group upcoming by round ───────────────────────────────────────────────
  const upcomingByRound = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const m of upcoming) {
      const r = m.matchday ?? 0;
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [upcoming]);

  // ── Group results by round ────────────────────────────────────────────────
  const resultsByRound = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const m of results) {
      const r = m.matchday ?? 0;
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b - a); // most recent first
  }, [results]);

  const liveCount = live.length;

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Matches</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
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
            LIVE — collapsible by league
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="live" className="mt-4 space-y-2">
            {liveCount === 0 ? (
              <div className="bg-card rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
                No live matches right now.
              </div>
            ) : liveByLeague.length === 1 ? (
              // Only one league — show matches directly without collapsible
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border overflow-hidden">
                {liveByLeague[0][1].map((m) => <MatchRow key={m.id} m={m} />)}
              </div>
            ) : (
              // Multiple leagues — each in its own collapsible
              liveByLeague.map(([leagueId, matches], i) => (
                <CollapsibleSection
                  key={leagueId}
                  title={`League ${i + 1}`}
                  badge={`${matches.length} live`}
                  defaultOpen={i === 0}
                >
                  <div className="divide-y divide-border">
                    {matches.map((m) => <MatchRow key={m.id} m={m} />)}
                  </div>
                </CollapsibleSection>
              ))
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
            UPCOMING — collapsible by round
            First round open by default, rest collapsed
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="upcoming" className="mt-4 space-y-2">
            {upcomingByRound.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No upcoming fixtures.</div>
            ) : (
              upcomingByRound.map(([round, matches], i) => (
                <CollapsibleSection
                  key={round}
                  title={`Round ${round}`}
                  badge={`${matches.length} match${matches.length !== 1 ? "es" : ""}`}
                  defaultOpen={i === 0}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 divide-border">
                    {matches.map((m) => (
                      <div key={m.id} className="p-2 sm:border-r border-border last:border-r-0">
                        <MatchCard match={m} className="border-0 shadow-none hover:bg-secondary/30" />
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              ))
            )}
          </TabsContent>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            RESULTS — collapsible by round
            Latest round open by default, older rounds collapsed
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && (
          <TabsContent value="results" className="mt-4 space-y-2">
            {resultsByRound.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No results yet.</div>
            ) : (
              resultsByRound.map(([round, matches], i) => (
                <CollapsibleSection
                  key={round}
                  title={`Round ${round}`}
                  badge={`${matches.length} match${matches.length !== 1 ? "es" : ""}`}
                  defaultOpen={i === 0}
                >
                  <div className="divide-y divide-border">
                    {matches.map((m) => <MatchRow key={m.id} m={m} />)}
                  </div>
                </CollapsibleSection>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
