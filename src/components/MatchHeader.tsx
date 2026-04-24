import saintGeorgeCrest from "@/assets/saint-george-crest.png";
import ethiopianCoffeeCrest from "@/assets/ethiopian-coffee-crest.png";
import { matchInfo } from "@/data/lineup";

export const MatchHeader = () => {
  return (
    <header className="rounded-2xl border border-border/40 bg-[hsl(var(--broadcast-panel))] shadow-[var(--shadow-broadcast)] overflow-hidden animate-fade-in">
      <div className="px-4 sm:px-6 py-2 bg-gradient-to-r from-accent via-[hsl(45_95%_65%)] to-accent text-accent-foreground text-center">
        <p className="font-display font-bold text-xs sm:text-sm tracking-[0.2em] uppercase">
          {matchInfo.matchday} · {matchInfo.competition}
        </p>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8 py-5">
        {/* Home */}
        <div className="flex items-center gap-3 sm:gap-4 justify-end animate-slide-in-left">
          <div className="text-right">
            <p className="font-display font-bold text-lg sm:text-2xl text-foreground leading-tight">
              Saint George
            </p>
            <p className="text-xs text-muted-foreground">HOME · 4-3-3</p>
          </div>
          <img
            src={saintGeorgeCrest}
            alt="Saint George S.C. crest"
            width={64}
            height={64}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_8px_hsl(0_0%_0%/0.5)]"
          />
        </div>

        {/* VS */}
        <div className="flex flex-col items-center px-2 animate-scale-pop">
          <span className="font-display font-bold text-2xl sm:text-3xl text-accent text-shadow-broadcast">
            VS
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground font-display tracking-wider">
            {matchInfo.kickoff}
          </span>
        </div>

        {/* Away */}
        <div className="flex items-center gap-3 sm:gap-4 animate-slide-in-right">
          <img
            src={ethiopianCoffeeCrest}
            alt="Ethiopian Coffee S.C. crest"
            width={64}
            height={64}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_8px_hsl(0_0%_0%/0.5)]"
          />
          <div>
            <p className="font-display font-bold text-lg sm:text-2xl text-foreground leading-tight">
              Ethiopian Coffee
            </p>
            <p className="text-xs text-muted-foreground">AWAY · 4-2-3-1</p>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-1.5 bg-broadcast-bg/60 text-center border-t border-border/40">
        <p className="text-[10px] sm:text-xs text-muted-foreground font-display tracking-wider">
          {matchInfo.venue}
        </p>
      </div>
    </header>
  );
};
