import Link from "next/link";
import { clubs } from "@/data/mock";
import { ClubCrest } from "@/components/ClubCrest";
import { SectionHeader } from "@/components/SectionHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clubs · Ethio-League Live",
};

export default function ClubsPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader title="Clubs" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {clubs.map((c) => (
          <Link
            key={c.id}
            href={`/clubs/${c.id}`}
            className="group bg-card rounded-xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all p-4 flex flex-col items-center text-center gap-2"
          >
            <ClubCrest clubId={c.id} size={56} />
            <div className="font-display font-bold text-sm leading-tight">{c.shortName}</div>
            <div className="text-[11px] text-muted-foreground truncate w-full">{c.city}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
