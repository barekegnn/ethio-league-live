import { Link } from "react-router-dom";
import { matches, clubById } from "@/data/mock";
import { ClubCrest } from "./ClubCrest";

export const LiveTicker = () => {
  const live = matches.filter((m) => m.status === "live");
  if (live.length === 0) return null;

  return (
    <section
      aria-label="Live scores"
      className="bg-foreground text-background"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-live shrink-0">
          <span className="live-dot w-1.5 h-1.5" />
          Live
        </div>
        <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar">
          {live.map((m) => {
            const home = clubById(m.homeId);
            const away = clubById(m.awayId);
            return (
              <Link
                key={m.id}
                to={`/match/${m.id}`}
                className="flex items-center gap-2 text-xs whitespace-nowrap hover:text-accent transition-colors"
              >
                <ClubCrest clubId={m.homeId} size={18} />
                <span className="font-semibold">{home?.shortName}</span>
                <span className="font-display font-bold text-accent tabular-nums">
                  {m.homeScore}-{m.awayScore}
                </span>
                <span className="font-semibold">{away?.shortName}</span>
                <ClubCrest clubId={m.awayId} size={18} />
                <span className="text-[10px] text-background/60">
                  {m.minute}'
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
