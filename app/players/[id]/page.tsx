"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  usePlayer,
  usePlayerStats,
  usePlayerSeasons,
  usePlayerMatches,
} from "@/lib/api/hooks/players";
import { ClubCrest } from "@/components/ClubCrest";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotFoundError } from "@/lib/api/client";

export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  // Pagination states
  const [careerPage, setCareerPage] = useState(1);
  const [matchesPage, setMatchesPage] = useState(1);

  const { data: player, isLoading, error } = usePlayer(id);
  const { data: stats } = usePlayerStats(player?.id);
  const { data: seasons } = usePlayerSeasons(player?.id);
  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = usePlayerMatches(player?.id);

  if (error instanceof NotFoundError) {
    notFound();
  }

  if (isLoading) {
    return (
      <div>
        <div className="h-40 bg-secondary animate-pulse" />
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-12 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Failed to load player.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (!player) return null;

  const age = player.dateOfBirth
    ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()
    : null;

  const statCards = [
    { label: "Apps", value: stats?.totalAppearances ?? player.apps },
    { label: "Goals", value: stats?.totalGoals ?? player.goals },
    { label: "Assists", value: stats?.totalAssists ?? player.assists },
    { label: "Yellow", value: stats?.totalYellowCards ?? player.yellow },
    { label: "Red", value: stats?.totalRedCards ?? player.red },
  ];

  // Pagination logic for Career (10 items/page)
  const careerPerPage = 10;
  const paginatedCareer = useMemo(() => {
    if (!seasons) return [];
    const start = (careerPage - 1) * careerPerPage;
    return seasons.slice(start, start + careerPerPage);
  }, [seasons, careerPage]);
  const careerTotalPages = Math.ceil((seasons?.length || 0) / careerPerPage);

  // Pagination logic for Matches (15 items/page)
  const matchesPerPage = 15;
  const paginatedMatches = useMemo(() => {
    if (!matches) return [];
    const start = (matchesPage - 1) * matchesPerPage;
    return matches.slice(start, start + matchesPerPage);
  }, [matches, matchesPage]);
  const matchesTotalPages = Math.ceil((matches?.length || 0) / matchesPerPage);

  return (
    <div>
      <section
        className="text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.55) 100%)" }}
      >
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-10 flex items-center gap-4">
          <PlayerAvatar name={player.name} photoUrl={player.photoUrl} size={80} />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider opacity-80">
              {player.number ? `#${player.number} · ` : ""}{player.position}
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">{player.name}</h1>
            {player.clubId && (
              <Link href={`/clubs/${player.clubId}`} className="inline-flex items-center gap-2 mt-2 text-sm text-white/90 hover:text-white">
                <ClubCrest clubId={player.clubId} size={20} />
                <span>View club</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* Stat cards — always visible above tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center shadow-[var(--shadow-card)]">
              <div className="font-display font-bold text-2xl tabular-nums">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile" className="mt-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
              <h3 className="font-display font-bold mb-3">Profile</h3>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Nationality</dt>
                <dd>{player.nationality}</dd>
                {player.dateOfBirth && (
                  <>
                    <dt className="text-muted-foreground">Date of birth</dt>
                    <dd>{new Date(player.dateOfBirth).toLocaleDateString()}</dd>
                  </>
                )}
                {age !== null && (
                  <>
                    <dt className="text-muted-foreground">Age</dt>
                    <dd>{age}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Position</dt>
                <dd>{player.position}</dd>
                {player.height && (
                  <>
                    <dt className="text-muted-foreground">Height</dt>
                    <dd>{player.height} cm</dd>
                  </>
                )}
                {player.weight && (
                  <>
                    <dt className="text-muted-foreground">Weight</dt>
                    <dd>{player.weight} kg</dd>
                  </>
                )}
              </dl>
            </div>
          </TabsContent>

          {/* CAREER */}
          <TabsContent value="career" className="mt-4 space-y-4">
            {(!seasons || seasons.length === 0) ? (
              <div className="text-center text-sm text-muted-foreground py-8">No career history yet.</div>
            ) : (
              <>
                <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="font-display font-bold">Career History</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {paginatedCareer.map((s) => (
                      <div key={s.seasonId} className="flex items-center gap-3 p-3 text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{s.clubName}</div>
                          <div className="text-xs text-muted-foreground">{s.leagueName} · {s.seasonName}</div>
                        </div>
                        <div className="text-right text-xs tabular-nums space-x-2 text-muted-foreground">
                          <span><span className="font-bold text-foreground">{s.appearances}</span> apps</span>
                          <span><span className="font-bold text-foreground">{s.goals}</span> G</span>
                          <span><span className="font-bold text-foreground">{s.assists}</span> A</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination controls */}
                {careerTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="text-xs text-muted-foreground">
                      Showing {((careerPage - 1) * careerPerPage) + 1}–{Math.min(careerPage * careerPerPage, seasons.length)} of {seasons.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCareerPage((p) => Math.max(1, p - 1))}
                        disabled={careerPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-xs font-medium px-3 py-1.5">
                        Page {careerPage} of {careerTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCareerPage((p) => Math.min(careerTotalPages, p + 1))}
                        disabled={careerPage === careerTotalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* MATCHES */}
          <TabsContent value="matches" className="mt-4">
            {matchesLoading && (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            )}
            {!matchesLoading && !matches && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load matches.</p>
                <Button variant="outline" size="sm" onClick={() => refetchMatches()}>Try again</Button>
              </div>
            )}
            {matches && matches.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No match appearances yet.</div>
            )}
            {matches && matches.length > 0 && (
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {matches.map((m) => (
                  <Link key={m.matchId} href={`/match/${m.matchId}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {m.homeClub.name} {m.homeScore}–{m.awayScore} {m.awayClub.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(m.matchDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.isCaptain && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          (C)
                        </span>
                      )}
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                        m.lineupType === "starting"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {m.lineupType === "starting" ? "Starting" : "Bench"}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">#{m.shirtNumber}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
