import Link from "next/link";
import { Match, Club, League } from "@/data/types";
import { ClubCrest } from "./ClubCrest";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  /** Optional club data — if not provided, only IDs are shown */
  clubs?: { home?: Club; away?: Club };
  /** Optional league data — if not provided, league info is hidden */
  league?: League;
  showLeague?: boolean;
  className?: string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const MatchCard = ({ match, clubs, league, showLeague, className }: MatchCardProps) => {
  // Use explicitly passed club data, or fall back to names embedded in the match object
  const homeName = clubs?.home?.shortName ?? match.homeClubName ?? match.homeId;
  const awayName = clubs?.away?.shortName ?? match.awayClubName ?? match.awayId;
  const homeLogo = clubs?.home?.logoUrl ?? match.homeClubLogo;
  const awayLogo = clubs?.away?.logoUrl ?? match.awayClubLogo;
  const isLive = match.status === "live";
  const isDone = match.status === "completed";

  return (
    <Link
      href={`/match/${match.id}`}
      className={cn(
        "group block bg-card rounded-xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all p-3",
        className,
      )}
    >
      {showLeague && league && (
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
          {league.shortName} · MD {match.matchday}
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Home */}
        <div className="flex items-center gap-2 min-w-0 justify-end">
          <span className="text-sm font-semibold truncate text-right">
            {homeName}
          </span>
          <ClubCrest clubId={match.homeId} logoUrl={homeLogo} size={28} />
        </div>

        {/* Score / time */}
        <div className="flex flex-col items-center min-w-[64px]">
          {isLive ? (
            <>
              <div className="font-display font-bold text-xl tabular-nums text-foreground">
                {match.homeScore}
                <span className="mx-1 text-muted-foreground">–</span>
                {match.awayScore}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-live">
                <span className="live-dot w-1.5 h-1.5" />
                {match.minute}&apos;
              </div>
            </>
          ) : isDone ? (
            <>
              <div className="font-display font-bold text-xl tabular-nums">
                {match.homeScore}
                <span className="mx-1 text-muted-foreground">–</span>
                {match.awayScore}
              </div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                FT
              </div>
            </>
          ) : (
            <>
              <div className="font-display font-bold text-base tabular-nums text-foreground">
                {formatTime(match.kickoff)}
              </div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                {new Date(match.kickoff).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-2 min-w-0">
          <ClubCrest clubId={match.awayId} logoUrl={awayLogo} size={28} />
          <span className="text-sm font-semibold truncate">
            {awayName}
          </span>
        </div>
      </div>
    </Link>
  );
};
