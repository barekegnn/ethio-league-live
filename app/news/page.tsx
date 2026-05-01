import { NEWS_FALLBACK } from "@/lib/staticNews";
import { SectionHeader } from "@/components/SectionHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News · Ethio-League Live",
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <SectionHeader
        title="News & announcements"
        action={
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-0.5 rounded bg-secondary">
            Sample news
          </span>
        }
      />
      <div className="space-y-3">
        {NEWS_FALLBACK.map((n) => (
          <article key={n.id} className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
            <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">{n.category}</div>
            <h3 className="font-display font-bold text-lg leading-snug mb-1">{n.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
            <time className="block mt-2 text-xs text-muted-foreground">
              {new Date(n.publishedAt).toLocaleString()}
            </time>
          </article>
        ))}
      </div>
    </div>
  );
}
