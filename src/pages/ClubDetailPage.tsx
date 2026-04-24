import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  clubById,
  leagueById,
  matchesByLeague,
  playersByClub,
  standings,
} from "@/data/mock";
import { ClubCrest } from "@/components/ClubCrest";
import { MatchCard } from "@/components/MatchCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, MapPin, Users } from "lucide-react";

const ClubDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const club = id ? clubById(id) : undefined;

  useEffect(() => {
    if (club) document.title = `${club.name} · Club profile`;
  }, [club]);

  if (!club) {
    return <div className="px-4 py-12 text-center text-muted-foreground">Club not found.</div>;
  }

  const league = leagueById(club.leagueId);
  const squad = playersByClub(club.id);
  const standing = standings[club.leagueId]?.find((r) => r.clubId === club.id);
  const allMatches = matchesByLeague(club.leagueId).filter(
    (m) => m.homeId === club.id || m.awayId === club.id,
  );
  const fixtures = allMatches
    .filter((m) => m.status !== "completed")
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
  const results = allMatches
    .filter((m) => m.status === "completed")
    .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff));

  return (
    <div>
      <section
        className="text-white"
        style={{
          background: `linear-gradient(135deg, hsl(${club.primaryColor}) 0%, hsl(${club.primaryColor} / 0.6) 100%)`,
        }}
      >
        <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-10 flex items-center gap-4">
          <ClubCrest clubId={club.id} size={80} />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider opacity-80">{league?.name}</div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
              {club.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-white/80">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {club.city}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Founded {club.founded}</span>
              <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {club.stadium}</span>
              {standing && (
                <span className="inline-flex items-center gap-1 font-semibold">
                  · #{standing.position} · {standing.points} pts
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6">
        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="squad">Squad</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {club.description && (
              <p className="text-sm text-muted-foreground leading-relaxed bg-card rounded-xl border border-border p-4">
                {club.description}
              </p>
            )}
            {standing && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Played", value: standing.played },
                  { label: "Wins", value: standing.wins },
                  { label: "Goals For", value: standing.goalsFor },
                  { label: "Points", value: standing.points },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center shadow-[var(--shadow-card)]">
                    <div className="font-display font-bold text-2xl tabular-nums">{s.value}</div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="squad" className="mt-4">
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
              {squad.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Squad data coming soon.
                </div>
              )}
              {squad.map((p) => (
                <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                  <span className="w-8 text-center font-display font-bold text-muted-foreground">{p.number}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.position} · {p.nationality}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <span className="font-display font-bold text-foreground">{p.goals}</span> G · {p.assists} A
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fixtures" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fixtures.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClubDetailPage;
