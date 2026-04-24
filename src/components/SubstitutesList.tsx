import { Player } from "@/data/lineup";
import { PlayerAvatar } from "./PlayerAvatar";

interface SubstitutesListProps {
  subs: Player[];
  initialDelay?: number;
  stagger?: number;
}

export const SubstitutesList = ({ subs, initialDelay = 2400, stagger = 120 }: SubstitutesListProps) => {
  return (
    <div className="rounded-2xl border border-border/40 bg-[hsl(var(--broadcast-panel))] shadow-[var(--shadow-broadcast)] overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] flex items-center justify-between">
        <h3 className="font-display text-primary-foreground font-bold tracking-wider text-sm sm:text-base">
          SUBSTITUTES
        </h3>
        <span className="text-xs text-primary-foreground/80 font-display">{subs.length}</span>
      </div>
      <ul className="divide-y divide-border/40">
        {subs.map((p, i) => (
          <li
            key={`${p.number}-${p.name}`}
            className="flex items-center gap-3 px-3 py-2.5 animate-slide-in-right hover:bg-muted/30 transition-colors"
            style={{ animationDelay: `${initialDelay + i * stagger}ms` }}
          >
            <span className="font-display font-bold text-accent w-7 text-center text-base">
              {p.number}
            </span>
            <PlayerAvatar name={p.name} size={36} ring={false} />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-foreground text-sm truncate">
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground">{p.position}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
