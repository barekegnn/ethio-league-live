import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { matchById, clubById, leagueById } from "@/data/mock";
import { ClubCrest } from "@/components/ClubCrest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pitch } from "@/components/Pitch";
import { saintGeorge, ethiopianCoffee } from "@/data/lineup";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const eventIcon = (type: string) => {
  switch (type) {
    case "goal":
      return "⚽";
    case "yellow":
      return "🟨";
    case "red":
      return "🟥";
    case "sub":
      return "🔁";
    case "var":
      return "📺";
    default:
      return "•";
  }
};

const MatchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const match = id ? matchById(id) : undefined;

  useEffect(() => {
    if (match) {
      const home = clubById(match.homeId)?.shortName;
      const away = clubById(match.awayId)?.shortName;
      document.title = `${home} vs ${away} · Match Center`;
    }
  }, [match]);

  if (!match) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Match not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/matches"><ArrowLeft className="w-4 h-4" /> Back to matches</Link>
        </Button>
      </div>
    );
  }

  const home = clubById(match.homeId);
  const away = clubById(match.awayId);
  const league = leagueById(match.leagueId);
  const isLive = match.status === "live";
  const isDone = match.status === "completed";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <section className="hero-bg text-white">
        <div className="px-3 sm:px-6 pt-3 pb-6 sm:pb-8">
          <Button asChild variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10 mb-3 -ml-2">
            <Link to="/matches"><ArrowLeft className="w-4 h-4" /> Matches</Link>
          </Button>

          <div className="text-[11px] uppercase tracking-wider text-accent font-bold mb-3">
            {league?.shortName} · Matchday {match.matchday}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            <Link to={`/clubs/${match.homeId}`} className="flex flex-col items-center gap-2">
              <ClubCrest clubId={match.homeId} size={64} />
              <span className="font-display font-bold text-base sm:text-xl text-center">
                {home?.shortName}
              </span>
            </Link>

            <div className="text-center">
              {isLive || isDone ? (
                <>
                  <div className="font-display font-bold text-4xl sm:text-6xl tabular-nums leading-none">
                    {match.homeScore}
                    <span className="mx-2 text-white/50">-</span>
                    {match.awayScore}
                  </div>
                  <div className={cn("mt-2 text-xs sm:text-sm font-bold", isLive ? "text-live" : "text-white/70")}>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="live-dot w-1.5 h-1.5" /> {match.minute}'
                      </span>
                    ) : (
                      "Full Time"
                    )}
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

            <Link to={`/clubs/${match.awayId}`} className="flex flex-col items-center gap-2">
              <ClubCrest clubId={match.awayId} size={64} />
              <span className="font-display font-bold text-base sm:text-xl text-center">
                {away?.shortName}
              </span>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/80">
            <MapPin className="w-3.5 h-3.5" />
            {match.stadium}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <Tabs defaultValue={isLive || isDone ? "events" : "lineups"}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="lineups">Lineups</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4 space-y-3">
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
              <h3 className="font-display font-bold mb-2">Match info</h3>
              <dl className="grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Competition</dt>
                <dd>{league?.name}</dd>
                <dt className="text-muted-foreground">Matchday</dt>
                <dd>{match.matchday}</dd>
                <dt className="text-muted-foreground">Stadium</dt>
                <dd>{match.stadium}</dd>
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
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
              {!match.events || match.events.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No events yet.
                </div>
              ) : (
                [...match.events]
                  .sort((a, b) => b.minute - a.minute)
                  .map((e, i) => {
                    const isHome = e.clubId === match.homeId;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "p-3 flex items-center gap-3",
                          isHome ? "" : "flex-row-reverse text-right",
                        )}
                      >
                        <div className="font-display font-bold text-muted-foreground tabular-nums w-10 text-center">
                          {e.minute}'
                        </div>
                        <div className="text-2xl">{eventIcon(e.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{e.player}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {e.type === "goal" ? "Goal" : e.type}
                          </div>
                        </div>
                        <ClubCrest clubId={e.clubId} size={24} />
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>

          <TabsContent value="lineups" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="font-display font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
                  {home?.shortName} · {saintGeorge.formation}
                </h3>
                <Pitch team={saintGeorge} animationKey={`home-${match.id}`} />
              </div>
              <div>
                <h3 className="font-display font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
                  {away?.shortName} · {ethiopianCoffee.formation}
                </h3>
                <Pitch team={ethiopianCoffee} animationKey={`away-${match.id}`} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <StatsBlock match={match} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatsBlock = ({ match }: { match: ReturnType<typeof matchById> }) => {
  if (!match) return null;
  // Mock stats
  const rows = [
    { label: "Possession", h: 56, a: 44, suffix: "%" },
    { label: "Shots", h: 14, a: 9 },
    { label: "Shots on target", h: 6, a: 3 },
    { label: "Corners", h: 7, a: 4 },
    { label: "Fouls", h: 11, a: 13 },
    { label: "Yellow cards", h: 1, a: 2 },
  ];
  return (
    <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-4 sm:p-6 space-y-4">
      {rows.map((r) => {
        const total = r.h + r.a || 1;
        const hp = (r.h / total) * 100;
        return (
          <div key={r.label}>
            <div className="flex justify-between text-sm font-semibold mb-1.5">
              <span className="tabular-nums">{r.h}{r.suffix ?? ""}</span>
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                {r.label}
              </span>
              <span className="tabular-nums">{r.a}{r.suffix ?? ""}</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden flex">
              <div className="bg-primary" style={{ width: `${hp}%` }} />
              <div className="bg-accent flex-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MatchDetailPage;
