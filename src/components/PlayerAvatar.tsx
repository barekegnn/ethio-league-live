import { useState } from "react";

interface PlayerAvatarProps {
  name: string;
  photoUrl?: string;
  size?: number;
  ring?: boolean;
}

/**
 * Player avatar with photo support.
 * - When `photoUrl` is provided, renders the headshot.
 * - On error (broken/missing image) or when no URL is given, gracefully falls back
 *   to a deterministic initials tile.
 */
export const PlayerAvatar = ({ name, photoUrl, size = 56, ring = true }: PlayerAvatarProps) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = !!photoUrl && !photoFailed;

  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = 10 + (hash % 40);

  const ringClass = ring ? "ring-2 ring-accent shadow-[var(--shadow-player)]" : "";

  if (showPhoto) {
    return (
      <div
        className={`relative rounded-full overflow-hidden bg-muted ${ringClass}`}
        style={{ width: size, height: size }}
        aria-label={name}
      >
        <img
          src={photoUrl}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setPhotoFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-full font-display font-semibold text-primary-foreground overflow-hidden ${ringClass}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, hsl(${hue} 75% 55%), hsl(${hue} 75% 35%))`,
        fontSize: size * 0.36,
      }}
      aria-label={name}
    >
      <span className="drop-shadow">{initials}</span>
    </div>
  );
};
