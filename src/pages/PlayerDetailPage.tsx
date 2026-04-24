import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { playerById, clubById } from "@/data/mock";
import { ClubCrest } from "@/components/ClubCrest";
import { PlayerAvatar } from "@/components/PlayerAvatar";

const PlayerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const player = id ? playerById(id) : undefined;

  useEffect(() => {
    if (player) document.title = `${player.name} · Player profile`;
  }, [player]);

  if (!player) {
    return <div className="px-4 py-12 text-center text-muted-foreground">Player not found.</div>;
  }

  const club = clubById(player.clubId);
  const age =
    new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear();

  const stats = [
    { label: "Apps", value: player.apps },
    { label: "Goals", value: player.goals },
    { label: "Assists", value: player.assists },
    { label: "Yellow", value: player.yellow },
    { label: "Red", value: player.red },
  ];

  return (
    <div>
      <section
        className="text-white"
        style={{
          background: club
            ? `linear-gradient(135deg, hsl(${club.primaryColor}) 0%, hsl(${club.primaryColor} / 0.55) 100%)`
            : "hsl(var(--primary))",
        }}
      >
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-10 flex items-center gap-4">
          <PlayerAvatar name={player.name} photoUrl={player.photoUrl} size={80} />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider opacity-80">
              #{player.number} · {player.position}
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
              {player.name}
            </h1>
            {club && (
              <Link to={`/clubs/${club.id}`} className="inline-flex items-center gap-2 mt-2 text-sm text-white/90 hover:text-white">
                <ClubCrest clubId={club.id} size={20} /> {club.name}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center shadow-[var(--shadow-card)]">
              <div className="font-display font-bold text-2xl tabular-nums">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-display font-bold mb-2">Biography</h3>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Nationality</dt>
            <dd>{player.nationality}</dd>
            <dt className="text-muted-foreground">Date of birth</dt>
            <dd>{new Date(player.dateOfBirth).toLocaleDateString()}</dd>
            <dt className="text-muted-foreground">Age</dt>
            <dd>{age}</dd>
            <dt className="text-muted-foreground">Position</dt>
            <dd>{player.position}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailPage;
