import { cn } from "@/lib/utils";
import { clubById } from "@/data/mock";

interface ClubCrestProps {
  clubId: string;
  size?: number;
  className?: string;
}

/**
 * Lightweight, deterministic crest built from club initials + brand color.
 * Used everywhere a real logo asset is unavailable.
 */
export const ClubCrest = ({ clubId, size = 32, className }: ClubCrestProps) => {
  const club = clubById(clubId);
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
