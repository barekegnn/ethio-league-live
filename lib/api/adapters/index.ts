/**
 * Adapter layer — pure functions that map Fan API response shapes to
 * the frontend's internal TypeScript types (defined in data/types.ts).
 *
 * This is the ONLY place in the codebase that knows about the backend
 * wire format. Pages and components only ever see frontend types.
 */

import type {
  League,
  LeagueTier,
  LeagueGender,
  Club,
  PlayerProfile,
  PlayerPosition,
  Match,
  MatchStatus,
  MatchEventLite,
  StandingsRow,
} from "@/data/types";

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/** Clamp divisionLevel to a valid LeagueTier (1 | 2 | 3) */
function clampTier(level: number | null | undefined): LeagueTier {
  if (!level || level <= 1) return 1;
  if (level >= 3) return 3;
  return 2;
}

/** Map backend genderCategory to frontend LeagueGender */
function mapGender(g: string | null | undefined): LeagueGender {
  if (g === "female") return "women";
  if (g === "male") return "men";
  return "men"; // default for null / unrecognized
}

/** Map backend ageCategory to frontend ageGroup */
function mapAgeGroup(
  a: string | null | undefined
): "senior" | "u21" | "u20" | "u17" | undefined {
  if (!a) return undefined;
  const lower = a.toLowerCase();
  if (lower === "senior") return "senior";
  if (lower === "u21") return "u21";
  if (lower === "u20") return "u20";
  if (lower === "u17") return "u17";
  return "senior";
}

/** Map backend eventType.name to frontend MatchEventLite type */
function mapEventType(
  name: string | null | undefined
): MatchEventLite["type"] {
  switch (name?.toLowerCase()) {
    case "goal":
      return "goal";
    case "yellow":
    case "yellow_card":
      return "yellow";
    case "red":
    case "red_card":
      return "red";
    case "sub":
    case "substitution":
      return "sub";
    case "var":
      return "var";
    default:
      return "info";
  }
}

/** Map backend position code to frontend PlayerPosition */
function mapPosition(code: string | null | undefined): PlayerPosition {
  switch (code?.toUpperCase()) {
    case "GK":
      return "GK";
    // All defender variants → DF
    case "CB":
    case "RB":
    case "LB":
    case "RWB":
    case "LWB":
    case "DF":
      return "DF";
    // All midfielder variants → MF
    case "CDM":
    case "CM":
    case "CAM":
    case "LM":
    case "RM":
    case "MF":
      return "MF";
    // All forward/winger variants → FW
    case "LW":
    case "RW":
    case "ST":
    case "CF":
    case "SS":
    case "FW":
      return "FW";
    default:
      return "MF"; // safe default
  }
}

/** Null/empty string → undefined for optional URL fields */
function nullToUndefined(v: string | null | undefined): string | undefined {
  return v ?? undefined;
}

/** Combine firstName + lastName into a single display name */
function fullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
}

// ---------------------------------------------------------------------------
// League adapters
// ---------------------------------------------------------------------------

/** Raw backend league list item */
export interface RawLeague {
  id: string;
  name: string;
  shortName?: string | null;
  divisionLevel?: number | null;
  genderCategory?: string | null;
  ageCategory?: string | null;
  logoUrl?: string | null;
  status?: string | null;
  organization?: { id: string; name: string; logoUrl?: string | null } | null;
  leagueType?: { id: number; name: string } | null;
  seasons?: Array<{ id: string; name: string; status: string }> | null;
  _count?: { seasons?: number; clubs?: number } | null;
}

export function adaptLeague(raw: RawLeague): League {
  // Derive a short name: use provided shortName, or abbreviate the name
  const shortName =
    raw.shortName ||
    raw.name
      .split(" ")
      .filter(w => w.length > 2)
      .map(w => w[0].toUpperCase())
      .join("") ||
    raw.name.split(" ")[0];

  // Derive current season name from the most recent season if available
  // The league list endpoint doesn't include seasons; the detail endpoint does.
  const latestSeason = raw.seasons?.[0];
  const seasonName = latestSeason?.name ?? "2024/25";

  return {
    id: raw.id,
    name: raw.name,
    shortName,
    tier: clampTier(raw.divisionLevel),
    country: "Ethiopia",
    logoUrl: nullToUndefined(raw.logoUrl),
    season: seasonName,
    gender: mapGender(raw.genderCategory),
    ageGroup: mapAgeGroup(raw.ageCategory),
  };
}

/** Alias — league detail has the same shape for our purposes */
export const adaptLeagueDetail = adaptLeague;

// ---------------------------------------------------------------------------
// Season adapters
// ---------------------------------------------------------------------------

/** Raw backend standings row */
export interface RawStandingsRow {
  rank: number;
  clubId: string;
  clubName?: string | null;
  logoUrl?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference?: number | null;
  points: number;
  highlight?: boolean;
}

