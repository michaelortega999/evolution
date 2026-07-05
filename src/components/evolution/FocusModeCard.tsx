import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Play, Pause, RotateCcw, Target, ChevronRight, Clock } from "lucide-react";
import { useFocusTimer, formatMmSs, modeLabel } from "@/lib/use-focus-timer";
import {
  useEvolutionData, weekStartMonday, weekLogs, formatHm,
  type EvoCategory,
} from "@/lib/evolution-data";

const MODULE_COLORS: Record<EvoCategory, string> = {
  Wealth: "#00ff88", Nutrition: "#a3ff5c", Fitness: "#fb923c", Journal: "#c084fc",
  Notes: "#38bdf8", Investing: "#3b82f6", Business: "#60a5fa", Hobby: "#ff2d55",
};

export function FocusModeCard() {
  const timer = useFocusTimer();
  const { data } = useEvolutionData();
  const pct = timer.totalMs > 0 ? (timer.remainingMs / timer.totalMs) * 100 : 0;
  const accent = "#22d3ee";

  const week = useMemo(() => {
    const logs = weekLogs(data.timeLogs ?? [], weekStartMonday());
    const totalMin = logs.reduce((s, l) => s + l.minutes, 0);
    const byLabel = new Map<string, { label: string; module: EvoCategory; minutes: number }>();
    for (const l of logs) {
      const key = `${l.habitId ?? l.label}`;
      const prev = byLabel.get(key);
      if (prev) prev.minutes += l.minutes;
      else byLabel.set(key, { label: l.label, module: l.module, minutes: l.minutes });
    }
    const top = [...byLabel.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 3);
    return { totalMin, top };
  }, [data.timeLogs]);

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

      {/* Time Invested — mini */}
      <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-primary" />
            <span className="hud-label text-[9px] text-muted-foreground tracking-[0.2em]">TIME · THIS WEEK</span>
          </div>
          <span className="hud-label text-[11px] text-primary tabular-nums">{formatHm(week.totalMin)}</span>
        </div>
        {week.top.length === 0 ? (
          <div className="hud-label text-[9px] text-muted-foreground/70 italic">No time logged yet.</div>
        ) : (
          <div className="flex flex-col gap-1">
            {week.top.map((h) => {
              const color = MODULE_COLORS[h.module];
              const pctBar = week.top[0].minutes > 0 ? Math.round((h.minutes / week.top[0].minutes) * 100) : 0;
              return (
                <div key={h.label} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-foreground/85 truncate mr-2">{h.label}</span>
                    <span className="hud-label tabular-nums" style={{ color }}>{formatHm(h.minutes)}</span>
                  </div>
                  <div className="h-1 rounded bg-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${pctBar}%`, background: color, boxShadow: `0 0 4px ${color}` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link to="/focus" className="mt-3 flex items-center gap-1 text-[10px] hud-label text-primary/80 hover:text-primary w-fit">
        Open Focus <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
