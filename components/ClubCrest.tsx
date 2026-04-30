"use client";

import Image from "next/image";
import { CLUB_LOGOS } from "@/lib/logos";
import { cn } from "@/lib/utils";

interface ClubCrestProps {
  clubId: string;
  size?: number;
  className?: string;
}

export const ClubCrest = ({ clubId, size = 32, className }: ClubCrestProps) => {
  const src = CLUB_LOGOS[clubId];

  if (!src) {
    // Fallback: deterministic initials badge
    const initials = clubId
      .split("-")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground font-display font-bold shrink-0",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        aria-label={clubId}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={clubId}
      width={size}
      height={size}
      className={cn("object-contain shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
};
