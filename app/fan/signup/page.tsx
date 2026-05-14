"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signUpFan } from "@/lib/fanAuth";
import { MOCK_LEAGUES, MOCK_CLUBS } from "@/lib/mockLeaguesClubs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2, Trophy, Users, ChevronRight, ChevronLeft } from "lucide-react";

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDot({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
      done ? "bg-primary border-primary text-primary-foreground" :
      active ? "border-primary text-primary bg-primary/10" :
      "border-border text-muted-foreground"
    )}>
      {done ? <CheckCircle2 className="w-4 h-4" /> : step}
    </div>
  );
}

// ── Selectable card ───────────────────────────────────────────────────────────
function SelectCard({
  id, name, logo, subtitle, selected, onToggle,
}: {
  id: string; name: string; logo: string; subtitle?: string;
  selected: boolean; onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all w-full",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-secondary/40"
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
        <Image src={logo} alt={name} width={40} height={40} className="object-contain" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{name}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {selected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FanSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 — personal info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState(""); // stored nowhere, purely cosmetic

  // Step 2 — favourite leagues
  const [favLeagues, setFavLeagues] = useState<string[]>([]);

  // Step 3 — favourite clubs
  const [favClubs, setFavClubs] = useState<string[]>([]);

  function toggleLeague(id: string) {
    setFavLeagues((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleClub(id: string) {
    setFavClubs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  }

  function handleSubmit() {
    signUpFan({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      preferences: {
        favouriteLeagueIds: favLeagues,
        favouriteClubIds: favClubs,
      },
    });
    router.push("/fan/welcome");
  }

  const STEPS = ["Your info", "Favourite leagues", "Favourite clubs"];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-primary-foreground font-display font-bold text-xl mb-4">
            EL
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">Join Ethio-League Live</h1>
          <p className="text-sm text-muted-foreground mt-1">Follow your favourite teams and leagues</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <StepDot step={i + 1} current={step} />
                <span className={cn(
                  "text-[10px] font-medium hidden sm:block",
                  step === i + 1 ? "text-primary" : "text-muted-foreground"
                )}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mb-4 rounded",
                  step > i + 1 ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-elevated)] p-6">

          {/* ── STEP 1: Personal info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg">Create your fan account</h2>
              <p className="text-sm text-muted-foreground">Tell us a bit about yourself</p>

              <div className="space-y-1">
                <Label htmlFor="fullName">Full name <span className="text-destructive">*</span></Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Abebe Girma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+251 9xx xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">City <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    id="city"
                    placeholder="e.g. Addis Ababa"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Favourite leagues ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Pick your leagues</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Select the leagues you want to follow. You can change this later.
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
                {MOCK_LEAGUES.map((l) => (
                  <SelectCard
                    key={l.id}
                    id={l.id}
                    name={l.name}
                    logo={l.logo}
                    subtitle={l.gender}
                    selected={favLeagues.includes(l.id)}
                    onToggle={toggleLeague}
                  />
                ))}
              </div>
              {favLeagues.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  You can skip this and add leagues later from your profile.
                </p>
              )}
            </div>
          )}

          {/* ── STEP 3: Favourite clubs ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Pick your clubs</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose the clubs you support. Your home page will highlight their matches.
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
                {MOCK_CLUBS.map((c) => (
                  <SelectCard
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    logo={c.logo}
                    subtitle={c.city}
                    selected={favClubs.includes(c.id)}
                    onToggle={toggleClub}
                  />
                ))}
              </div>
              {favClubs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  You can skip this and add clubs later from your profile.
                </p>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : (
              <Link href="/fan/login" className="text-sm text-muted-foreground hover:text-foreground">
                Already have an account?
              </Link>
            )}

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-primary">
                Create account
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          This is a fan profile — no payment or personal data is shared.
        </p>
      </div>
    </div>
  );
}
