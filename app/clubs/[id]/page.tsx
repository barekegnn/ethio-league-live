"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  useClub,
  useClubMatches,
  useClubPlayers,
  useClubCoaches,
  useClubStats,
  useClubSeasons,
} from "@/lib/api/hooks/clubs";
import { ClubCrest } from "@/components/ClubCrest";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { MatchCard } from "@/components/MatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotFoundError } from "@/lib/api/client";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function roleBadgeClass(role: string) {
  if (role === "head_coach") {
    return "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary";
  }
  return "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground";
}

export default function ClubDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  // Pagination and search states
  const [squadPage, setSquadPage] = useState(1);
  const [squadSearch, setSquadSearch] = useState("");
  const [fixturesPage, setFixturesPage] = useState(1);
  const [resultsPage, setResultsPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const { data: club, isLoading, error } = useClub(id);
  const { data: allMatches, isLoading: matchesLoading, refetch: refetchMatches } = useClubMatches(club?.id);
  const { data: squad, isLoading: squadLoading, refetch: refetchSquad } = useClubPlayers(club?.id);
  const { data: coaches, isLoading: coachesLoading, refetch: refetchCoaches } = useClubCoaches(club?.id);
  const { data: clubStats, isLoading: statsLoading, refetch: refetchStats } = useClubStats(club?.id);
  const { data: clubSeasons, isLoading: seasonsLoading, refetch: refetchSeasons } = useClubSeasons(club?.id);

  // ── All useMemo hooks MUST be before any early returns (Rules of Hooks) ──

  const fixtures = useMemo(
    () => (allMatches ?? []).filter((m) => m.status !== "completed")
      .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff)),
    [allMatches]
  );
  const results = useMemo(
    () => (allMatches ?? []).filter((m) => m.status === "completed")
      .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff)),
    [allMatches]
  );

  const filteredSquad = useMemo(() => {
    if (!squad) return [];
    if (!squadSearch.trim()) return squad;
    const query = squadSearch.toLowerCase();
    return squad.filter((p) => {
      const name = p.name.toLowerCase();
      const position = p.position?.toLowerCase() || "";
      return name.includes(query) || position.includes(query);
    });
  }, [squad, squadSearch]);

  const squadPerPage = 20;
  const paginatedSquad = useMemo(() => {
    const start = (squadPage - 1) * squadPerPage;
    return filteredSquad.slice(start, start + squadPerPage);
  }, [filteredSquad, squadPage]);
  const squadTotalPages = Math.ceil(filteredSquad.length / squadPerPage);

  const fixturesPerPage = 10;
  const paginatedFixtures = useMemo(() => {
    const start = (fixturesPage - 1) * fixturesPerPage;
    return fixtures.slice(start, start + fixturesPerPage);
  }, [fixtures, fixturesPage]);
  const fixturesTotalPages = Math.ceil(fixtures.length / fixturesPerPage);

  const resultsPerPage = 10;
  const paginatedResults = useMemo(() => {
    const start = (resultsPage - 1) * resultsPerPage;
    return results.slice(start, start + resultsPerPage);
  }, [results, resultsPage]);
  const resultsTotalPages = Math.ceil(results.length / resultsPerPage);

  const staffPerPage = 10;
  const paginatedStaff = useMemo(() => {
    if (!coaches) return [];
    const start = (staffPage - 1) * staffPerPage;
    return coaches.slice(start, start + staffPerPage);
  }, [coaches, staffPage]);
  const staffTotalPages = Math.ceil((coaches?.length || 0) / staffPerPage);

  const historyPerPage = 10;
  const paginatedHistory = useMemo(() => {
    if (!clubSeasons) return [];
    const start = (historyPage - 1) * historyPerPage;
    return clubSeasons.slice(start, start + historyPerPage);
  }, [clubSeasons, historyPage]);
  const historyTotalPages = Math.ceil((clubSeasons?.length || 0) / historyPerPage);

  const handleSquadSearchChange = (value: string) => {
    setSquadSearch(value);
    setSquadPage(1);
  };

  // ── Early returns AFTER all hooks ──

  if (error instanceof NotFoundError) {
    notFound();
  }

  if (isLoading) {
    return (
      <div>
        <div className="h-40 bg-secondary animate-pulse" />
        <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-12 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Failed to load club.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (!club) return null;

  return (
    <div>
      <section
        className="text-white"
        style={{ background: `linear-gradient(135deg, hsl(${club.primaryColor}) 0%, hsl(${club.primaryColor} / 0.6) 100%)` }}
      >
        <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-10 flex items-center gap-4">
          <ClubCrest clubId={club.id} logoUrl={club.logoUrl} size={80} />
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">{club.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-white/80">
              {club.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {club.city}
                </span>
              )}
              {club.founded > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Founded {club.founded}
                </span>
              )}
              {club.stadium && (
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {club.stadium}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6">
        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3">Overview</TabsTrigger>
            <TabsTrigger value="squad" className="text-xs sm:text-sm px-2 sm:px-3">Squad</TabsTrigger>
            <TabsTrigger value="fixtures" className="text-xs sm:text-sm px-2 sm:px-3">Fixtures</TabsTrigger>
            <TabsTrigger value="results" className="text-xs sm:text-sm px-2 sm:px-3">Results</TabsTrigger>
            <TabsTrigger value="staff" className="text-xs sm:text-sm px-2 sm:px-3">Staff</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm px-2 sm:px-3">Stats</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm px-2 sm:px-3">History</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {club.description && (
              <p className="text-sm text-muted-foreground leading-relaxed bg-card rounded-xl border border-border p-4">
                {club.description}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {club.city && (
                <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">City</div>
                  <div className="font-semibold">{club.city}</div>
                </div>
              )}
              {club.founded > 0 && (
                <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Founded</div>
                  <div className="font-display font-bold text-xl">{club.founded}</div>
                </div>
              )}
              {club.stadium && (
                <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Stadium</div>
                  <div className="font-semibold text-sm">{club.stadium}</div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* SQUAD */}
          <TabsContent value="squad" className="mt-4 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search squad by name or position..."
                value={squadSearch}
                onChange={(e) => handleSquadSearchChange(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {squadLoading && (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
              </div>
            )}
            {!squadLoading && squad && filteredSquad.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
                {squadSearch ? `No players found matching "${squadSearch}"` : "Squad data coming soon."}
              </div>
            )}
            {!squadLoading && !squad && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load squad.</p>
                <Button variant="outline" size="sm" onClick={() => refetchSquad()}>Try again</Button>
              </div>
            )}
            {paginatedSquad.length > 0 && (
              <>
                <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                  {paginatedSquad.map((p) => (
                    <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                      <PlayerAvatar name={p.name} photoUrl={p.photoUrl} size={36} ring={false} />
                      <span className="w-8 text-center font-display font-bold text-muted-foreground text-sm">{p.number || "—"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.position} · {p.nationality}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination controls */}
                {squadTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="text-xs text-muted-foreground">
                      Showing {((squadPage - 1) * squadPerPage) + 1}–{Math.min(squadPage * squadPerPage, filteredSquad.length)} of {filteredSquad.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSquadPage((p) => Math.max(1, p - 1))}
                        disabled={squadPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-xs font-medium px-3 py-1.5">
                        Page {squadPage} of {squadTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSquadPage((p) => Math.min(squadTotalPages, p + 1))}
                        disabled={squadPage === squadTotalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* FIXTURES */}
          <TabsContent value="fixtures" className="mt-4 space-y-4">
            {matchesLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            )}
            {!matchesLoading && fixtures.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No upcoming fixtures.</div>
            )}
            {paginatedFixtures.length > 0 && (
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
            {!matchesLoading && !allMatches && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load fixtures.</p>
                <Button variant="outline" size="sm" onClick={() => refetchMatches()}>Try again</Button>
              </div>
            )}
          </TabsContent>

          {/* RESULTS */}
          <TabsContent value="results" className="mt-4 space-y-4">
            {matchesLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            )}
            {!matchesLoading && results.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No results yet.</div>
            )}
            {paginatedResults.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paginatedResults.map((m) => <MatchCard key={m.id} match={m} />)}
                </div>

                {/* Pagination controls */}
                {resultsTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="text-xs text-muted-foreground">
                      Showing {((resultsPage - 1) * resultsPerPage) + 1}–{Math.min(resultsPage * resultsPerPage, results.length)} of {results.length}
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
            {!matchesLoading && !allMatches && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load results.</p>
                <Button variant="outline" size="sm" onClick={() => refetchMatches()}>Try again</Button>
              </div>
            )}
          </TabsContent>

          {/* STAFF */}
          <TabsContent value="staff" className="mt-4 space-y-4">
            {coachesLoading && (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
              </div>
            )}
            {!coachesLoading && coaches && coaches.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No staff data yet.</div>
            )}
            {!coachesLoading && !coaches && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load staff.</p>
                <Button variant="outline" size="sm" onClick={() => refetchCoaches()}>Try again</Button>
              </div>
            )}
            {paginatedStaff.length > 0 && (
              <>
                <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                  {paginatedStaff.map((c) => (
                    <Link
                      key={c.coachId}
                      href={`/coaches/${c.coachId}`}
                      className="flex items-center gap-3 p-3 hover:bg-secondary/40"
                    >
                      <PlayerAvatar
                        name={`${c.firstName} ${c.lastName}`}
                        photoUrl={c.photoUrl ?? undefined}
                        size={36}
                        ring={false}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {c.firstName} {c.lastName}
                        </div>
                        {c.nationality && (
                          <div className="text-xs text-muted-foreground">{c.nationality}</div>
                        )}
                      </div>
                      <span className={roleBadgeClass(c.role)}>
                        {c.role.replace(/_/g, " ")}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Pagination controls */}
                {staffTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="text-xs text-muted-foreground">
                      Showing {((staffPage - 1) * staffPerPage) + 1}–{Math.min(staffPage * staffPerPage, coaches?.length || 0)} of {coaches?.length || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                        disabled={staffPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-xs font-medium px-3 py-1.5">
                        Page {staffPage} of {staffTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStaffPage((p) => Math.min(staffTotalPages, p + 1))}
                        disabled={staffPage === staffTotalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* STATS */}
          <TabsContent value="stats" className="mt-4 space-y-4">
            {statsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            )}
            {!statsLoading && !clubStats && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load stats.</p>
                <Button variant="outline" size="sm" onClick={() => refetchStats()}>Try again</Button>
              </div>
            )}
            {clubStats && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Total Matches", value: clubStats.totalMatches },
                    { label: "Wins", value: clubStats.totalWins },
                    { label: "Win Rate", value: `${clubStats.winRate.toFixed(1)}%` },
                    { label: "Goals Scored", value: clubStats.totalGoalsScored },
                    { label: "Goals Conceded", value: clubStats.totalGoalsConceded },
                    { label: "Trophies", value: clubStats.trophies },
                  ].map((s) => (
                    <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)] text-center">
                      <div className="font-display font-bold text-2xl tabular-nums">{s.value}</div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {clubStats.bestSeason && (
                  <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Best Season</div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{clubStats.bestSeason.seasonName}</span>
                      <span className="font-display font-bold text-lg tabular-nums">
                        {clubStats.bestSeason.points} pts
                      </span>
                    </div>
                  </div>
                )}

                {clubStats.rating && (
                  <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Club Rating</div>
                    <div className="font-display font-bold text-3xl tabular-nums">
                      {clubStats.rating.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Updated {new Date(clubStats.rating.computedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="mt-4 space-y-4">
            {seasonsLoading && (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
              </div>
            )}
            {!seasonsLoading && !clubSeasons && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load history.</p>
                <Button variant="outline" size="sm" onClick={() => refetchSeasons()}>Try again</Button>
              </div>
            )}
            {clubSeasons && clubSeasons.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No season history yet.</div>
            )}
            {paginatedHistory.length > 0 && (
              <>
                <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead className="bg-secondary/60 text-xs text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="text-left py-2 px-3">Season</th>
                        <th className="text-left py-2 px-3">League</th>
                        <th className="text-center py-2 px-2">Pos</th>
                        <th className="text-center py-2 px-2">P</th>
                        <th className="text-center py-2 px-2">W</th>
                        <th className="text-center py-2 px-2">D</th>
                        <th className="text-center py-2 px-2">L</th>
                        <th className="text-center py-2 px-2">GF</th>
                        <th className="text-center py-2 px-2">GA</th>
                        <th className="text-center py-2 px-3">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHistory.map((s) => (
                        <tr key={s.seasonId} className="border-t border-border hover:bg-secondary/40 transition-colors">
                          <td className="py-2 px-3 font-medium">{s.seasonName}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{s.leagueName}</td>
                          <td className={cn(
                            "text-center tabular-nums font-bold",
                            s.position === 1 && "text-primary",
                          )}>
                            {s.position}
                          </td>
                          <td className="text-center tabular-nums">{s.played}</td>
                          <td className="text-center tabular-nums">{s.won}</td>
                          <td className="text-center tabular-nums">{s.drawn}</td>
                          <td className="text-center tabular-nums">{s.lost}</td>
                          <td className="text-center tabular-nums">{s.goalsFor}</td>
                          <td className="text-center tabular-nums">{s.goalsAgainst}</td>
                          <td className="text-center font-display font-bold tabular-nums">{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {historyTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="text-xs text-muted-foreground">
                      Showing {((historyPage - 1) * historyPerPage) + 1}–{Math.min(historyPage * historyPerPage, clubSeasons?.length || 0)} of {clubSeasons?.length || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        disabled={historyPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-xs font-medium px-3 py-1.5">
                        Page {historyPage} of {historyTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                        disabled={historyPage === historyTotalPages}
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
    </div>
  );
}
