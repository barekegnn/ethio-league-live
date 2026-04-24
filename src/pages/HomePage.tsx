import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LiveTicker } from "@/components/LiveTicker";
import { ClubCrest } from "@/components/ClubCrest";
import { SectionHeader } from "@/components/SectionHeader";
import { LeagueMatchGroup } from "@/components/LeagueMatchGroup";
import {
  matches,
  standings,
  clubById,
  leagueById,
  leagues,
  topScorers,
  news,
} from "@/data/mock";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Match } from "@/data/types";

const HomePage = () => {
  useEffect(() => {
    document.title = "Ethio-League Live · Ethiopian Football Hub";
    const desc =
      "Live scores, fixtures, standings and player stats from the Ethiopian Premier League and beyond.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches.filter((m) => m.status === "scheduled");
  const recent = matches.filter((m) => m.status === "completed");
  const eplStandings = standings.epl.slice(0, 5);
  const scorers = topScorers().slice(0, 5);
  const featured = live[0];

  const [tab, setTab] = useState<"all" | "live" | "finished" | "upcoming">("all");

  const groupedByLeague = useMemo(() => {
    const source: Match[] =
      tab === "live"
        ? live
        : tab === "finished"
          ? recent
          : tab === "upcoming"
            ? upcoming
            : [...live, ...upcoming, ...recent];

    const map = new Map<string, Match[]>();
    for (const m of source) {
      if (!map.has(m.leagueId)) map.set(m.leagueId, []);
      map.get(m.leagueId)!.push(m);
    }
    // Sort matches inside each group: live first, then upcoming by kickoff, then recent by kickoff desc
    for (const [, list] of map) {
      list.sort((a, b) => {
        const order = { live: 0, scheduled: 1, completed: 2, postponed: 3 } as const;
        const ao = order[a.status];
        const bo = order[b.status];
        if (ao !== bo) return ao - bo;
        if (a.status === "completed") {
          return new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime();
        }
        return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
      });
    }
    // Order leagues by tier then name, but those with live matches first
    return Array.from(map.entries())
      .map(([id, list]) => ({ league: leagueById(id)!, list }))
      .filter((g) => g.league)
      .sort((a, b) => {
        const aLive = a.list.some((m) => m.status === "live") ? 0 : 1;
        const bLive = b.list.some((m) => m.status === "live") ? 0 : 1;
        if (aLive !== bLive) return aLive - bLive;
        if (a.league.tier !== b.league.tier) return a.league.tier - b.league.tier;
        return a.league.name.localeCompare(b.league.name);
      });
  }, [tab, live, upcoming, recent]);

  return (
    <>
      <LiveTicker />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-8">
        <h1 className="sr-only">Ethio-League Live — Ethiopian Football</h1>

        {/* Hero / featured live match */}
        {featured && (
          <section
            aria-label="Featured match"
            className="rounded-2xl overflow-hidden hero-bg text-white shadow-[var(--shadow-elevated)]"
          >
            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-accent mb-4">
                <span className="live-dot w-1.5 h-1.5" /> Live now · Matchday {featured.matchday}
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right">
                  <ClubCrest clubId={featured.homeId} size={56} />
                  <div className="font-display font-bold text-lg sm:text-2xl">
                    {clubById(featured.homeId)?.shortName}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-4xl sm:text-6xl tabular-nums leading-none">
                    {featured.homeScore}
                    <span className="mx-2 sm:mx-3 text-white/60">-</span>
                    {featured.awayScore}
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-accent font-bold">
                    {featured.minute}'
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                  <ClubCrest clubId={featured.awayId} size={56} />
                  <div className="font-display font-bold text-lg sm:text-2xl">
                    {clubById(featured.awayId)?.shortName}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button asChild variant="secondary">
                  <Link to={`/match/${featured.id}`}>
                    Open Match Center <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Matches grouped by league (SofaScore-style) */}
        <section>
          <SectionHeader
            title="Matches"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/matches">View all <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            }
          />
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="mb-3">
              <TabsTrigger value="all">
                All <span className="ml-1.5 text-[10px] tabular-nums opacity-70">{live.length + upcoming.length + recent.length}</span>
              </TabsTrigger>
              <TabsTrigger value="live" className="gap-1.5">
                {live.length > 0 && <span className="live-dot w-1.5 h-1.5" />}
                Live <span className="text-[10px] tabular-nums opacity-70">{live.length}</span>
              </TabsTrigger>
              <TabsTrigger value="finished">
                Finished <span className="ml-1.5 text-[10px] tabular-nums opacity-70">{recent.length}</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming <span className="ml-1.5 text-[10px] tabular-nums opacity-70">{upcoming.length}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-0">
              {groupedByLeague.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
                  No matches in this category.
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedByLeague.map(({ league, list }) => (
                    <LeagueMatchGroup
                      key={league.id}
                      league={league}
                      matches={list}
                      defaultOpen={list.some((m) => m.status === "live") || tab !== "all"}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standings preview */}
          <section className="lg:col-span-2">
            <SectionHeader
              title="Premier League Table"
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link to="/leagues/epl">Full table <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              }
            />
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
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
                  {eplStandings.map((row) => {
                    const c = clubById(row.clubId);
                    const gd = row.goalsFor - row.goalsAgainst;
                    return (
                      <tr
                        key={row.clubId}
                        className="border-t border-border hover:bg-secondary/40 transition-colors"
                      >
                        <td className="py-2 px-3 font-display font-bold text-muted-foreground">
                          {row.position}
                        </td>
                        <td className="py-2 px-3">
                          <Link
                            to={`/clubs/${row.clubId}`}
                            className="flex items-center gap-2 hover:text-primary"
                          >
                            <ClubCrest clubId={row.clubId} size={22} />
                            <span className="font-medium truncate">{c?.shortName}</span>
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
            </div>
          </section>

          {/* Top scorers */}
          <section>
            <SectionHeader
              title="Top Scorers"
              action={<Trophy className="w-4 h-4 text-accent" />}
            />
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
              {scorers.map((p, i) => {
                const c = clubById(p.clubId);
                return (
                  <Link
                    key={p.id}
                    to={`/players/${p.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors"
                  >
                    <span className="w-5 text-center font-display font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <ClubCrest clubId={p.clubId} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c?.shortName} · {p.position}
                      </div>
                    </div>
                    <span className="font-display font-bold text-lg tabular-nums">
                      {p.goals}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* News */}
        <section>
          <SectionHeader title="Latest news" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {news.map((n) => (
              <article
                key={n.id}
                className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-4 hover:shadow-[var(--shadow-elevated)] transition-shadow"
              >
                <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
                  {n.category}
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg leading-snug mb-1">
                  {n.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
                <time className="block mt-2 text-xs text-muted-foreground">
                  {new Date(n.publishedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
