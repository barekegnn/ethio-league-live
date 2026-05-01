"use client";

import Link from "next/link";
import { useMatches } from "@/lib/api/hooks/matches";
import { ClubCrest } from "./ClubCrest";

export const LiveTicker = () => {
  const { data: allMatches } = useMatches({ status: "live" });
  const live = allMatches ?? [];

  if (live.length === 0) return null;

  return (
    <section aria-label="Live scores" className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-live shrink-0">
          <span className="live-dot w-1.5 h-1.5" />
          Live
        </div>
        <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar">
          {live.map((m) => (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              className="flex items-center gap-2 text-xs whitespace-nowrap hover:text-accent transition-colors"
            >
              <ClubCrest clubId={m.homeId} logoUrl={m.homeClubLogo} size={18} />
              <span className="font-semibold">{m.homeClubName ?? m.homeId}</span>
              <span className="font-display font-bold text-accent tabular-nums">
                {m.homeScore}-{m.awayScore}
              </span>
              <span className="font-semibold">{m.awayClubName ?? m.awayId}</span>
              <ClubCrest clubId={m.awayId} logoUrl={m.awayClubLogo} size={18} />
              {m.minute && (
                <span className="text-[10px] text-background/60">
                  {m.minute}&apos;
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
