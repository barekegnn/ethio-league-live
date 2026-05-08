export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center space-y-6">
      <div className="text-6xl">📡</div>
      <h1 className="font-display text-2xl font-bold tracking-tight">You&apos;re offline</h1>
      <p className="text-muted-foreground leading-relaxed">
        No internet connection detected. Check your network and try again — live scores and match data will be available once you&apos;re back online.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
