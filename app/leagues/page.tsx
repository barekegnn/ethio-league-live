"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLeagues } from "@/lib/api/hooks/leagues";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const tierBadge = (tier: number) =>
  tier === 1 ? "Tier 1" : tier === 2 ? "Tier 2" : "Tier 3";

const ITEMS_PER_PAGE = 12;

export default function LeaguesPage() {
  const { data: leagues, isLoading, error, refetch } = useLeagues();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter leagues based on search query
  const filteredLeagues = useMemo(() => {
    if (!leagues) return [];
    if (!searchQuery.trim()) return leagues;

    const query = searchQuery.toLowerCase();
    return leagues.filter(
      (league) =>
        league.name.toLowerCase().includes(query) ||
        league.shortName.toLowerCase().includes(query) ||
        league.season.toLowerCase().includes(query)
    );
  }, [leagues, searchQuery]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredLeagues.length / ITEMS_PER_PAGE);
  const paginatedLeagues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeagues.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeagues, currentPage]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader title="Ethiopian Leagues" />

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search leagues by name or season..."
          className="pl-9 h-11"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Failed to load leagues.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {leagues && (
        <>
          {/* Results counter */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredLeagues.length === 0
                ? "No leagues found"
                : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredLeagues.length
                  )} of ${filteredLeagues.length} league${filteredLeagues.length !== 1 ? "s" : ""}`}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paginatedLeagues.map((l) => (
              <Link
                key={l.id}
                href={`/leagues/${l.id}`}
                className="group bg-card rounded-xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] grid place-items-center text-primary-foreground shrink-0">
                  {l.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.logoUrl} alt={l.name} className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <Trophy className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {tierBadge(l.tier)} · {l.season}
                    {l.gender && ` · ${l.gender === "men" ? "Men" : "Women"}`}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
            {paginatedLeagues.length === 0 && (
              <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
                {searchQuery ? `No leagues found matching "${searchQuery}"` : "No leagues found."}
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
