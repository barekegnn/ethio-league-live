import { cn } from "@/lib/utils";
import { clubById } from "@/data/mock";
import { CLUB_LOGOS } from "@/assets/logos";

interface ClubCrestProps {
  clubId: string;
  size?: number;
  className?: string;
}

/**
 * Renders the club crest. Prefers a real logo image when available
 * (from CLUB_LOGOS or club.logoUrl), otherwise falls back to a
 * deterministic initials badge built from the club's brand color.
 */
export const ClubCrest = ({ clubId, size = 32, className }: ClubCrestProps) => {
  const club = clubById(clubId);
  const logoSrc = CLUB_LOGOS[clubId] ?? club?.logoUrl;

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={club?.name ?? "Club logo"}
        width={size}
        height={size}
        loading="lazy"
        className={cn("object-contain shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = (club?.shortName ?? "?")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const bg = club ? `hsl(${club.primaryColor})` : "hsl(var(--muted))";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-display font-bold text-white shrink-0 ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.4 }}
      aria-label={club?.name ?? "Club"}
    >
      {initials}
    </div>
  );
};
