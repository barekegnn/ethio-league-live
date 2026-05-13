"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotFoundError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const formColor = (r: "W" | "D" | "L") =>
  r === "W" ? "bg-win text-white" : r === "L" ? "bg-loss text-white" : "bg-draw text-white";

export default function LeagueDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  // Pagination and search states
  const [scorersPage, setScorersPage] = useState(1);
  const [disciplinePlayerPage, setDisciplinePlayerPage] = useState(1);
  const [disciplineClubPage, setDisciplineClubPage] = useState(1);
  const [playersPage, setPlayersPage] = useState(1);
  const [playersSearch, setPlayersSearch] = useState("");
  const [fixturesPage, setFixturesPage] = useState(1);
  const [resultsPage, setResultsPage] = useState(1);

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

  // Pagination logic for Top Scorers (20 items/page)
  const scorersPerPage = 20;
  const paginatedScorers = useMemo(() => {
    if (!topScorers) return [];
    const start = (scorersPage - 1) * scorersPerPage;
    return topScorers.slice(start, start + scorersPerPage);
  }, [topScorers, scorersPage]);
  const scorersTotalPages = Math.ceil((topScorers?.length || 0) / scorersPerPage);

  // Pagination logic for Discipline By Player (20 items/page)
  const disciplinePlayerPerPage = 20;
  const paginatedDisciplinePlayers = useMemo(() => {
    if (!discipline?.byPlayer) return [];
    const start = (disciplinePlayerPage - 1) * disciplinePlayerPerPage;
    return discipline.byPlayer.slice(start, start + disciplinePlayerPerPage);
  }, [discipline, disciplinePlayerPage]);
  const disciplinePlayerTotalPages = Math.ceil((discipline?.byPlayer?.length || 0) / disciplinePlayerPerPage);

  // Pagination logic for Discipline By Club (20 items/page)
  const disciplineClubPerPage = 20;
  const paginatedDisciplineClubs = useMemo(() => {
    if (!discipline?.byClub) return [];
    const start = (disciplineClubPage - 1) * disciplineClubPerPage;
    return discipline.byClub.slice(start, start + disciplineClubPerPage);
  }, [discipline, disciplineClubPage]);
  const disciplineClubTotalPages = Math.ceil((discipline?.byClub?.length || 0) / disciplineClubPerPage);

  // Filter and pagination logic for Players (20 items/page + search)
  const filteredPlayers = useMemo(() => {
    if (!seasonPlayers) return [];
    if (!playersSearch.trim()) return seasonPlayers;
    
    const query = playersSearch.toLowerCase();
    return seasonPlayers.filter((p) => {
      const name = p.name.toLowerCase();
      const position = p.position?.toLowerCase() || "";
      return name.includes(query) || position.includes(query);
    });
  }, [seasonPlayers, playersSearch]);

  const playersPerPage = 20;
  const paginatedPlayers = useMemo(() => {
    const start = (playersPage - 1) * playersPerPage;
    return filteredPlayers.slice(start, start + playersPerPage);
  }, [filteredPlayers, playersPage]);
  const playersTotalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  const handlePlayersSearchChange = (value: string) => {
    setPlayersSearch(value);
    setPlayersPage(1);
  };

  // Pagination logic for Fixtures (10 items/page)
  const fixturesPerPage = 10;
  const paginatedFixtures = useMemo(() => {
    if (!fixtures) return [];
    const start = (fixturesPage - 1) * fixturesPerPage;
    return fixtures.slice(start, start + fixturesPerPage);
  }, [fixtures, fixturesPage]);
  const fixturesTotalPages = Math.ceil((fixtures?.length || 0) / fixturesPerPage);

  // Pagination logic for Results (10 items/page)
  const resultsPerPage = 10;
  const sortedResults = useMemo(() => {
    if (!results) return [];
    return [...results].sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff));
  }, [results]);
  const paginatedResults = useMemo(() => {
    const start = (resultsPage - 1) * resultsPerPage;
    return sortedResults.slice(start, start + resultsPerPage);
  }, [sortedResults, resultsPage]);
  const resultsTotalPages = Math.ceil(sortedResults.length / resultsPerPage);

  // Early returns AFTER all hooks
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
        <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-1">
          <TabsTrigger value="standings" className="text-xs sm:text-sm px-2 sm:px-3">Standings</TabsTrigger>
          <TabsTrigger value="fixtures" className="text-xs sm:text-sm px-2 sm:px-3">Fixtures</TabsTrigger>
          <TabsTrigger value="results" className="text-xs sm:text-sm px-2 sm:px-3">Results</TabsTrigger>
          <TabsTrigger value="scorers" className="text-xs sm:text-sm px-2 sm:px-3">Scorers</TabsTrigger>
          <TabsTrigger value="discipline" className="text-xs sm:text-sm px-2 sm:px-3">Discipline</TabsTrigger>
          <TabsTrigger value="players" className="text-xs sm:text-sm px-2 sm:px-3">Players</TabsTrigger>
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
                            <ClubCrest clubId={row.clubId} logoUrl={row.clubLogo} size={22} />
                            <span className="font-medium truncate">{row.clubName ?? row.clubId}</span>
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
        <TabsContent value="fixtures" className="mt-4 space-y-4">
          {fixturesLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          )}
          {fixtures && fixtures.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No upcoming fixtures.</div>
          )}
          {fixtures && fixtures.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paginatedFixtures.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
              {/* Pagination controls */}
              {fixturesTotalPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {((fixturesPage - 1) * fixturesPerPage) + 1}–{Math.min(fixturesPage * fixturesPerPage, fixtures.length)} of {fixtures.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFixturesPage((p) => Math.max(1, p - 1))}
                      disabled={fixturesPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-xs font-medium px-3 py-1.5">
                      Page {fixturesPage} of {fixturesTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFixturesPage((p) => Math.min(fixturesTotalPages, p + 1))}
                      disabled={fixturesPage === fixturesTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          {!fixturesLoading && !fixtures && (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Failed to load fixtures.</p>
              <Button variant="outline" size="sm" onClick={() => refetchFixtures()}>Try again</Button>
            </div>
          )}
        </TabsContent>

        {/* RESULTS */}
        <TabsContent value="results" className="mt-4 space-y-4">
          {resultsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          )}
          {results && results.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No results yet.</div>
          )}
          {results && results.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paginatedResults.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
              {/* Pagination controls */}
              {resultsTotalPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {((resultsPage - 1) * resultsPerPage) + 1}–{Math.min(resultsPage * resultsPerPage, sortedResults.length)} of {sortedResults.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResultsPage((p) => Math.max(1, p - 1))}
                      disabled={resultsPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-xs font-medium px-3 py-1.5">
                      Page {resultsPage} of {resultsTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResultsPage((p) => Math.min(resultsTotalPages, p + 1))}
                      disabled={resultsPage === resultsTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
            <>
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {paginatedScorers.map((p, i) => {
                  const globalIndex = (scorersPage - 1) * scorersPerPage + i;
                  return (
                    <Link key={p.playerId} href={`/players/${p.playerId}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                      <span className="w-6 text-center font-display font-bold text-muted-foreground">{globalIndex + 1}</span>
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
                  );
                })}
              </div>

              {/* Pagination controls */}
              {scorersTotalPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {((scorersPage - 1) * scorersPerPage) + 1}–{Math.min(scorersPage * scorersPerPage, topScorers.length)} of {topScorers.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScorersPage((p) => Math.max(1, p - 1))}
                      disabled={scorersPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-xs font-medium px-3 py-1.5">
                      Page {scorersPage} of {scorersTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScorersPage((p) => Math.min(scorersTotalPages, p + 1))}
                      disabled={scorersPage === scorersTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
                  <>
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
                        {paginatedDisciplinePlayers.map((row) => (
                          <tr key={row.playerId} className="border-t border-border hover:bg-secondary/40 transition-colors">
                            <td className="py-2 px-3 font-medium">{row.playerName}</td>
                            <td className="py-2 px-3 text-muted-foreground text-xs">{row.clubName}</td>
                            <td className="text-center tabular-nums font-bold">{row.yellowCards}</td>
                            <td className="text-center tabular-nums font-bold">{row.redCards}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination controls */}
                    {disciplinePlayerTotalPages > 1 && (
                      <div className="flex items-center justify-between gap-2 p-3 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Showing {((disciplinePlayerPage - 1) * disciplinePlayerPerPage) + 1}–{Math.min(disciplinePlayerPage * disciplinePlayerPerPage, discipline.byPlayer.length)} of {discipline.byPlayer.length}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDisciplinePlayerPage((p) => Math.max(1, p - 1))}
                            disabled={disciplinePlayerPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="text-xs font-medium px-3 py-1.5">
                            Page {disciplinePlayerPage} of {disciplinePlayerTotalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDisciplinePlayerPage((p) => Math.min(disciplinePlayerTotalPages, p + 1))}
                            disabled={disciplinePlayerPage === disciplinePlayerTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
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
                  <>
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/60 text-xs text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="text-left py-2 px-3">Club</th>
                          <th className="text-center py-2 px-3">🟨</th>
                          <th className="text-center py-2 px-3">🟥</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDisciplineClubs.map((row) => (
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

                    {/* Pagination controls */}
                    {disciplineClubTotalPages > 1 && (
                      <div className="flex items-center justify-between gap-2 p-3 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Showing {((disciplineClubPage - 1) * disciplineClubPerPage) + 1}–{Math.min(disciplineClubPage * disciplineClubPerPage, discipline.byClub.length)} of {discipline.byClub.length}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDisciplineClubPage((p) => Math.max(1, p - 1))}
                            disabled={disciplineClubPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="text-xs font-medium px-3 py-1.5">
                            Page {disciplineClubPage} of {disciplineClubTotalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDisciplineClubPage((p) => Math.min(disciplineClubTotalPages, p + 1))}
                            disabled={disciplineClubPage === disciplineClubTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* PLAYERS */}
        <TabsContent value="players" className="mt-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search players by name or position..."
              value={playersSearch}
              onChange={(e) => handlePlayersSearchChange(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

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
          {seasonPlayers && filteredPlayers.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              {playersSearch ? `No players found matching "${playersSearch}"` : "No players yet."}
            </div>
          )}
          {paginatedPlayers.length > 0 && (
            <>
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {paginatedPlayers.map((p) => (
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

              {/* Pagination controls */}
              {playersTotalPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {((playersPage - 1) * playersPerPage) + 1}–{Math.min(playersPage * playersPerPage, filteredPlayers.length)} of {filteredPlayers.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlayersPage((p) => Math.max(1, p - 1))}
                      disabled={playersPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-xs font-medium px-3 py-1.5">
                      Page {playersPage} of {playersTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlayersPage((p) => Math.min(playersTotalPages, p + 1))}
                      disabled={playersPage === playersTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
