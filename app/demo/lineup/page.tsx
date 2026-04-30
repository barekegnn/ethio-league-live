"use client";

import { useState } from "react";
import { MatchHeader } from "@/components/MatchHeader";
import { Pitch } from "@/components/Pitch";
import { SubstitutesList } from "@/components/SubstitutesList";
import { MatchTimeline } from "@/components/MatchTimeline";
import { saintGeorge, ethiopianCoffee, TeamLineup } from "@/data/lineup";
import { Button } from "@/components/ui/button";
import { RotateCcw, Users, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "lineup" | "timeline";
type TeamKey = "home" | "away";

const TEAMS: Record<TeamKey, TeamLineup> = {
  home: saintGeorge,
  away: ethiopianCoffee,
};

export default function LineupDemoPage() {
  const [mode, setMode] = useState<Mode>("lineup");
  const [teamKey, setTeamKey] = useState<TeamKey>("home");
  const [runId, setRunId] = useState(0);

  const team = TEAMS[teamKey];
  const replayKey = `${teamKey}-${runId}`;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <h1 className="sr-only">
          Saint George vs Ethiopian Coffee – Ethiopian Premier League Matchday 5
        </h1>

        <MatchHeader />

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="lineup" className="gap-1.5 font-display text-xs sm:text-sm">
                <Users className="w-3.5 h-3.5" />
                Lineup
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5 font-display text-xs sm:text-sm">
                <Activity className="w-3.5 h-3.5" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "lineup" && (
            <Tabs value={teamKey} onValueChange={(v) => setTeamKey(v as TeamKey)}>
              <TabsList>
                <TabsTrigger value="home" className="font-display text-xs sm:text-sm">
                  {saintGeorge.shortName}
                </TabsTrigger>
                <TabsTrigger value="away" className="font-display text-xs sm:text-sm">
                  {ethiopianCoffee.shortName}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {mode === "lineup" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
              <section aria-label={`${team.name} starting eleven`}>
                <Pitch team={team} animationKey={replayKey} />
              </section>
              <aside aria-label={`${team.name} substitutes`} className="space-y-4 sm:space-y-6">
                <SubstitutesList
                  title={`${team.shortName.toUpperCase()} · BENCH`}
                  subs={team.subs}
                  initialDelay={2400}
                  stagger={130}
                  animationKey={replayKey}
                />
              </aside>
            </div>
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={() => setRunId((n) => n + 1)} className="gap-2 font-display">
                <RotateCcw className="w-4 h-4" />
                Replay Animation
              </Button>
            </div>
          </>
        ) : (
          <MatchTimeline />
        )}
      </div>
    </main>
  );
}
