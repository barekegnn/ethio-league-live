export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  number: number;
  name: string;
  position: Position;
  /** Pitch coordinates in % (x: left→right, y: top→bottom). Used for starters only. */
  x?: number;
  y?: number;
}

export interface TeamLineup {
  name: string;
  shortName: string;
  primary: string; // tailwind hsl token reference (kept inline as fallback)
  formation: string;
  starters: Player[];
  subs: Player[];
}

// 4-3-3 layout coordinates for the home side (attacking upward)
export const saintGeorge: TeamLineup = {
  name: "Saint George S.C.",
  shortName: "Saint George",
  primary: "354 78% 46%",
  formation: "4-3-3",
  starters: [
    { number: 1, name: "T. Bekele", position: "GK", x: 50, y: 88 },
    { number: 2, name: "A. Hailu", position: "DF", x: 18, y: 70 },
    { number: 4, name: "S. Girma", position: "DF", x: 38, y: 72 },
    { number: 5, name: "M. Tadesse", position: "DF", x: 62, y: 72 },
    { number: 3, name: "K. Worku", position: "DF", x: 82, y: 70 },
    { number: 8, name: "D. Asrat", position: "MF", x: 28, y: 52 },
    { number: 6, name: "Y. Mengistu", position: "MF", x: 50, y: 56 },
    { number: 10, name: "B. Kebede", position: "MF", x: 72, y: 52 },
    { number: 11, name: "F. Demissie", position: "FW", x: 20, y: 30 },
    { number: 9, name: "G. Solomon", position: "FW", x: 50, y: 24 },
    { number: 7, name: "H. Abebe", position: "FW", x: 80, y: 30 },
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
  subs: [
    { number: 12, name: "B. Wolde", position: "GK" },
    { number: 14, name: "T. Haile", position: "DF" },
    { number: 15, name: "S. Ayele", position: "DF" },
    { number: 16, name: "M. Desta", position: "MF" },
    { number: 17, name: "A. Bogale", position: "MF" },
    { number: 18, name: "K. Lemma", position: "FW" },
    { number: 19, name: "F. Negash", position: "FW" },
  ],
  starters: [], // not displayed (single-team focus)
};

export const matchInfo = {
  competition: "Ethiopian Premier League",
  matchday: "Matchday 5",
  venue: "Addis Ababa Stadium",
  kickoff: "19:00 EAT",
};
