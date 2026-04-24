export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  number: number;
  name: string;
  position: Position;
  /** Optional real player headshot URL or imported asset path. Falls back to initials avatar. */
  photoUrl?: string;
  /** Optional manual pitch coordinates (%). When omitted, auto-formation layout is used. */
  x?: number;
  y?: number;
}

export type Formation =
  | "4-3-3"
  | "4-4-2"
  | "4-2-3-1"
  | "3-5-2"
  | "3-4-3"
  | "5-3-2";

export interface TeamLineup {
  name: string;
  shortName: string;
  primary: string;
  formation: Formation;
  starters: Player[];
  subs: Player[];
}

/* ---------------------------------------------------------------------------
 * Auto-formation engine
 * Generates pitch coordinates (x%, y%) based on a formation string + positions.
 * The team always attacks "upward" on screen (GK at the bottom).
 * ------------------------------------------------------------------------- */

interface FormationLine {
  /** y position from top in % (lower y = closer to opponent goal) */
  y: number;
  /** count of players on this line */
  count: number;
  /** which slice of starters (by position) feeds this line */
  position: Position;
}

const FORMATION_LINES: Record<Formation, FormationLine[]> = {
  "4-3-3": [
    { y: 88, count: 1, position: "GK" },
    { y: 70, count: 4, position: "DF" },
    { y: 52, count: 3, position: "MF" },
    { y: 28, count: 3, position: "FW" },
  ],
  "4-4-2": [
    { y: 88, count: 1, position: "GK" },
    { y: 70, count: 4, position: "DF" },
    { y: 50, count: 4, position: "MF" },
    { y: 28, count: 2, position: "FW" },
  ],
  "4-2-3-1": [
    { y: 88, count: 1, position: "GK" },
    { y: 70, count: 4, position: "DF" },
    { y: 56, count: 2, position: "MF" },
    { y: 40, count: 3, position: "MF" },
    { y: 22, count: 1, position: "FW" },
  ],
  "3-5-2": [
    { y: 88, count: 1, position: "GK" },
    { y: 72, count: 3, position: "DF" },
    { y: 50, count: 5, position: "MF" },
    { y: 28, count: 2, position: "FW" },
  ],
  "3-4-3": [
    { y: 88, count: 1, position: "GK" },
    { y: 72, count: 3, position: "DF" },
    { y: 52, count: 4, position: "MF" },
    { y: 28, count: 3, position: "FW" },
  ],
  "5-3-2": [
    { y: 88, count: 1, position: "GK" },
    { y: 70, count: 5, position: "DF" },
    { y: 50, count: 3, position: "MF" },
    { y: 28, count: 2, position: "FW" },
  ],
};

/** Distributes `count` players evenly across the pitch width, with side margins. */
const xPositions = (count: number): number[] => {
  if (count === 1) return [50];
  const margin = count >= 5 ? 8 : count === 4 ? 14 : count === 3 ? 20 : 28;
  const span = 100 - margin * 2;
  const step = span / (count - 1);
  return Array.from({ length: count }, (_, i) => margin + step * i);
};

/**
 * Returns starters with `x` and `y` populated based on the formation.
 * If a player already has explicit x/y, those are preserved.
 * For "4-2-3-1" (and similar) we split MFs across two lines in declared order.
 */
export const applyFormation = (team: TeamLineup): Player[] => {
  const lines = FORMATION_LINES[team.formation];
  if (!lines) return team.starters;

  // Group starters by position (preserving their declared order)
  const byPos: Record<Position, Player[]> = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of team.starters) byPos[p.position].push(p);

  // Track how many of each position have been consumed across lines
  const consumed: Record<Position, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };

  const positioned: Player[] = [];

  for (const line of lines) {
    const xs = xPositions(line.count);
    const pool = byPos[line.position];
    for (let i = 0; i < line.count; i++) {
      const p = pool[consumed[line.position]++];
      if (!p) continue;
      positioned.push({
        ...p,
        x: p.x ?? xs[i],
        y: p.y ?? line.y,
      });
    }
  }

  // Append any leftover starters that didn't fit (safety net)
  const placedIds = new Set(positioned.map((p) => `${p.number}-${p.name}`));
  for (const p of team.starters) {
    if (!placedIds.has(`${p.number}-${p.name}`)) positioned.push(p);
  }

  return positioned;
};

/* ---------------------------------------------------------------------------
 * Lineups
 * Real player photos can be added by setting `photoUrl` on any player.
 * Photos can be: imported assets, /public paths, or remote URLs.
 * ------------------------------------------------------------------------- */