export function adaptSeasonStandingsRow(raw: RawStandingsRow): StandingsRow {
  return {
    clubId: raw.clubId,
    clubName: raw.clubName ?? undefined,
    clubLogo: nullToUndefined(raw.logoUrl),
    position: raw.rank,
    played: raw.played,
    wins: raw.won,
    draws: raw.drawn,
    losses: raw.lost,
    goalsFor: raw.goalsFor,
    goalsAgainst: raw.goalsAgainst,
    points: raw.points,
    form: [], // backend does not provide form; default to empty
  };
}

/** Raw backend season match item */
export interface RawSeasonMatch {
  id: string;
  matchDate?: string | null;
  roundNumber?: number | null;
  status?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeClub?: { id: string; name: string; logoUrl?: string | null } | null;
  awayClub?: { id: string; name: string; logoUrl?: string | null } | null;
  homeClubId?: string | null;
  awayClubId?: string | null;
  stadium?: { id: string; name: string; city?: string | null } | null;
  season?: { id: string; name: string } | null;
  seasonId?: string | null;
  attendance?: number | null;
}

export function adaptSeasonMatch(raw: RawSeasonMatch): Match {
  return {
    id: raw.id,
    leagueId: raw.seasonId ?? raw.season?.id ?? "",
    matchday: raw.roundNumber ?? 0,
    kickoff: raw.matchDate ?? new Date().toISOString(),
    status: (raw.status as MatchStatus) ?? "scheduled",
    homeId: raw.homeClubId ?? raw.homeClub?.id ?? "",
    awayId: raw.awayClubId ?? raw.awayClub?.id ?? "",
    homeScore: raw.homeScore ?? 0,
    awayScore: raw.awayScore ?? 0,
    stadium: raw.stadium?.name ?? "",
    attendance: raw.attendance ?? undefined,
    homeClubName: raw.homeClub?.name ?? undefined,
    awayClubName: raw.awayClub?.name ?? undefined,
    homeClubLogo: nullToUndefined(raw.homeClub?.logoUrl),
    awayClubLogo: nullToUndefined(raw.awayClub?.logoUrl),
  };
}

// ---------------------------------------------------------------------------
// Club adapters
// ---------------------------------------------------------------------------

/** Raw backend club list item */
export interface RawClub {
  id: string;
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  country?: string | null;
  foundedYear?: number | null;
  primaryStadium?: { id: string; name: string; capacity?: number | null } | null;
  league?: { id: string; name: string } | null;
  _count?: { seasonClubs?: number } | null;
  description?: string | null;
}

export function adaptClub(raw: RawClub): Club {
  return {
    id: raw.id,
    name: raw.name,
    shortName: raw.shortName || raw.name,
    city: raw.city ?? "Ethiopia",
    founded: raw.foundedYear ?? 0,
    stadium: raw.primaryStadium?.name ?? "",
    capacity: raw.primaryStadium?.capacity ?? 0,
    leagueId: raw.league?.id ?? "",
    logoUrl: nullToUndefined(raw.logoUrl),
    primaryColor: "220 60% 40%", // default color; backend doesn't provide this
    description: raw.description ?? undefined,
  };
}

/** Raw backend club detail (superset of list item) */
export interface RawClubDetail extends RawClub {
  currentSeason?: {
    seasonId: string;
    seasonName: string;
    seasonStatus: string;
    squad?: unknown[];
    coaches?: unknown[];
  } | null;
  currentStanding?: {
    rank: number;
    played: number;
    won: number;
    points: number;
    seasonName: string;
  } | null;
  rating?: { score: number; computedAt: string } | null;
}

export function adaptClubDetail(raw: RawClubDetail): Club {
  return adaptClub(raw);
}

// ---------------------------------------------------------------------------
// Player adapters
// ---------------------------------------------------------------------------

/** Raw backend player list item */
export interface RawPlayer {
  playerId?: string | null;
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  nationality?: string | null;
  jerseyNumber?: number | null;
  position?: { id: number; name: string; code: string } | null;
  club?: { id: string; name: string; logoUrl?: string | null } | null;
  clubId?: string | null;
}

export function adaptPlayer(raw: RawPlayer): PlayerProfile {
  return {
    id: raw.playerId ?? raw.id ?? "",
    name: fullName(raw.firstName, raw.lastName),
    number: raw.jerseyNumber ?? 0,
    position: mapPosition(raw.position?.code),
    clubId: raw.club?.id ?? raw.clubId ?? "",
    nationality: raw.nationality ?? "Ethiopian",
    dateOfBirth: "",
    photoUrl: nullToUndefined(raw.photoUrl),
    goals: 0,
    assists: 0,
    apps: 0,
    yellow: 0,
    red: 0,
  };
}

