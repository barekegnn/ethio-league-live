"use client";

import Image from "next/image";
import { useState } from "react";
import { CLUB_LOGOS } from "@/lib/logos";
import { cn } from "@/lib/utils";

interface ClubCrestProps {
  clubId: string;
  /** Optional logo URL from the API — takes precedence over the local logo map */
  logoUrl?: string;
  size?: number;
  className?: string;
}

export const ClubCrest = ({ clubId, logoUrl, size = 32, className }: ClubCrestProps) => {
  const [apiFailed, setApiFailed] = useState(false);
  // Prefer API logo URL, fall back to local map
  const src = (!apiFailed && logoUrl) ? logoUrl : CLUB_LOGOS[clubId];

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

  // Use a plain <img> for external API URLs to avoid Next.js domain restrictions at runtime
  if (logoUrl && !apiFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={clubId}
        width={size}
        height={size}
        onError={() => setApiFailed(true)}
        className={cn("object-contain shrink-0", className)}
        style={{ width: size, height: size }}
      />
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
