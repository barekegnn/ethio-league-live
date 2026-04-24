import { cn } from "@/lib/utils";
import type { League } from "@/data/types";
import { LEAGUE_LOGOS } from "@/assets/logos";

interface LeagueLogoProps {
  league: League;
  size?: number;
  className?: string;
}

/**
 * Renders the league badge. Prefers a real image (LEAGUE_LOGOS or league.logoUrl)
 * when available, otherwise falls back to a deterministic initials badge.
 */
export const LeagueLogo = ({ league, size = 24, className }: LeagueLogoProps) => {
  const logoSrc = LEAGUE_LOGOS[league.id] ?? league.logoUrl;

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={`${league.name} logo`}
        width={size}
        height={size}
        loading="lazy"
        className={cn("object-contain shrink-0", className)}
        style={{ width: size, height: size }}
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
