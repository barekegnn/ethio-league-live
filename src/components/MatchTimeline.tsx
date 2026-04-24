import { useEffect, useMemo, useRef, useState } from "react";
import { MatchEvent, matchEvents, saintGeorge, ethiopianCoffee } from "@/data/lineup";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, Goal, Square, ArrowLeftRight, Flag, Video } from "lucide-react";

const formatMinute = (e: MatchEvent) =>
  e.stoppage ? `${e.minute}+${e.stoppage}'` : `${e.minute}'`;

const eventMeta = (type: MatchEvent["type"]) => {
  switch (type) {
    case "goal":
      return { Icon: Goal, label: "GOAL", color: "text-accent", bg: "bg-accent/15", ring: "ring-accent/40" };
    case "yellow":
      return { Icon: Square, label: "YELLOW", color: "text-yellow-400", bg: "bg-yellow-400/15", ring: "ring-yellow-400/40" };
    case "red":
      return { Icon: Square, label: "RED", color: "text-destructive", bg: "bg-destructive/20", ring: "ring-destructive/50" };
    case "sub":
      return { Icon: ArrowLeftRight, label: "SUB", color: "text-primary-foreground", bg: "bg-primary/30", ring: "ring-primary/50" };
    case "var":
      return { Icon: Video, label: "VAR", color: "text-foreground", bg: "bg-muted/50", ring: "ring-border" };
    case "kickoff":
    case "halftime":
    case "fulltime":
      return { Icon: Flag, label: type.toUpperCase(), color: "text-foreground", bg: "bg-muted/40", ring: "ring-border" };
  }
};

const sideLabel = (side?: MatchEvent["side"]) => {
  if (!side) return null;
  return side === "home" ? saintGeorge.shortName : ethiopianCoffee.shortName;
};

/**
 * Match Timeline panel with auto-playback.
 * Reveals events in order, advancing every `tickMs` while playing.
 * Calculates a running scoreline as goals appear.
 */
export const MatchTimeline = () => {
  const [revealed, setRevealed] = useState(1); // start with kickoff visible
  const [playing, setPlaying] = useState(true);
  const tickMs = 1400;
  const events = matchEvents;
  const total = events.length;
  const timerRef = useRef<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!playing) return;
    if (revealed >= total) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setRevealed((n) => Math.min(total, n + 1));
    }, tickMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, revealed, total]);

  // Auto-scroll the latest event into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const last = list.querySelector<HTMLLIElement>("li:last-of-type");
    last?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revealed]);

  const visible = events.slice(0, revealed);

  const score = useMemo(() => {
    let home = 0;
    let away = 0;
    for (const e of visible) {
      if (e.type !== "goal") continue;
      if (e.side === "home") home++;
      else if (e.side === "away") away++;
    }
    return { home, away };
  }, [visible]);

  const reset = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setRevealed(1);
    setPlaying(true);
  };

  return (
    <section
      aria-label="Match timeline"
      className="rounded-2xl border border-border/40 bg-[hsl(var(--broadcast-panel))] shadow-[var(--shadow-broadcast)] overflow-hidden animate-fade-in"
    >
      {/* Scoreboard header */}
      <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-broadcast-bg via-[hsl(var(--broadcast-panel))] to-broadcast-bg border-b border-accent/30">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display font-bold text-accent text-sm sm:text-base tracking-[0.18em]">
            MATCH TIMELINE
          </h3>
          <div className="flex items-center gap-2 sm:gap-3 font-display">
            <span className="text-xs sm:text-sm text-foreground truncate max-w-[80px] sm:max-w-none">
              {saintGeorge.shortName}
            </span>
            <span className="px-2.5 sm:px-3 py-0.5 rounded bg-accent text-accent-foreground font-bold text-base sm:text-lg tabular-nums">
              {score.home} - {score.away}
            </span>
            <span className="text-xs sm:text-sm text-foreground truncate max-w-[80px] sm:max-w-none">
              {ethiopianCoffee.shortName}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            size="sm"
            variant={playing ? "secondary" : "default"}
            className="h-7 px-2 gap-1.5 font-display text-xs"
            onClick={() => setPlaying((p) => !p)}
            disabled={revealed >= total && !playing}
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {playing ? "Pause" : revealed >= total ? "Ended" : "Play"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 gap-1.5 font-display text-xs"
            onClick={reset}
          >
            <RotateCcw className="w-3 h-3" />
            Restart
          </Button>
          <span className="ml-auto text-[10px] text-muted-foreground font-display">
            {revealed}/{total}
          </span>
        </div>
      </div>

      {/* Event list */}
      <ol
        ref={listRef}
        className="relative max-h-[420px] overflow-y-auto px-3 sm:px-4 py-3 space-y-2"
      >
        {/* vertical rail */}
        <div className="absolute left-[44px] sm:left-[52px] top-0 bottom-0 w-px bg-border/60" aria-hidden />

        {visible.map((e, i) => {
          const meta = eventMeta(e.type);
          if (!meta) return null;
          const { Icon, label, color, bg, ring } = meta;
          const team = sideLabel(e.side);
          return (
            <li
              key={i}
              className="relative flex items-start gap-3 animate-slide-in-right"
              style={{ animationDelay: "0ms" }}
            >
              <span className="shrink-0 w-10 sm:w-12 text-right font-display font-bold text-accent text-xs sm:text-sm pt-2 tabular-nums">
                {formatMinute(e)}
              </span>
              <span
                className={`relative z-[1] shrink-0 mt-1.5 w-7 h-7 rounded-full flex items-center justify-center ring-2 ${ring} ${bg}`}
              >
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </span>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className={`font-display font-bold text-xs tracking-wider ${color}`}>
                    {label}
                  </span>
                  {team && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">
                      {team}
                    </span>
                  )}
                </div>
                {e.player && (
                  <p className="font-display font-semibold text-foreground text-sm leading-tight mt-0.5 truncate">
                    {e.type === "sub" && e.playerOff
                      ? `${e.player} ⇄ ${e.playerOff}`
                      : e.player}
                    {e.assist && (
                      <span className="text-muted-foreground font-normal">
                        {" "}· assist {e.assist}
                      </span>
                    )}
                  </p>
                )}
                {e.detail && (
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    {e.detail}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
