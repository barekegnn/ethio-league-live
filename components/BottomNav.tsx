"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, Users, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/leagues", label: "Leagues", icon: Trophy },
  { href: "/clubs", label: "Clubs", icon: Users },
  { href: "/ratings", label: "Ratings", icon: Star },
  { href: "/search", label: "Search", icon: Search },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-6">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "tap-target flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
