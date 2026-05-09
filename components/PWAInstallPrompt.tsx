"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";
const DISMISSED_UNTIL_KEY = "pwa-install-dismissed-until";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Don't show if user dismissed recently (7 days)
    const dismissedUntil = localStorage.getItem(DISMISSED_UNTIL_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) return;

    // Detect iOS (Safari doesn't support beforeinstallprompt)
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after a short delay
      const timer = setTimeout(() => {
        setShow(true);
        setTimeout(() => setAnimateIn(true), 50);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome: listen for the native prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const timer = setTimeout(() => {
        setShow(true);
        setTimeout(() => setAnimateIn(true), 50);
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    dismiss();
  };

  const dismiss = (remindLater = false) => {
    setAnimateIn(false);
    setTimeout(() => setShow(false), 300);
    if (remindLater) {
      // Remind in 7 days
      localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } else {
      localStorage.setItem(DISMISSED_KEY, "true");
      localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }
  };

  if (!show || isInstalled) return null;

  return (
    <>
      {/* Backdrop — subtle, non-blocking */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${animateIn ? "opacity-100" : "opacity-0"}`}
        onClick={() => dismiss(true)}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-label="Install Ethio-League Live"
        className={`fixed bottom-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${animateIn ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="bg-card border-t border-border rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.2)] mx-auto max-w-lg">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="px-5 pb-6 pt-2 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* App icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow,142_76%_36%))] grid place-items-center text-primary-foreground font-display font-bold text-xl shadow-lg shrink-0">
                  EL
                </div>
                <div>
                  <div className="font-display font-bold text-base leading-tight">Ethio-League Live</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Ethiopian Football Hub</div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-accent" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-0.5">Free</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismiss(true)}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "⚽", label: "Live scores" },
                { icon: "📊", label: "Standings" },
                { icon: "🔔", label: "Offline" },
              ].map((f) => (
                <div key={f.label} className="bg-secondary/60 rounded-xl py-2.5 px-1">
                  <div className="text-xl mb-1">{f.icon}</div>
                  <div className="text-[10px] font-medium text-muted-foreground">{f.label}</div>
                </div>
              ))}
            </div>

            {/* iOS instructions */}
            {isIOS && (
              <div className="bg-secondary/60 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Install on your iPhone:</p>
                <ol className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold grid place-items-center shrink-0">1</span>
                    Tap the <strong className="text-foreground">Share</strong> button in Safari
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold grid place-items-center shrink-0">2</span>
                    Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold grid place-items-center shrink-0">3</span>
                    Tap <strong className="text-foreground">Add</strong> to confirm
                  </li>
                </ol>
              </div>
            )}

            {/* Action buttons */}
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => dismiss(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Got it
              </button>
            )}

            <button
              onClick={() => dismiss(true)}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
