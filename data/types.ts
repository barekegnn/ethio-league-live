export type LeagueTier = 1 | 2 | 3;

export type LeagueGender = "men" | "women" | "mixed";

export interface League {
  id: string;
  name: string;
  shortName: string;
  tier: LeagueTier;
  country: string;
  logoUrl?: string;
  season: string; // e.g. "2024/25"
  gender?: LeagueGender;
  ageGroup?: "senior" | "u21" | "u20" | "u17";
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  city: string;
  founded: number;
  stadium: string;
  capacity: number;
  leagueId: string;
  logoUrl?: string;
  primaryColor: string; // hsl string e.g. "354 78% 46%"
  description?: string;
}

export type PlayerPosition = "GK" | "DF" | "MF" | "FW";

export interface PlayerProfile {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  clubId: string;
  nationality: string;
  dateOfBirth: string; // ISO
  height?: number;
  weight?: number;
  photoUrl?: string;
  goals: number;
  assists: number;
  apps: number;
  yellow: number;
  red: number;
}

export type MatchStatus = "scheduled" | "live" | "completed" | "postponed";

export interface MatchEventLite {
  minute: number;
  type: "goal" | "yellow" | "red" | "sub" | "var" | "info";
  clubId: string;
  player: string;
  detail?: string;
}

export interface Match {
  id: string;
  leagueId: string;
  matchday: number;
  kickoff: string; // ISO
  status: MatchStatus;
  minute?: number; // if live
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  stadium: string;
  events?: MatchEventLite[];
  attendance?: number;
  // Club display names from the API (optional — not present in mock data)
  homeClubName?: string;
  awayClubName?: string;
  homeClubLogo?: string;
  awayClubLogo?: string;
}

export interface StandingsRow {
  clubId: string;
  clubName?: string;   // display name from API
  clubLogo?: string;   // logo URL from API
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
}
