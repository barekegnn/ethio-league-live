"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFanUser } from "@/lib/fanAuth";
import { MOCK_LEAGUES, MOCK_CLUBS } from "@/lib/mockLeaguesClubs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Users } from "lucide-react";

export default function FanWelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [favLeagues, setFavLeagues] = useState<typeof MOCK_LEAGUES>([]);
  const [favClubs, setFavClubs] = useState<typeof MOCK_CLUBS>([]);

  useEffect(() => {
    const user = getFanUser();
    if (!user) { router.replace("/fan/signup"); return; }
    setName(user.fullName.split(" ")[0]);
    setFavLeagues(MOCK_LEAGUES.filter((l) => user.preferences.favouriteLeagueIds.includes(l.id)));
    setFavClubs(MOCK_CLUBS.filter((c) => user.preferences.favouriteClubIds.includes(c.id)));
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center space-y-6">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            Welcome, {name}! 🎉
          </h1>
          <p className="text-muted-foreground mt-2">
            Your fan account is ready. You&apos;re all set to follow Ethiopian football.
          </p>
        </div>

        {/* Selected leagues */}
        {favLeagues.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Trophy className="w-4 h-4 text-primary" /> Your leagues
            </div>
            <div className="flex flex-wrap gap-2">
              {favLeagues.map((l) => (
                <div key={l.id} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1 text-xs font-medium">
                  <Image src={l.logo} alt={l.name} width={16} height={16} className="object-contain" unoptimized />
                  {l.shortName}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected clubs */}
        {favClubs.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="w-4 h-4 text-primary" /> Your clubs
            </div>
            <div className="flex flex-wrap gap-2">
              {favClubs.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1 text-xs font-medium">
                  <Image src={c.logo} alt={c.name} width={16} height={16} className="object-contain" unoptimized />
                  {c.shortName}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/">Go to home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/fan/profile">View my profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
