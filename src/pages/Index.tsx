import { useEffect, useState } from "react";
import { MatchHeader } from "@/components/MatchHeader";
import { Pitch } from "@/components/Pitch";
import { SubstitutesList } from "@/components/SubstitutesList";
import { saintGeorge, ethiopianCoffee } from "@/data/lineup";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const Index = () => {
  const [runId, setRunId] = useState(0);

  // Set page title for SEO
  useEffect(() => {
    document.title = "Saint George vs Ethiopian Coffee – Lineup | Matchday 5";
    const meta = document.querySelector('meta[name="description"]');
    const desc =
      "Live broadcast lineup: Saint George vs Ethiopian Coffee, Matchday 5 of the Ethiopian Premier League. Starting XI and substitutes.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <main className="min-h-screen broadcast-bg">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <h1 className="sr-only">
          Saint George vs Ethiopian Coffee – Ethiopian Premier League Matchday 5 Lineup
        </h1>

        <MatchHeader key={`hdr-${runId}`} />

        <div key={runId} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
          {/* Pitch */}
          <section aria-label="Starting eleven on the pitch">
            <Pitch starters={saintGeorge.starters} />
          </section>

          {/* Subs panel */}
          <aside aria-label="Substitutes" className="space-y-4 sm:space-y-6">
            <SubstitutesList
              subs={saintGeorge.subs}
              initialDelay={2400}
              stagger={130}
            />
            <SubstitutesList
              subs={ethiopianCoffee.subs}
              initialDelay={3400}
              stagger={130}
            />
          </aside>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            onClick={() => setRunId((n) => n + 1)}
            className="gap-2 font-display"
          >
            <RotateCcw className="w-4 h-4" />
            Replay Animation
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Index;