/** Raw backend player detail */
export interface RawPlayerDetail {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  preferredFoot?: string | null;
  photoUrl?: string | null;
  primaryPosition?: { id: number; name: string; code: string } | null;
  currentClub?: { id: string; name: string; logoUrl?: string | null } | null;
  currentJerseyNumber?: number | null;
  rating?: { score: number; computedAt: string } | null;
}

export function adaptPlayerDetail(raw: RawPlayerDetail): PlayerProfile {
  return {
    id: raw.id,
    name: fullName(raw.firstName, raw.lastName),
    number: raw.currentJerseyNumber ?? 0,
    position: mapPosition(raw.primaryPosition?.code),
    clubId: raw.currentClub?.id ?? "",
    nationality: raw.nationality ?? "Ethiopian",
    dateOfBirth: raw.dateOfBirth ?? "",
    height: raw.heightCm ?? undefined,
    weight: raw.weightKg ?? undefined,
    photoUrl: nullToUndefined(raw.photoUrl),
    goals: 0,
    assists: 0,
    apps: 0,
    yellow: 0,
    red: 0,
  };
}

// ---------------------------------------------------------------------------
// Match adapters
// ---------------------------------------------------------------------------

/** Raw backend match detail */
export interface RawMatch {
  id: string;
  matchDate?: string | null;
  roundNumber?: number | null;
  status?: string | null;
  liveStartedAt?: string | null; // ISO timestamp when match went live
  homeScore?: number | null;
  awayScore?: number | null;
  attendance?: number | null;
  homeClub?: { id: string; name: string; logoUrl?: string | null } | null;
  awayClub?: { id: string; name: string; logoUrl?: string | null } | null;
  homeClubId?: string | null;
  awayClubId?: string | null;
  stadium?: { id: string; name: string; city?: string | null } | null;
  season?: { id: string; name: string; league?: { id: string; name: string } | null } | null;
  seasonId?: string | null;
}

export function adaptMatch(raw: RawMatch): Match {
  return {
    id: raw.id,
    leagueId:
      raw.season?.league?.id ?? raw.seasonId ?? raw.season?.id ?? "",
    matchday: raw.roundNumber ?? 0,
    kickoff: raw.matchDate ?? new Date().toISOString(),
    status: (raw.status as MatchStatus) ?? "scheduled",
    liveStartedAt: raw.liveStartedAt ?? null,
    homeId: raw.homeClubId ?? raw.homeClub?.id ?? "",
    awayId: raw.awayClubId ?? raw.awayClub?.id ?? "",
    homeScore: raw.homeScore ?? 0,
    awayScore: raw.awayScore ?? 0,
    stadium: raw.stadium?.name ?? "",
    attendance: raw.attendance ?? undefined,
    homeClubName: raw.homeClub?.name ?? undefined,
    awayClubName: raw.awayClub?.name ?? undefined,
    homeClubLogo: nullToUndefined(raw.homeClub?.logoUrl),
    awayClubLogo: nullToUndefined(raw.awayClub?.logoUrl),
    leagueName: raw.season?.league?.name ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Match event adapter
// ---------------------------------------------------------------------------

/** Raw backend match event */
export interface RawMatchEvent {
  id?: string | null;
  minute?: number | null;
  extraTime?: number | null;
  eventType?: { id: number; name: string } | null;
  player?: { id: string; firstName?: string | null; lastName?: string | null; photoUrl?: string | null } | null;
  relatedPlayer?: { id: string; firstName?: string | null; lastName?: string | null } | null;
  club?: { id: string; name: string; logoUrl?: string | null } | null;
}

export function adaptMatchEvent(raw: RawMatchEvent): MatchEventLite {
  return {
    minute: raw.minute ?? 0,
    type: mapEventType(raw.eventType?.name),
    clubId: raw.club?.id ?? "",
    player: fullName(raw.player?.firstName, raw.player?.lastName),
    detail: raw.relatedPlayer
      ? fullName(raw.relatedPlayer.firstName, raw.relatedPlayer.lastName)
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Search result adapter
// ---------------------------------------------------------------------------

export interface RawSearchResult {
  query: string;
  leagues?: RawLeague[];
  clubs?: RawClub[];
  players?: RawPlayer[];
  coaches?: unknown[];
  matches?: RawMatch[];
}

export interface AdaptedSearchResult {
  query: string;
  leagues: League[];
  clubs: Club[];
  players: PlayerProfile[];
}

export function adaptSearchResult(raw: RawSearchResult): AdaptedSearchResult {
  return {
    query: raw.query,
    leagues: (raw.leagues ?? []).map(adaptLeague),
    clubs: (raw.clubs ?? []).map(adaptClub),
    players: (raw.players ?? []).map(adaptPlayer),
  };
}
