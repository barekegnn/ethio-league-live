import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { clubs, players } from "@/data/mock";
import { ClubCrest } from "@/components/ClubCrest";

const SearchPage = () => {
  const [q, setQ] = useState("");
  useEffect(() => {
    document.title = "Search · Ethio-League Live";
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return { clubs: [], players: [] };
    return {
      clubs: clubs.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.shortName.toLowerCase().includes(s) ||
          c.city.toLowerCase().includes(s),
      ),
      players: players.filter((p) => p.name.toLowerCase().includes(s)),
    };
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clubs, players, cities..."
          className="pl-9 h-12 text-base"
        />
      </div>

      {!q && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Start typing to search across clubs and players.
        </p>
      )}

      {q && results.clubs.length === 0 && results.players.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No results for "{q}".
        </p>
      )}

      {results.clubs.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Clubs</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {results.clubs.map((c) => (
              <Link key={c.id} to={`/clubs/${c.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                <ClubCrest clubId={c.id} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.players.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Players</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {results.players.map((p) => (
              <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                <ClubCrest clubId={p.clubId} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">#{p.number} · {p.position}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;
