"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const desktopNav = [
  { href: "/", label: "Home", exact: true },
  { href: "/matches", label: "Matches" },
  { href: "/leagues", label: "Leagues" },
  { href: "/clubs", label: "Clubs" },
  { href: "/players", label: "Players" },
  { href: "/ratings", label: "Ratings" },
  { href: "/news", label: "News" },
];

export const TopBar = () => {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] grid place-items-center text-primary-foreground font-display font-bold text-sm">
            EL
          </div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight">
            Ethio-League <span className="text-primary">Live</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {desktopNav.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Search">
            <Link href="/search">
              <Search className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};
