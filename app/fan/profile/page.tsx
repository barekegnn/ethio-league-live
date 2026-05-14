"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getFanUser,
  logoutFan,
  updateFanPreferences,
  type FanUser,
} from "@/lib/fanAuth";
import { MOCK_LEAGUES, MOCK_CLUBS } from "@/lib/mockLeaguesClubs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Users,
  LogOut,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Pencil,
} from "lucide-react";

function SelectCard({
  id, name, logo, subtitle, selected, onToggle,
}: {
  id: string; name: string; logo: string; subtitle?: string;
  selected: boolean; onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all w-full",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-secondary/40"
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
        <Image src={logo} alt={name} width={36} height={36} className="object-contain" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{name}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {selected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
    </button>
  );
}

export default function FanProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<FanUser | null>(null);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [favLeagues, setFavLeagues] = useState<string[]>([]);
  const [favClubs, setFavClubs] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getFanUser();
    if (!u) { router.replace("/fan/login"); return; }
    setUser(u);
    setFavLeagues(u.preferences.favouriteLeagueIds);
    setFavClubs(u.preferences.favouriteClubIds);
  }, [router]);

  function toggleLeague(id: string) {
    setFavLeagues((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleClub(id: string) {
    setFavClubs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function savePreferences() {
    updateFanPreferences({ favouriteLeagueIds: favLeagues, favouriteClubIds: favClubs });
    setUser(getFanUser());
    setEditingPrefs(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleLogout() {
    logoutFan();
    router.push("/");
  }

  if (!user) return null;

  const myLeagues = MOCK_LEAGUES.filter((l) => user.preferences.favouriteLeagueIds.includes(l.id));
  const myClubs = MOCK_CLUBS.filter((c) => user.preferences.favouriteClubIds.includes(c.id));

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-6 py-6 space-y-5">

      {/* Profile header */}
      <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-xl truncate">{user.fullName}</h1>
            <p className="text-sm text-muted-foreground">Fan member</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
              {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</span>}
              {user.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.city}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out" className="shrink-0 text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Saved confirmation */}
      {saved && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-primary font-medium">
          <CheckCircle2 className="w-4 h-4" /> Preferences saved!
        </div>
      )}

      {/* Preferences section */}
      <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base">My preferences</h2>
          {!editingPrefs && (
            <Button variant="outline" size="sm" onClick={() => setEditingPrefs(true)}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>

        {!editingPrefs ? (
          <>
            {/* View mode */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Trophy className="w-4 h-4" /> Favourite leagues
              </div>
              {myLeagues.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {myLeagues.map((l) => (
                    <div key={l.id} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 text-xs font-medium">
                      <Image src={l.logo} alt={l.name} width={16} height={16} className="object-contain" unoptimized />
                      {l.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No favourite leagues selected yet.</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Users className="w-4 h-4" /> Favourite clubs
              </div>
              {myClubs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {myClubs.map((c) => (
                    <div key={c.id} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 text-xs font-medium">
                      <Image src={c.logo} alt={c.name} width={16} height={16} className="object-contain" unoptimized />
                      {c.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No favourite clubs selected yet.</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Edit mode */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="w-4 h-4 text-primary" /> Leagues
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {MOCK_LEAGUES.map((l) => (
                  <SelectCard
                    key={l.id} id={l.id} name={l.name} logo={l.logo}
                    subtitle={l.gender} selected={favLeagues.includes(l.id)}
                    onToggle={toggleLeague}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="w-4 h-4 text-primary" /> Clubs
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {MOCK_CLUBS.map((c) => (
                  <SelectCard
                    key={c.id} id={c.id} name={c.name} logo={c.logo}
                    subtitle={c.city} selected={favClubs.includes(c.id)}
                    onToggle={toggleClub}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={savePreferences}>Save preferences</Button>
              <Button variant="outline" onClick={() => {
                setFavLeagues(user.preferences.favouriteLeagueIds);
                setFavClubs(user.preferences.favouriteClubIds);
                setEditingPrefs(false);
              }}>Cancel</Button>
            </div>
          </>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-5 space-y-2">
        <h2 className="font-display font-bold text-base mb-3">Quick links</h2>
        {myLeagues.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Your leagues</p>
            {myLeagues.map((l) => (
              <Link key={l.id} href="/leagues" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <Image src={l.logo} alt={l.name} width={24} height={24} className="object-contain" unoptimized />
                <span className="text-sm font-medium">{l.name}</span>
              </Link>
            ))}
          </div>
        )}
        {myClubs.length > 0 && (
          <div className="space-y-1 mt-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Your clubs</p>
            {myClubs.map((c) => (
              <Link key={c.id} href="/clubs" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <Image src={c.logo} alt={c.name} width={24} height={24} className="object-contain" unoptimized />
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{c.city}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" /> Sign out
      </Button>
    </div>
  );
}
