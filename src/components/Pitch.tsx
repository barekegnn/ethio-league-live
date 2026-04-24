import { useMemo } from "react";
import { Player, TeamLineup, applyFormation } from "@/data/lineup";
import { PlayerAvatar } from "./PlayerAvatar";

interface PitchProps {
  team: TeamLineup;
  /** Stagger delay between players in ms */
  stagger?: number;
  /** Initial delay before first player appears */
  initialDelay?: number;
  /** Re-trigger animations when this value changes (used by parent) */
  animationKey?: string | number;
}

export const Pitch = ({ team, stagger = 160, initialDelay = 300, animationKey }: PitchProps) => {
  const positioned: Player[] = useMemo(() => applyFormation(team), [team]);

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden pitch-bg shadow-[var(--shadow-broadcast)] border border-border/40">
      {/* Mowed stripes */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, hsl(var(--pitch-light)) 0 8%, hsl(var(--pitch-dark)) 8% 16%)",
        }}
      />
      {/* Pitch markings */}
      <svg
        viewBox="0 0 100 130"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ stroke: "hsl(var(--pitch-line) / 0.7)", fill: "none", strokeWidth: 0.3 }}
      >
        <rect x="2" y="2" width="96" height="126" />
        <line x1="2" y1="65" x2="98" y2="65" />
        <circle cx="50" cy="65" r="9" />
        <circle cx="50" cy="65" r="0.6" fill="hsl(var(--pitch-line) / 0.7)" />
        <rect x="20" y="2" width="60" height="14" />
        <rect x="35" y="2" width="30" height="6" />
        <circle cx="50" cy="18" r="0.6" fill="hsl(var(--pitch-line) / 0.7)" />
        <rect x="20" y="114" width="60" height="14" />
        <rect x="35" y="122" width="30" height="6" />
        <circle cx="50" cy="112" r="0.6" fill="hsl(var(--pitch-line) / 0.7)" />
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_hsl(0_0%_0%/0.5)_100%)] pointer-events-none" />

      {/* Formation badge */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-broadcast-bg/80 border border-accent/40 backdrop-blur-sm">
        <span className="font-display text-[10px] sm:text-xs tracking-wider text-accent font-bold">
          {team.formation}
        </span>
      </div>

      {/* Players */}
      {positioned.map((p, i) => (
        <div
          key={`${animationKey ?? ""}-${p.number}-${p.name}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 animate-slide-in-pitch"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${initialDelay + i * stagger}ms`,
          }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <PlayerAvatar name={p.name} photoUrl={p.photoUrl} size={56} />
              <span className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md font-display">
                {p.number}
              </span>
            </div>
            <span
              className="font-display text-xs sm:text-sm font-semibold text-foreground px-2 py-0.5 rounded text-shadow-broadcast whitespace-nowrap"
              style={{ background: "hsl(var(--broadcast-bg) / 0.85)" }}
            >
              {p.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
