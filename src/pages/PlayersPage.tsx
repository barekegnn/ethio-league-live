import { useEffect } from "react";
import { Link } from "react-router-dom";
import { players, clubById } from "@/data/mock";
import { ClubCrest } from "@/components/ClubCrest";
import { SectionHeader } from "@/components/SectionHeader";

const PlayersPage = () => {
  useEffect(() => {
    document.title = "Players · Ethio-League Live";
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader title="Players" />
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
        {players.map((p) => {
          const c = clubById(p.clubId);
          return (
            <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
              <ClubCrest clubId={p.clubId} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  #{p.number} · {p.position} · {c?.shortName}
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-display font-bold text-base text-foreground tabular-nums">{p.goals}</span>
                <span className="text-muted-foreground"> G</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PlayersPage;
