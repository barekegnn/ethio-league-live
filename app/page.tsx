"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { LiveTicker } from "@/components/LiveTicker";
import { ClubCrest } from "@/components/ClubCrest";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatches } from "@/lib/api/hooks/matches";
import { useLeagues, useLeagueSeasons } from "@/lib/api/hooks/leagues";
import { useSeasonStandings, useSeasonTopScorers } from "@/lib/api/hooks/seasons";
import { NEWS_FALLBACK } from "@/lib/staticNews";
import type { Match, League } from "@/data/types";

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

// ── Compact match row ─────────────────────────────────────────────────────────
function MatchRow({ m }: { m: Match }) {
  const isLive = m.status === "live";
  const isDone = m.status === "completed";
  const liveMinute = useLiveMinute(isLive ? m.liveStartedAt : null);
  return (
    <Link
      href={`/match/${m.id}`}
      className="flex items-center gap-2 px-3 py-2.5 hover:bg-secondary/50 transition-colors"
    >
      {/* Home */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
        <span className="text-xs font-semibold truncate text-right leading-tight">
          {m.homeClubName ?? m.homeId}
        </span>
        <ClubCrest clubId={m.homeId} logoUrl={m.homeClubLogo} size={20} />
      </div>

      {/* Score / time */}
      <div className="shrink-0 min-w-[56px] text-center">
        {isLive ? (
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm tabular-nums text-live">
              {m.homeScore}–{m.awayScore}
            </span>
            <span className="text-[9px] font-bold text-live flex items-center gap-0.5">
              <span className="live-dot w-1 h-1" />{liveMinute}&apos;
            </span>
          </div>
        ) : isDone ? (
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm tabular-nums">
              {m.homeScore}–{m.awayScore}
            </span>
            <span className="text-[9px] uppercase font-semibold text-muted-foreground">FT</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-xs tabular-nums text-muted-foreground">
              {new Date(m.kickoff).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-[9px] text-muted-foreground">
              {new Date(m.kickoff).toLocaleDateString([], { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {/* Away */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <ClubCrest clubId={m.awayId} logoUrl={m.awayClubLogo} size={20} />
        <span className="text-xs font-semibold truncate leading-tight">
          {m.awayClubName ?? m.awayId}
        </span>
      </div>
    </Link>
  );
}

// ── Matches widget ────────────────────────────────────────────────────────────
// Compact, space-efficient filter + preview. Max 6 items shown, "See all" link.
function MatchesWidget({ allMatches, isLoading, error, refetch }: {
  allMatches: Match[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}) {
  type Filter = "live" | "upcoming" | "results";
  const live     = useMemo(() => allMatches?.filter((m) => m.status === "live")      ?? [], [allMatches]);
  const upcoming = useMemo(() => allMatches?.filter((m) => m.status === "scheduled") ?? [], [allMatches]);
  const recent   = useMemo(() => allMatches?.filter((m) => m.status === "completed") ?? [], [allMatches]);

  // Auto-select: live if any, else upcoming, else results
  const defaultFilter: Filter = live.length > 0 ? "live" : upcoming.length > 0 ? "upcoming" : "results";
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const PREVIEW = 6;

  // For results: show only the latest round
  const latestRoundMatches = useMemo(() => {
    if (recent.length === 0) return [];
    const maxRound = Math.max(...recent.map((m) => m.matchday ?? 0));
    return recent.filter((m) => (m.matchday ?? 0) === maxRound);
  }, [recent]);

  const source = filter === "live" ? live : filter === "upcoming"
    ? [...upcoming].sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
    : latestRoundMatches;

  // Always show only PREVIEW items - no expand/collapse
  const displayed = source.slice(0, PREVIEW);

  const latestRound = useMemo(() => {
    if (recent.length === 0) return null;
    return Math.max(...recent.map((m) => m.matchday ?? 0));
  }, [recent]);

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display font-bold text-lg tracking-tight">Matches</h2>
        <Link
          href="/matches"
          className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Filter pills ── */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-0.5">
        {(["live", "upcoming", "results"] as Filter[]).map((f) => {
          const count = f === "live" ? live.length : f === "upcoming" ? upcoming.length : recent.length;
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {f === "live" && live.length > 0 && (
                <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-white animate-pulse" : "bg-live")} />
              )}
              <span className="capitalize">{f === "results" ? "Results" : f === "upcoming" ? "Upcoming" : "Live"}</span>
              {count > 0 && (
                <span className={cn(
                  "text-[10px] tabular-nums",
                  isActive ? "opacity-80" : "opacity-60"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Round badge for results */}
        {filter === "results" && latestRound !== null && (
          <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1 rounded-full bg-secondary/60">
            Round {latestRound}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-6 w-14 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
              </div>
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="p-5 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Failed to load matches.</p>
            <Button variant="outline" size="sm" onClick={refetch}>Try again</Button>
          </div>
        )}

        {!isLoading && !error && displayed.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {filter === "live" ? "No live matches right now." :
             filter === "upcoming" ? "No upcoming fixtures." :
             "No results yet."}
          </div>
        )}

        {!isLoading && !error && displayed.length > 0 && (
          <div className="divide-y divide-border">
            {displayed.map((m) => <MatchRow key={m.id} m={m} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Standings + Top Scorers sidebar ──────────────────────────────────────────
function StandingsSidebar({ leagues }: { leagues: League[] }) {
  const topLeague = leagues.find((l) => l.tier === 1) ?? leagues[0];
  const { data: seasons } = useLeagueSeasons(topLeague?.id);
  const activeSeason = seasons?.find((s) => s.status === "active") ?? seasons?.[0];
  const seasonId = activeSeason?.id;
  const { data: standings, isLoading: standingsLoading } = useSeasonStandings(seasonId);
  const { data: topScorers, isLoading: scorersLoading } = useSeasonTopScorers(seasonId, { limit: 5 });
  const topRows = standings?.slice(0, 5) ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2">
        <SectionHeader
          title={topLeague ? `${topLeague.name} Table` : "League Table"}
          action={
            topLeague ? (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/leagues/${topLeague.id}`}>Full table <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            ) : undefined
          }
        />
        <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
          {standingsLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : topRows.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No standings available yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left py-2 px-3 w-8">#</th>
                  <th className="text-left py-2 px-3">Club</th>
                  <th className="text-center py-2 px-2 w-10">P</th>
                  <th className="text-center py-2 px-2 w-10 hidden sm:table-cell">W</th>
                  <th className="text-center py-2 px-2 w-10 hidden sm:table-cell">D</th>
                  <th className="text-center py-2 px-2 w-10 hidden sm:table-cell">L</th>
                  <th className="text-center py-2 px-2 w-12">GD</th>
                  <th className="text-center py-2 px-3 w-10">Pts</th>
                </tr>
              </thead>
              <tbody>
                {topRows.map((row) => {
                  const gd = row.goalsFor - row.goalsAgainst;
                  return (
                    <tr key={row.clubId} className="border-t border-border hover:bg-secondary/40 transition-colors">
                      <td className="py-2 px-3 font-display font-bold text-muted-foreground">{row.position}</td>
                      <td className="py-2 px-3">
                        <Link href={`/clubs/${row.clubId}`} className="flex items-center gap-2 hover:text-primary">
                          <ClubCrest clubId={row.clubId} logoUrl={row.clubLogo} size={22} />
                          <span className="font-medium truncate">{row.clubName ?? row.clubId}</span>
                        </Link>
                      </td>
                      <td className="text-center tabular-nums">{row.played}</td>
                      <td className="text-center tabular-nums hidden sm:table-cell">{row.wins}</td>
                      <td className="text-center tabular-nums hidden sm:table-cell">{row.draws}</td>
                      <td className="text-center tabular-nums hidden sm:table-cell">{row.losses}</td>
                      <td className="text-center tabular-nums">{gd > 0 ? `+${gd}` : gd}</td>
                      <td className="text-center font-display font-bold tabular-nums">{row.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="Top Scorers" action={<Trophy className="w-4 h-4 text-accent" />} />
        <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
          {scorersLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !topScorers || topScorers.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No scorer data yet.</div>
          ) : (
            topScorers.map((p, i) => (
              <Link key={p.playerId} href={`/players/${p.playerId}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors">
                <span className="w-5 text-center font-display font-bold text-muted-foreground">{i + 1}</span>
                <ClubCrest clubId={p.clubId} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.playerName}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.clubName}</div>
                </div>
                <span className="font-display font-bold text-lg tabular-nums">{p.goals}</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// ── Main home page ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: allMatches, isLoading: matchesLoading, error: matchesError, refetch: refetchMatches } = useMatches();
  const { data: leagues, isLoading: leaguesLoading } = useLeagues();

  const live = useMemo(() => allMatches?.filter((m) => m.status === "live") ?? [], [allMatches]);
  const featured = live[0];

  return (
    <>
      <LiveTicker />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-8">
        <h1 className="sr-only">Ethio-League Live — Ethiopian Football</h1>

        {/* ── Featured live match hero ── */}
        {matchesLoading && <Skeleton className="h-48 rounded-2xl" />}
        {featured && !matchesLoading && (
          <section aria-label="Featured match" className="rounded-2xl overflow-hidden hero-bg text-white shadow-[var(--shadow-elevated)]">
            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-accent mb-4">
                <span className="live-dot w-1.5 h-1.5" /> Live now · Round {featured.matchday}
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right">
                  <ClubCrest clubId={featured.homeId} logoUrl={featured.homeClubLogo} size={56} />
                  <div className="font-display font-bold text-lg sm:text-2xl">{featured.homeClubName ?? featured.homeId}</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-4xl sm:text-6xl tabular-nums leading-none">
                    {featured.homeScore}<span className="mx-2 sm:mx-3 text-white/60">-</span>{featured.awayScore}
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-accent font-bold">{featured.minute}&apos;</div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                  <ClubCrest clubId={featured.awayId} logoUrl={featured.awayClubLogo} size={56} />
                  <div className="font-display font-bold text-lg sm:text-2xl">{featured.awayClubName ?? featured.awayId}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button asChild variant="secondary">
                  <Link href={`/match/${featured.id}`}>Open Match Center <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── Compact matches widget ── */}
        <MatchesWidget
          allMatches={allMatches}
          isLoading={matchesLoading}
          error={matchesError}
          refetch={refetchMatches}
        />

        {/* ── Standings + Top Scorers ── */}
        {leaguesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><Skeleton className="h-48 rounded-xl" /></div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : leagues && leagues.length > 0 ? (
          <StandingsSidebar leagues={leagues} />
        ) : null}

        {/* ── News ── */}
        <section>
          <SectionHeader
            title="Latest news"
            action={<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-0.5 rounded bg-secondary">Sample news</span>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NEWS_FALLBACK.map((n) => (
              <article key={n.id} className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-4 hover:shadow-[var(--shadow-elevated)] transition-shadow">
                <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">{n.category}</div>
                <h3 className="font-display font-bold text-base sm:text-lg leading-snug mb-1">{n.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
                <time className="block mt-2 text-xs text-muted-foreground">
                  {new Date(n.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