export const saintGeorge: TeamLineup = {
  name: "Saint George S.C.",
  shortName: "Saint George",
  primary: "354 78% 46%",
  formation: "4-3-3",
  starters: [
    { number: 1, name: "T. Bekele", position: "GK" },
    { number: 2, name: "A. Hailu", position: "DF" },
    { number: 4, name: "S. Girma", position: "DF" },
    { number: 5, name: "M. Tadesse", position: "DF" },
    { number: 3, name: "K. Worku", position: "DF" },
    { number: 8, name: "D. Asrat", position: "MF" },
    { number: 6, name: "Y. Mengistu", position: "MF" },
    { number: 10, name: "B. Kebede", position: "MF" },
    { number: 11, name: "F. Demissie", position: "FW" },
    { number: 9, name: "G. Solomon", position: "FW" },
    { number: 7, name: "H. Abebe", position: "FW" },
  ],
  subs: [
    { number: 13, name: "N. Tesfaye", position: "GK" },
    { number: 14, name: "R. Alemu", position: "DF" },
    { number: 15, name: "M. Yohannes", position: "DF" },
    { number: 16, name: "A. Bekele", position: "MF" },
    { number: 17, name: "S. Tadele", position: "MF" },
    { number: 18, name: "E. Girma", position: "FW" },
    { number: 19, name: "D. Mulugeta", position: "FW" },
  ],
};

export const ethiopianCoffee: TeamLineup = {
  name: "Ethiopian Coffee S.C.",
  shortName: "Ethiopian Coffee",
  primary: "30 65% 28%",
  formation: "4-2-3-1",
  starters: [
    { number: 1, name: "B. Wolde", position: "GK" },
    { number: 2, name: "T. Haile", position: "DF" },
    { number: 4, name: "S. Ayele", position: "DF" },
    { number: 5, name: "Y. Tesfaye", position: "DF" },
    { number: 3, name: "K. Mekonnen", position: "DF" },
    { number: 6, name: "M. Desta", position: "MF" }, // CDM
    { number: 8, name: "A. Bogale", position: "MF" }, // CDM
    { number: 11, name: "K. Lemma", position: "MF" }, // LW
    { number: 10, name: "D. Tilahun", position: "MF" }, // CAM
    { number: 7, name: "F. Negash", position: "MF" }, // RW
    { number: 9, name: "S. Mulu", position: "FW" }, // ST
  ],
  subs: [
    { number: 12, name: "B. Assefa", position: "GK" },
    { number: 14, name: "T. Gebre", position: "DF" },
    { number: 15, name: "S. Belay", position: "DF" },
    { number: 16, name: "M. Hailu", position: "MF" },
    { number: 17, name: "A. Tariku", position: "MF" },
    { number: 18, name: "K. Demeke", position: "FW" },
    { number: 19, name: "F. Worku", position: "FW" },
  ],
};

export const matchInfo = {
  competition: "Ethiopian Premier League",
  matchday: "Matchday 5",
  venue: "Addis Ababa Stadium",
  kickoff: "19:00 EAT",
};

/* ---------------------------------------------------------------------------
 * Match Timeline
 * ------------------------------------------------------------------------- */

export type EventType = "goal" | "yellow" | "red" | "sub" | "kickoff" | "halftime" | "fulltime" | "var";
export type Side = "home" | "away";

export interface MatchEvent {
  /** Match minute (0–90+). Use 0 for kickoff, 45 for halftime, 90 for fulltime. */
  minute: number;
  /** Optional stoppage time (e.g. 45+2). */
  stoppage?: number;
  type: EventType;
  side?: Side;
  player?: string;
  /** For substitutions: who came off. */
  playerOff?: string;
  /** Optional assist credit for goals. */
  assist?: string;
  detail?: string;
}

export const matchEvents: MatchEvent[] = [
  { minute: 0, type: "kickoff", detail: "Match underway at Addis Ababa Stadium" },
  { minute: 12, type: "yellow", side: "away", player: "M. Desta", detail: "Tactical foul" },
  { minute: 23, type: "goal", side: "home", player: "G. Solomon", assist: "B. Kebede", detail: "Header from a corner" },
  { minute: 34, type: "yellow", side: "home", player: "A. Hailu" },
  { minute: 41, type: "goal", side: "away", player: "S. Mulu", assist: "D. Tilahun", detail: "Counter-attack finish" },
  { minute: 45, stoppage: 2, type: "halftime", detail: "Honours even at the break" },
  { minute: 52, type: "var", side: "home", detail: "VAR check — penalty awarded" },
  { minute: 54, type: "goal", side: "home", player: "B. Kebede", detail: "Penalty, bottom corner" },
  { minute: 63, type: "sub", side: "away", player: "K. Demeke", playerOff: "S. Mulu" },
  { minute: 71, type: "red", side: "away", player: "T. Haile", detail: "Second yellow" },
  { minute: 78, type: "sub", side: "home", player: "E. Girma", playerOff: "F. Demissie" },
  { minute: 86, type: "goal", side: "home", player: "H. Abebe", assist: "E. Girma", detail: "Curled into the top corner" },
  { minute: 90, stoppage: 4, type: "fulltime", detail: "Saint George take all three points" },
];
