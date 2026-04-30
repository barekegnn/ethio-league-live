import Link from "next/link";
import { leagues } from "@/data/mock";
import { SectionHeader } from "@/components/SectionHeader";
import { Trophy, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leagues · Ethio-League Live",
};

const tierBadge = (tier: number) =>
  tier === 1 ? "Tier 1" : tier === 2 ? "Tier 2" : "Tier 3";

export default function LeaguesPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader title="Ethiopian Leagues" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {leagues.map((l) => (
          <Link
            key={l.id}
            href={`/leagues/${l.id}`}
            className="group bg-card rounded-xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all p-4 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] grid place-items-center text-primary-foreground">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold truncate">{l.name}</div>
              <div className="text-xs text-muted-foreground">{tierBadge(l.tier)} · {l.season}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
