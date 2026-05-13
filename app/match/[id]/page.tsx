"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useMatch, useMatchEvents, useMatchLineups, useMatchMedia } from "@/lib/api/hooks/matches";
import { useMatchRealtime } from "@/hooks/use-match-realtime";
import { ClubCrest } from "@/components/ClubCrest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotFoundError } from "@/lib/api/client";
import type { MatchLineupSide } from "@/lib/api/hooks/matches";
import type { MatchEventPayload, ScoreUpdatePayload } from "@/lib/pusher-types";

const eventIcon = (type: string) => {
  switch (type) {
    case "goal":
    case "penalty_goal":
    case "own_goal":
      return "⚽";
    case "yellow":
    case "yellow_card":
      return "🟨";
    case "red":
    case "red_card":
      return "🟥";
    case "sub":
    case "substitution":
      return "🔁";
    case "var":
      return "📺";
    default:
      return "•";
  }
};

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: match, isLoading: matchLoading, error: matchError, refetch: refetchMatch } = useMatch(id);
  const { data: initialEvents, isLoading: eventsLoading } = useMatchEvents(id, match?.status);
  const { data: lineups, isLoading: lineupsLoading } = useMatchLineups(id);
  const { data: media, isLoading: mediaLoading } = useMatchMedia(id);

  // Local state for real-time updates
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [liveScore, setLiveScore] = useState<{ home: number; away: number } | null>(null);

  // Real-time updates via Pusher
  const { status: liveStatus, elapsedMinutes, isLive: isMatchLive } = useMatchRealtime({
    matchId: id,
    initialStatus: match?.status,
    initialLiveStartedAt: match?.liveStartedAt,
    onEventCreated: (event: MatchEventPayload) => {
      // Add new event to the list
      const newEvent = {
        id: event.id,
        minute: event.minute,
        extraTime: event.extraTime,
        type: event.eventType.name,
        player: event.player ? `${event.player.firstName} ${event.player.lastName}` : "",
        relatedPlayer: event.relatedPlayer ? `${event.relatedPlayer.firstName} ${event.relatedPlayer.lastName}` : "",
        clubId: event.club?.id || "",
        detail: event.description,
      };
      setLiveEvents((prev) => [...prev, newEvent]);
    },
    onEventUpdated: (event: MatchEventPayload) => {
      // Update existing event
      const updatedEvent = {
        id: event.id,
        minute: event.minute,
        extraTime: event.extraTime,
        type: event.eventType.name,
        player: event.player ? `${event.player.firstName} ${event.player.lastName}` : "",
        relatedPlayer: event.relatedPlayer ? `${event.relatedPlayer.firstName} ${event.relatedPlayer.lastName}` : "",
        clubId: event.club?.id || "",
        detail: event.description,
      };
      setLiveEvents((prev) => prev.map((e) => (e.id === event.id ? updatedEvent : e)));
    },
    onEventDeleted: (eventId: string) => {
      // Remove deleted event
      setLiveEvents((prev) => prev.filter((e) => e.id !== eventId));
    },
    onScoreUpdated: (score: ScoreUpdatePayload) => {
      // Update score
      setLiveScore({ home: score.homeScore, away: score.awayScore });
    },
    onStatusChanged: () => {
      // Refetch match data when status changes
      refetchMatch();
    },
  });

  // Merge initial events with live events
  const allEvents = [...(initialEvents || []), ...liveEvents];

  // Use live score if available, otherwise use match score
  const displayHomeScore = liveScore?.home ?? match?.homeScore ?? 0;
  const displayAwayScore = liveScore?.away ?? match?.awayScore ?? 0;

  // Use live status if available, otherwise use match status
  const displayStatus = liveStatus || match?.status || "scheduled";
  const isLive = displayStatus === "live";
  const isDone = displayStatus === "completed";

  // 404 handling
  if (matchError instanceof NotFoundError) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Hero header ── */}
      <section className="hero-bg text-white">
        <div className="px-3 sm:px-6 pt-3 pb-6 sm:pb-8">
          <Button asChild variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10 mb-3 -ml-2">
            <Link href="/matches"><ArrowLeft className="w-4 h-4" /> Matches</Link>
          </Button>

          {matchLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-32 bg-white/20" />
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                  <Skeleton className="h-5 w-24 bg-white/20" />
                </div>
                <Skeleton className="h-16 w-24 bg-white/20" />
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                  <Skeleton className="h-5 w-24 bg-white/20" />
                </div>
              </div>
            </div>
          )}

          {matchError && !matchLoading && (
            <div className="text-center py-8 space-y-3">
              <p className="text-white/80 text-sm">Failed to load match.</p>
              <Button variant="secondary" size="sm" onClick={() => refetchMatch()}>Try again</Button>
            </div>
          )}

          {match && (
            <>
              <div className="text-[11px] uppercase tracking-wider text-accent font-bold mb-3">
                Matchday {match.matchday}
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
                <Link href={`/clubs/${match.homeId}`} className="flex flex-col items-center gap-2">
                  <ClubCrest clubId={match.homeId} logoUrl={match.homeClubLogo} size={64} />
                  <span className="font-display font-bold text-base sm:text-xl text-center">
                    {match.homeClubName ?? match.homeId}
                  </span>
                </Link>

                <div className="text-center">
                  {isLive || isDone ? (
                    <>
                      <div className="font-display font-bold text-4xl sm:text-6xl tabular-nums leading-none">
                        {displayHomeScore}
                        <span className="mx-2 text-white/50">-</span>
                        {displayAwayScore}
                      </div>
                      <div className={cn("mt-2 text-xs sm:text-sm font-bold", isLive ? "text-live" : "text-white/70")}>
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="live-dot w-1.5 h-1.5" /> {elapsedMinutes}&apos;
                          </span>
                        ) : "Full Time"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-display font-bold text-2xl sm:text-3xl">
                        {new Date(match.kickoff).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="mt-1 text-xs text-white/70">
                        {new Date(match.kickoff).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                    </>
                  )}
                </div>

                <Link href={`/clubs/${match.awayId}`} className="flex flex-col items-center gap-2">
                  <ClubCrest clubId={match.awayId} logoUrl={match.awayClubLogo} size={64} />
                  <span className="font-display font-bold text-base sm:text-xl text-center">
                    {match.awayClubName ?? match.awayId}
                  </span>
                </Link>
              </div>

              {match.stadium && (
                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/80">
                  <MapPin className="w-3.5 h-3.5" />
                  {match.stadium}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <Tabs defaultValue={isLive || isDone ? "events" : "lineups"}>
          <TabsList className="w-full grid grid-cols-4 gap-1">
            <TabsTrigger value="summary" className="text-xs sm:text-sm px-2 sm:px-3">Summary</TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm px-2 sm:px-3">Events</TabsTrigger>
            <TabsTrigger value="lineups" className="text-xs sm:text-sm px-2 sm:px-3">Lineups</TabsTrigger>
            <TabsTrigger value="media" className="text-xs sm:text-sm px-2 sm:px-3">Media</TabsTrigger>
          </TabsList>

          {/* Summary */}
          <TabsContent value="summary" className="mt-4 space-y-3">
            {matchLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : match ? (
              <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
                <h3 className="font-display font-bold mb-2">Match info</h3>
                <dl className="grid grid-cols-2 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Matchday</dt>
                  <dd>{match.matchday}</dd>
                  <dt className="text-muted-foreground">Stadium</dt>
                  <dd>{match.stadium || "—"}</dd>
                  <dt className="text-muted-foreground">Kickoff</dt>
                  <dd>{new Date(match.kickoff).toLocaleString()}</dd>
                  {match.attendance && (
                    <>
                      <dt className="text-muted-foreground">Attendance</dt>
                      <dd>{match.attendance.toLocaleString()}</dd>
                    </>
                  )}
                </dl>
              </div>
            ) : null}
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="mt-4">
            {eventsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {!allEvents || allEvents.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {isLive ? "Waiting for match events..." : "No events yet."}
                  </div>
                ) : (
                  [...allEvents].sort((a, b) => b.minute - a.minute).map((e, i) => {
                    const isHome = e.clubId === match?.homeId;
                    return (
                      <div key={e.id || i} className={cn("p-3 flex items-center gap-3", isHome ? "" : "flex-row-reverse text-right")}>
                        <div className="font-display font-bold text-muted-foreground tabular-nums w-10 text-center">
                          {e.minute}{e.extraTime ? `+${e.extraTime}` : ""}&apos;
                        </div>
                        <div className="text-2xl">{eventIcon(e.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {e.player}
                            {e.type === "substitution" && e.relatedPlayer && (
                              <span className="text-muted-foreground"> → {e.relatedPlayer}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {e.type === "goal" ? "Goal" : 
                             e.type === "penalty_goal" ? "Penalty Goal" :
                             e.type === "own_goal" ? "Own Goal" :
                             e.type === "yellow_card" ? "Yellow Card" :
                             e.type === "red_card" ? "Red Card" :
                             e.type === "substitution" ? "Substitution" :
                             e.type}
                            {e.detail ? ` (${e.detail})` : ""}
                          </div>
                        </div>
                        <ClubCrest clubId={e.clubId} size={24} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>

          {/* Lineups */}
          <TabsContent value="lineups" className="mt-4">
            {lineupsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : lineups ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LineupList side={lineups.home} label="Home" />
                <LineupList side={lineups.away} label="Away" />
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
                Lineups not available yet.
              </div>
            )}
          </TabsContent>

          {/* Media */}
          <TabsContent value="media" className="mt-4">
            {mediaLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-xl" />
                ))}
              </div>
            ) : !media || media.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">No media available.</div>
            ) : (
              <div className="space-y-4">
                {/* Images */}
                {media.filter((m) => m.mediaType === "image").length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {media
                      .filter((m) => m.mediaType === "image")
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((item) => (
                        <div key={item.id}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.mediaUrl}
                            alt={item.caption ?? "Match photo"}
                            className="w-full aspect-video object-cover rounded-xl"
                          />
                          {item.caption && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{item.caption}</p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
                {/* Videos */}
                {media.filter((m) => m.mediaType === "video").length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Videos</div>
                    {media
                      .filter((m) => m.mediaType === "video")
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((item) => (
                        <a
                          key={item.id}
                          href={item.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-secondary/40 transition-colors"
                        >
                          <span className="text-2xl">▶️</span>
                          <span className="text-sm font-medium truncate">
                            {item.caption ?? "Watch video"}
                          </span>
                        </a>
                      ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LineupList({ side, label }: { side: MatchLineupSide; label: string }) {
  return (
    <div>
      <h3 className="font-display font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
        {side.clubName} — {label}
      </h3>
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
        {side.starting.length === 0 && side.bench.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">No lineup data.</div>
        ) : (
          <>
            {side.starting.map((p) => (
              <div key={p.playerId} className="flex items-center gap-3 px-3 py-2">
                <span className="w-6 text-center text-xs font-bold text-muted-foreground tabular-nums">{p.shirtNumber}</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {p.position?.code ?? "—"}
                </span>
                <span className="text-sm font-medium flex-1 truncate">
                  {p.firstName} {p.lastName}
                  {p.isCaptain && <span className="ml-1 text-accent text-xs">(C)</span>}
                </span>
              </div>
            ))}
            {side.bench.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold bg-secondary/40">
                  Bench
                </div>
                {side.bench.map((p) => (
                  <div key={p.playerId} className="flex items-center gap-3 px-3 py-2 opacity-70">
                    <span className="w-6 text-center text-xs font-bold text-muted-foreground tabular-nums">{p.shirtNumber}</span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {p.position?.code ?? "—"}
                    </span>
                    <span className="text-sm font-medium flex-1 truncate">{p.firstName} {p.lastName}</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
