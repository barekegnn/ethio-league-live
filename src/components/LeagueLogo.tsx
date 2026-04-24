import { cn } from "@/lib/utils";
import type { League } from "@/data/types";

interface LeagueLogoProps {
  league: League;
  size?: number;
  className?: string;
}

/**
 * Deterministic league badge built from short-name initials + a color
 * derived from tier & gender. Falls back if `logoUrl` is provided.
 */
export const LeagueLogo = ({ league, size = 24, className }: LeagueLogoProps) => {
  if (league.logoUrl) {
    return (
      <img
        src={league.logoUrl}
        alt={`${league.name} logo`}
        width={size}
        height={size}
        className={cn("rounded-md object-cover shrink-0 ring-1 ring-border", className)}
      />
    );
  }

  // Color by tier; tweak hue for women / youth so groups are visually distinct.
  const tierHue = league.tier === 1 ? 142 : league.tier === 2 ? 28 : 265;
  const hue =
    league.gender === "women"
      ? (tierHue + 40) % 360
      : league.ageGroup && league.ageGroup !== "senior"
        ? (tierHue + 200) % 360
        : tierHue;
  const bg = `linear-gradient(135deg, hsl(${hue} 70% 38%), hsl(${hue} 70% 22%))`;

  const initials = league.shortName
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md font-display font-bold text-white shrink-0 ring-1 ring-black/10",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.34,
        letterSpacing: "0.02em",
      }}
      aria-label={`${league.name} logo`}
    >
      {initials}
    </div>
  );
};
