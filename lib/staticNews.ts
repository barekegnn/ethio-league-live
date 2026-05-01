/**
 * Static news fallback — used until the backend exposes a news endpoint.
 * To replace with live data: swap NEWS_FALLBACK with a useQuery hook
 * in the consuming components (home page, news page). No other files
 * need to change.
 */

import type { NewsItem } from "@/data/types";

export const NEWS_FALLBACK: NewsItem[] = [
  {
    id: "static-1",
    title: "Ethiopian Premier League season underway",
    excerpt:
      "The new Ethiopian Premier League season has kicked off with exciting fixtures across the country. Clubs are battling for top honours.",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "League",
  },
  {
    id: "static-2",
    title: "Top clubs prepare for crucial matchday",
    excerpt:
      "Several title contenders face tough away fixtures this weekend as the race for the championship heats up.",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Match Preview",
  },
  {
    id: "static-3",
    title: "Young talents shine in Ethiopian football",
    excerpt:
      "A new generation of Ethiopian players is making its mark, with several under-21 stars earning call-ups to the senior national team.",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Players",
  },
  {
    id: "static-4",
    title: "Stadium upgrades boost matchday experience",
    excerpt:
      "Several venues across Ethiopia have completed renovation works, improving facilities for fans attending league matches.",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Infrastructure",
  },
];
