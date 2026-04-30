"use client";

import { useMemo, useState } from "react";
import { matches } from "@/data/mock";
import { MatchCard } from "@/components/MatchCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

type Filter = "live" | "today" | "upcoming" | "results";

const groupByDate = (list: typeof matches) => {
  const groups = new Map<string, typeof matches>();
  for (const m of list) {
    const key = new Date(m.kickoff).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return Array.from(groups.entries());
};

export default function MatchesPage() {
  const [filter, setFilter] = useState<Filter>("today");

  const filtered = useMemo(() => {
    const todayKey = new Date().toDateString();
    switch (filter) {
      case "live":
        return matches.filter((m) => m.status === "live");
      case "today":
        return matches.filter((m) => new Date(m.kickoff).toDateString() === todayKey);
      case "upcoming":
        return matches
          .filter((m) => m.status === "scheduled")
          .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
      case "results":
        return matches
          .filter((m) => m.status === "completed")
          .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff));
    }
  }, [filter]);

  const grouped = groupByDate(filtered);

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Matches</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="live" className="gap-1.5">
            <span className={cn(filter === "live" && "live-dot w-1.5 h-1.5")} />
            Live
          </TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          {grouped.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No matches in this view.</div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([date, list]) => (
                <section key={date}>
                  <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {list.map((m) => (
                      <MatchCard key={m.id} match={m} showLeague />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
