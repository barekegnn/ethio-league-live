/**
 * Fan Auth — 100% frontend-only, localStorage-based.
 * No backend calls. No database. Pure mock for demo purposes.
 */

export interface FanPreferences {
  favouriteLeagueIds: string[];
  favouriteClubIds: string[];
}

export interface FanUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  preferences: FanPreferences;
  joinedAt: string; // ISO
}

const STORAGE_KEY = "fan_user";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getFanUser(): FanUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FanUser) : null;
  } catch {
    return null;
  }
}

export function saveFanUser(user: FanUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function signUpFan(data: {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  preferences: FanPreferences;
}): FanUser {
  const user: FanUser = {
    id: generateId(),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    preferences: data.preferences,
    joinedAt: new Date().toISOString(),
  };
  saveFanUser(user);
  return user;
}

export function loginFan(email: string): FanUser | null {
  const user = getFanUser();
  if (user && user.email.toLowerCase() === email.toLowerCase()) return user;
  return null;
}

export function logoutFan(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function updateFanPreferences(preferences: FanPreferences): void {
  const user = getFanUser();
  if (!user) return;
  saveFanUser({ ...user, preferences });
}
