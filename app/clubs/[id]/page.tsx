"use client";

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotFoundError } from "@/lib/api/client";
import { Calendar, MapPin, Users } from "lucide-react";
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

  const { data: club, isLoading, error } = useClub(id);
  const { data: allMatches, isLoading: matchesLoading, refetch: refetchMatches } = useClubMatches(club?.id);
  const { data: squad, isLoading: squadLoading, refetch: refetchSquad } = useClubPlayers(club?.id);
  const { data: coaches, isLoading: coachesLoading, refetch: refetchCoaches } = useClubCoaches(club?.id);
  const { data: clubStats, isLoading: statsLoading, refetch: refetchStats } = useClubStats(club?.id);
  const { data: clubSeasons, isLoading: seasonsLoading, refetch: refetchSeasons } = useClubSeasons(club?.id);

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

  const fixtures = allMatches?.filter((m) => m.status !== "completed")
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff)) ?? [];
  const results = allMatches?.filter((m) => m.status === "completed")
    .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff)) ?? [];

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
          <TabsList className="w-full grid grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="squad">Squad</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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
          <TabsContent value="squad" className="mt-4">
            {squadLoading && (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
              </div>
            )}
            {!squadLoading && squad && squad.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
                Squad data coming soon.
              </div>
            )}
            {!squadLoading && !squad && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load squad.</p>
                <Button variant="outline" size="sm" onClick={() => refetchSquad()}>Try again</Button>
              </div>
            )}
            {squad && squad.length > 0 && (
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {squad.map((p) => (
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
            )}
          </TabsContent>

          {/* FIXTURES */}
          <TabsContent value="fixtures" className="mt-4">
            {matchesLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            )}
            {!matchesLoading && fixtures.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No upcoming fixtures.</div>
            )}
            {fixtures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fixtures.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
            {!matchesLoading && !allMatches && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load fixtures.</p>
                <Button variant="outline" size="sm" onClick={() => refetchMatches()}>Try again</Button>
              </div>
            )}
          </TabsContent>

          {/* RESULTS */}
          <TabsContent value="results" className="mt-4">
            {matchesLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            )}
            {!matchesLoading && results.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No results yet.</div>
            )}
            {results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
            {!matchesLoading && !allMatches && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load results.</p>
                <Button variant="outline" size="sm" onClick={() => refetchMatches()}>Try again</Button>
              </div>
            )}
          </TabsContent>

          {/* STAFF */}
          <TabsContent value="staff" className="mt-4">
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
            {coaches && coaches.length > 0 && (
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {coaches.map((c) => (
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
          <TabsContent value="history" className="mt-4">
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
            {clubSeasons && clubSeasons.length > 0 && (
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
                    {clubSeasons.map((s) => (
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
