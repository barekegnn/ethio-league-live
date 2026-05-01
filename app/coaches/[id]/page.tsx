"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useCoach, useCoachSeasons } from "@/lib/api/hooks/coaches";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotFoundError } from "@/lib/api/client";

function roleBadgeClass(role: string) {
  if (role === "head_coach") {
    return "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary";
  }
  return "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground";
}

export default function CoachDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: coach, isLoading, error } = useCoach(id);
  const { data: seasons, isLoading: seasonsLoading, refetch: refetchSeasons } = useCoachSeasons(id);

  if (error instanceof NotFoundError) {
    notFound();
  }

  if (isLoading) {
    return (
      <div>
        <div className="h-40 bg-secondary animate-pulse" />
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-12 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Failed to load coach.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (!coach) return null;

  const fullName = `${coach.firstName} ${coach.lastName}`;

  return (
    <div>
      {/* Hero */}
      <section
        className="text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.55) 100%)" }}
      >
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-10 flex items-center gap-4">
          <PlayerAvatar name={fullName} photoUrl={coach.photoUrl ?? undefined} size={80} />
          <div className="min-w-0">
            {coach.licenseLevel && (
              <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                {coach.licenseLevel}
              </div>
            )}
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">{fullName}</h1>
            {coach.nationality && (
              <div className="mt-2 text-sm text-white/80">{coach.nationality}</div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        <Tabs defaultValue="profile">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile" className="mt-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
              <h3 className="font-display font-bold mb-3">Profile</h3>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {coach.nationality && (
                  <>
                    <dt className="text-muted-foreground">Nationality</dt>
                    <dd>{coach.nationality}</dd>
                  </>
                )}
                {coach.licenseLevel && (
                  <>
                    <dt className="text-muted-foreground">License Level</dt>
                    <dd>{coach.licenseLevel}</dd>
                  </>
                )}
                {coach.experienceYears != null && (
                  <>
                    <dt className="text-muted-foreground">Experience</dt>
                    <dd>{coach.experienceYears} years</dd>
                  </>
                )}
                {coach.originClub && (
                  <>
                    <dt className="text-muted-foreground">Origin Club</dt>
                    <dd>
                      <Link
                        href={`/clubs/${coach.originClub.id}`}
                        className="text-primary hover:underline"
                      >
                        {coach.originClub.name}
                      </Link>
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </TabsContent>

          {/* CAREER */}
          <TabsContent value="career" className="mt-4">
            {seasonsLoading && (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
              </div>
            )}
            {!seasonsLoading && !seasons && (
              <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Failed to load career history.</p>
                <Button variant="outline" size="sm" onClick={() => refetchSeasons()}>Try again</Button>
              </div>
            )}
            {seasons && seasons.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No career history yet.</div>
            )}
            {seasons && seasons.length > 0 && (
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] divide-y divide-border">
                {seasons.map((s) => (
                  <div key={`${s.seasonId}-${s.clubId}`} className="flex items-center gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        <Link href={`/clubs/${s.clubId}`} className="hover:text-primary">
                          {s.clubName}
                        </Link>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.leagueName} · {s.seasonName}
                        {s.startDate_assignment && (
                          <span className="ml-1">
                            · {new Date(s.startDate_assignment).toLocaleDateString()}
                            {s.endDate_assignment
                              ? ` – ${new Date(s.endDate_assignment).toLocaleDateString()}`
                              : " – present"}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={roleBadgeClass(s.role)}>
                      {s.role.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
