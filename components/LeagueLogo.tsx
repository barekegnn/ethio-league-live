"use client";

import Image from "next/image";
import { LEAGUE_LOGOS } from "@/lib/logos";
import { cn } from "@/lib/utils";

interface LeagueLogoProps {
  leagueId: string;
  size?: number;
  className?: string;
}

export const LeagueLogo = ({ leagueId, size = 32, className }: LeagueLogoProps) => {
  const src = LEAGUE_LOGOS[leagueId];

  if (!src) {
    const initials = leagueId
      .split("-")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 3)
      .join("");
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold shrink-0",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.32 }}
        aria-label={leagueId}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={leagueId}
      width={size}
      height={size}
      className={cn("object-contain shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
};
