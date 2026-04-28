import { useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useFocusTimer } from "@/lib/use-focus-timer";

export function FocusNotification() {
  const timer = useFocusTimer();

  useEffect(() => {
    if (!timer.notification) return;
    const id = window.setTimeout(() => timer.clearNotification(), 12000);
    return () => window.clearTimeout(id);
  }, [timer.notification, timer]);

  if (!timer.notification) return null;
  const n = timer.notification;
  const isFocusDone = n.mode === "focus";
  const title = isFocusDone ? "Session complete." : "Break over.";
  const subtitle = isFocusDone
    ? `Time for a break · ${Math.round(n.durationSec / 60)} min logged.`
    : "Ready to focus?";

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2">
      <div
        className="hud-card p-4 pr-3 flex items-start gap-3 max-w-sm"
        style={{
          boxShadow:
            "0 0 24px color-mix(in oklab, var(--glow) 60%, transparent), 0 0 60px color-mix(in oklab, var(--glow) 25%, transparent)",
        }}
      >
        <div className="h-9 w-9 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center text-primary">
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="hud-label text-sm text-primary hud-glow">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
          <div className="flex gap-2 mt-2">
            {!isFocusDone && (
              <button
                onClick={() => { timer.start(); timer.clearNotification(); }}
                className="hud-label text-[10px] px-3 py-1 rounded border border-primary/40 text-primary hover:bg-primary/10"
              >
                Start Focus
              </button>
            )}
            <Link
              to="/focus"
              onClick={() => timer.clearNotification()}
              className="hud-label text-[10px] px-3 py-1 rounded border border-border text-foreground/70 hover:text-primary hover:border-primary/40"
            >
              Open
            </Link>
          </div>
        </div>
        <button
          onClick={() => timer.clearNotification()}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
