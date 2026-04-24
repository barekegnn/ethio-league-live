interface PlayerAvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
}

/** Generates a deterministic initials avatar (no external photos required). */
export const PlayerAvatar = ({ name, size = 56, ring = true }: PlayerAvatarProps) => {
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // hash-based hue for subtle variation, but kept within brand-friendly warm range
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = 10 + (hash % 40); // 10–50 (warm reds/oranges)

  return (
    <div
      className={`relative flex items-center justify-center rounded-full font-display font-semibold text-primary-foreground overflow-hidden ${
        ring ? "ring-2 ring-accent shadow-[var(--shadow-player)]" : ""
      }`}
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
