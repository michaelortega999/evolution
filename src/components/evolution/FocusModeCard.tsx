import { Link } from "@tanstack/react-router";
import { Play, Pause, RotateCcw, Target, ChevronRight } from "lucide-react";
import { useFocusTimer, formatMmSs, modeLabel } from "@/lib/use-focus-timer";

export function FocusModeCard() {
  const timer = useFocusTimer();
  const pct = timer.totalMs > 0 ? (timer.remainingMs / timer.totalMs) * 100 : 0;
  const accent = "#22d3ee";

  return (
    <div className="hud-card hud-scan p-5 flex flex-col relative">
      <Link to="/focus" className="flex items-center gap-3 mb-4 group/header">
        <div
          className="h-10 w-10 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: accent,
            background: `radial-gradient(circle, ${accent}22, transparent 70%)`,
            boxShadow: `0 0 10px ${accent}80`,
          }}
        >
          <Target className="h-4 w-4" style={{ color: accent }} />
        </div>
        <span className="hud-label text-xs text-muted-foreground">09</span>
        <h3 className="hud-label text-sm" style={{ color: accent, textShadow: `0 0 10px ${accent}66` }}>
          Focus Mode
        </h3>
      </Link>

      <div className="hud-label text-[10px] text-muted-foreground">{modeLabel(timer.mode)}</div>
      <div className="hud-label text-4xl text-primary hud-glow my-1 tabular-nums tracking-wider">
        {formatMmSs(timer.remainingMs)}
      </div>
      {timer.task && (
        <div className="hud-label text-[10px] text-muted-foreground truncate">
          ▸ {timer.task}{timer.tag && <span className="ml-1 text-accent">#{timer.tag}</span>}
        </div>
      )}

      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--primary)" }}
        />
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => (timer.running ? timer.pause() : timer.start())}
          className="flex-1 h-9 rounded-md border border-primary/40 text-primary hud-label text-[10px] hover:bg-primary/10 flex items-center justify-center gap-1"
        >
          {timer.running ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Start</>}
        </button>
        <button
          onClick={() => timer.reset()}
          className="h-9 px-3 rounded-md border border-border text-muted-foreground hud-label text-[10px] hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      <Link to="/focus" className="mt-3 flex items-center gap-1 text-[10px] hud-label text-primary/80 hover:text-primary w-fit">
        Open Focus <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
