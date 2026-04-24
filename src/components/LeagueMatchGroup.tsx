import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Match, League } from "@/data/types";
import { MatchCard } from "./MatchCard";
import { cn } from "@/lib/utils";

interface LeagueMatchGroupProps {
  league: League;
  matches: Match[];
  defaultOpen?: boolean;
}

export const LeagueMatchGroup = ({
  league,
  matches,
  defaultOpen = true,
}: LeagueMatchGroupProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const liveCount = matches.filter((m) => m.status === "live").length;

  return (
    <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary/50 hover:bg-secondary transition-colors text-left"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
            Ethiopia
          </span>
          <span className="text-muted-foreground/50">·</span>
          <Link
            to={`/leagues/${league.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-display font-bold text-sm truncate hover:text-primary"
          >
            {league.name}
          </Link>
          {league.gender === "women" && (
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
              W
            </span>
          )}
          {league.ageGroup && league.ageGroup !== "senior" && (
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground shrink-0">
              {league.ageGroup}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {liveCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-live">
              <span className="live-dot w-1.5 h-1.5" />
              {liveCount} LIVE
            </span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {matches.length}
          </span>
        </div>
      </button>

      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-border">
            {matches.map((m) => (
              <div key={m.id} className="px-1">
                <MatchCard match={m} className="border-0 shadow-none rounded-none hover:bg-secondary/30 hover:shadow-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
