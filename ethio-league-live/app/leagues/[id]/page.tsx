"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { leagueById, standings, clubById, matchesByLeague, topScorers } from "@/data/mock";
import { ClubCrest } from "@/components/ClubCrest";
import { MatchCard } from "@/components/MatchCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const formColor = (r: "W" | "D" | "L") =>
  r === "W" ? "bg-win text-white" : r === "L" ? "bg-loss text-white" : "bg-draw text-white";

export default function LeagueDetailPage() {
  const params = useParams<{ id: string }>();
  const league = params.id ? leagueById(params.id) : undefined;

  if (!league) {
    return <div className="px-4 py-12 text-center text-muted-foreground">League not found.</div>;
  }

  const table = standings[league.id] ?? [];
  const allMatches = matchesByLeague(league.id);
  const fixtures = allMatches.filter((m) => m.status === "scheduled");
  const results = allMatches.filter((m) => m.status === "completed").sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff));
  const scorers = topScorers().slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      <header>
        <div className="text-xs uppercase tracking-wider text-primary font-bold">{league.season}</div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{league.name}</h1>
      </header>

      <Tabs defaultValue="standings">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="scorers">Scorers</TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="mt-4">
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
                {table.map((row) => {
                  const c = clubById(row.clubId);
                  const gd = row.goalsFor - row.goalsAgainst;
                  const isTop = row.position <= 3;
                  const isBottom = row.position > table.length - 2;
                  return (
                    <tr key={row.clubId} className="border-t border-border hover:bg-secondary/40 transition-colors">
                      <td className="py-2 px-3">
                        <span className={cn("inline-block w-6 h-6 leading-6 text-center rounded font-display font-bold text-xs",
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
                          <span className="font-medium truncate">{c?.shortName}</span>
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
                            <span key={i} className={cn("w-5 h-5 rounded text-[10px] font-bold grid place-items-center", formColor(r))} title={r}>
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

        <TabsContent value="scorers" className="mt-4">
          <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
            {scorers.map((p, i) => {
              const c = clubById(p.clubId);
              return (
                <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                  <span className="w-6 text-center font-display font-bold text-muted-foreground">{i + 1}</span>
                  <ClubCrest clubId={p.clubId} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c?.shortName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-lg tabular-nums">{p.goals}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Goals</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
