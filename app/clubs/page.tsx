"use client";

import Link from "next/link";
import { useClubs } from "@/lib/api/hooks/clubs";
import { ClubCrest } from "@/components/ClubCrest";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ClubsPage() {
  const { data: clubs, isLoading, error, refetch } = useClubs();

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader title="Clubs" />

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Failed to load clubs.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {clubs && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {clubs.map((c) => (
            <Link
              key={c.id}
              href={`/clubs/${c.id}`}
              className="group bg-card rounded-xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all p-4 flex flex-col items-center text-center gap-2"
            >
              <ClubCrest clubId={c.id} logoUrl={c.logoUrl} size={56} />
              <div className="font-display font-bold text-sm leading-tight">{c.shortName}</div>
              <div className="text-[11px] text-muted-foreground truncate w-full">{c.city}</div>
            </Link>
          ))}
          {clubs.length === 0 && (
            <div className="col-span-4 text-center text-sm text-muted-foreground py-8">
              No clubs found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
