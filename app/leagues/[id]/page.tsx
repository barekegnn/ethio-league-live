"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useLeague, useLeagueSeasons } from "@/lib/api/hooks/leagues";
import {
  useSeasonStandings,
  useSeasonMatches,
  useSeasonTopScorers,
  useSeasonDiscipline,
  useSeasonPlayers,
} from "@/lib/api/hooks/seasons";
import { ClubCrest } from "@/components/ClubCrest";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { MatchCard } from "@/components/MatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotFoundError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const formColor = (r: "W" | "D" | "L") =>
  r === "W" ? "bg-win text-white" : r === "L" ? "bg-loss text-white" : "bg-draw text-white";

export default function LeagueDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: league, isLoading: leagueLoading, error: leagueError } = useLeague(id);
  const { data: seasons } = useLeagueSeasons(league?.id);

  // Use the first active season, or fall back to the most recent season
  const activeSeason = seasons?.find((s) => s.status === "active") ?? seasons?.[0];
  const seasonId = activeSeason?.id;

  const { data: standings, isLoading: standingsLoading, error: standingsError, refetch: refetchStandings } = useSeasonStandings(seasonId);
  const { data: fixtures, isLoading: fixturesLoading, refetch: refetchFixtures } = useSeasonMatches(seasonId, { status: "scheduled" });
  const { data: results, isLoading: resultsLoading, refetch: refetchResults } = useSeasonMatches(seasonId, { status: "completed" });
  const { data: topScorers, isLoading: scorersLoading, refetch: refetchScorers } = useSeasonTopScorers(seasonId);
  const { data: discipline, isLoading: disciplineLoading, refetch: refetchDiscipline } = useSeasonDiscipline(seasonId);
  const { data: seasonPlayers, isLoading: playersLoading, refetch: refetchPlayers } = useSeasonPlayers(seasonId);

  if (leagueError instanceof NotFoundError) {
    notFound();
  }

  if (leagueLoading) {
    return (
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (leagueError) {
    return (
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-12 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Failed to load league.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!league) return null;

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      <header>
        <div className="text-xs uppercase tracking-wider text-primary font-bold">
          {activeSeason?.name ?? league.season}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{league.name}</h1>
      </header>

      <Tabs defaultValue="standings">
        <TabsList className="w-full grid grid-cols-6">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="scorers">Scorers</TabsTrigger>
          <TabsTrigger value="discipline">Discipline</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>

        {/* STANDINGS */}
        <TabsContent value="standings" className="mt-4">
          {standingsLoading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          )}
          {standingsError && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load standings.</p>
              <Button variant="outline" size="sm" onClick={() => refetchStandings()}>Try again</Button>
            </div>
          )}
          {standings && (
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-secondary/60 text-xs text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-2 px-3 w-8">#</th>
                    <th className="text-left py-2 px-3">Club</th>
                    <th className="text-center py-2 px-2">P</th>
                    <th className="text-center py-2 px-2">W</th>
                    <th className="text-center py-2 px-2">D</th>
                    <th className="text-center py-2 px-2">L</th>
                    <th className="text-center py-2 px-2">GF</th>
                    <th className="text-center py-2 px-2">GA</th>
                    <th className="text-center py-2 px-2">GD</th>
                    <th className="text-center py-2 px-3">Pts</th>
                    <th className="text-center py-2 px-3">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                        No standings data yet.
                      </td>
                    </tr>
                  )}
                  {standings.map((row) => {
                    const gd = row.goalsFor - row.goalsAgainst;
                    const isTop = row.position <= 3;
                    const isBottom = standings.length > 4 && row.position > standings.length - 2;
                    return (
                      <tr key={row.clubId} className="border-t border-border hover:bg-secondary/40 transition-colors">
                        <td className="py-2 px-3">
                          <span className={cn(
                            "inline-block w-6 h-6 leading-6 text-center rounded font-display font-bold text-xs",
                            isTop && "bg-primary text-primary-foreground",
                            isBottom && "bg-destructive text-destructive-foreground",
                            !isTop && !isBottom && "text-muted-foreground",
                          )}>
                            {row.position}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <Link href={`/clubs/${row.clubId}`} className="flex items-center gap-2 hover:text-primary">
                            <ClubCrest clubId={row.clubId} size={22} />
                            <span className="font-medium truncate">{row.clubId}</span>
                          </Link>
                        </td>
                        <td className="text-center tabular-nums">{row.played}</td>
                        <td className="text-center tabular-nums">{row.wins}</td>
                        <td className="text-center tabular-nums">{row.draws}</td>
                        <td className="text-center tabular-nums">{row.losses}</td>
                        <td className="text-center tabular-nums">{row.goalsFor}</td>
                        <td className="text-center tabular-nums">{row.goalsAgainst}</td>
                        <td className="text-center tabular-nums">{gd > 0 ? `+${gd}` : gd}</td>
                        <td className="text-center font-display font-bold tabular-nums">{row.points}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1 justify-center">
                            {row.form.map((r, i) => (
                              <span key={i} className={cn("w-5 h-5 rounded text-[10px] font-bold grid place-items-center", formColor(r))}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* FIXTURES */}
        <TabsContent value="fixtures" className="mt-4">
          {fixturesLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          )}
          {fixtures && fixtures.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No upcoming fixtures.</div>
          )}
          {fixtures && fixtures.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fixtures.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          )}
          {!fixturesLoading && !fixtures && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load fixtures.</p>
              <Button variant="outline" size="sm" onClick={() => refetchFixtures()}>Try again</Button>
            </div>
          )}
        </TabsContent>

        {/* RESULTS */}
        <TabsContent value="results" className="mt-4">
          {resultsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          )}
          {results && results.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No results yet.</div>
          )}
          {results && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...results].sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff)).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
          {!resultsLoading && !results && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load results.</p>
              <Button variant="outline" size="sm" onClick={() => refetchResults()}>Try again</Button>
            </div>
          )}
        </TabsContent>

        {/* TOP SCORERS */}
        <TabsContent value="scorers" className="mt-4">
          {scorersLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          )}
          {topScorers && topScorers.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No scorer data yet.</div>
          )}
          {topScorers && topScorers.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
              {topScorers.map((p, i) => (
                <Link key={p.playerId} href={`/players/${p.playerId}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                  <span className="w-6 text-center font-display font-bold text-muted-foreground">{i + 1}</span>
                  <ClubCrest clubId={p.clubId} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.playerName}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.clubName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-lg tabular-nums">{p.goals}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Goals</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!scorersLoading && !topScorers && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load scorers.</p>
              <Button variant="outline" size="sm" onClick={() => refetchScorers()}>Try again</Button>
            </div>
          )}
        </TabsContent>

        {/* DISCIPLINE */}
        <TabsContent value="discipline" className="mt-4 space-y-4">
          {disciplineLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
            </div>
          )}
          {!disciplineLoading && !discipline && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load discipline data.</p>
              <Button variant="outline" size="sm" onClick={() => refetchDiscipline()}>Try again</Button>
            </div>
          )}
          {discipline && (
            <>
              {/* By Player */}
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-x-auto">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">By Player</h3>
                </div>
                {discipline.byPlayer.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">No discipline data yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-xs text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="text-left py-2 px-3">Player</th>
                        <th className="text-left py-2 px-3">Club</th>
                        <th className="text-center py-2 px-3">🟨</th>
                        <th className="text-center py-2 px-3">🟥</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discipline.byPlayer.map((row) => (
                        <tr key={row.playerId} className="border-t border-border hover:bg-secondary/40 transition-colors">
                          <td className="py-2 px-3 font-medium">{row.playerName}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{row.clubName}</td>
                          <td className="text-center tabular-nums font-bold">{row.yellowCards}</td>
                          <td className="text-center tabular-nums font-bold">{row.redCards}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* By Club */}
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-x-auto">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">By Club</h3>
                </div>
                {discipline.byClub.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">No discipline data yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-xs text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="text-left py-2 px-3">Club</th>
                        <th className="text-center py-2 px-3">🟨</th>
                        <th className="text-center py-2 px-3">🟥</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discipline.byClub.map((row) => (
                        <tr key={row.clubId} className="border-t border-border hover:bg-secondary/40 transition-colors">
                          <td className="py-2 px-3">
                            <Link href={`/clubs/${row.clubId}`} className="flex items-center gap-2 hover:text-primary">
                              <ClubCrest clubId={row.clubId} size={22} />
                              <span className="font-medium">{row.clubName}</span>
                            </Link>
                          </td>
                          <td className="text-center tabular-nums font-bold">{row.yellowCards}</td>
                          <td className="text-center tabular-nums font-bold">{row.redCards}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* PLAYERS */}
        <TabsContent value="players" className="mt-4">
          {playersLoading && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
            </div>
          )}
          {!playersLoading && !seasonPlayers && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load players.</p>
              <Button variant="outline" size="sm" onClick={() => refetchPlayers()}>Try again</Button>
            </div>
          )}
          {seasonPlayers && seasonPlayers.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No players yet.</div>
          )}
          {seasonPlayers && seasonPlayers.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
              {seasonPlayers.map((p) => (
                <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                  <ClubCrest clubId={p.clubId} size={28} />
                  <PlayerAvatar name={p.name} photoUrl={p.photoUrl} size={36} ring={false} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.position}</div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {p.number ? `#${p.number}` : ""}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
