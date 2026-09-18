import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Play, Pause, RotateCcw, Target, Clock, FileText,
} from "lucide-react";
import { Sidebar } from "@/components/evolution/Sidebar";
import { Input } from "@/components/ui/input";
import {
  useEvolutionData, FOCUS_TAGS,
  weekStartMonday, weekDaysMonSun, weekLogs, formatHm, WEEKDAY_LABELS,
  type FocusMode, type FocusTag, type EvoCategory,
} from "@/lib/evolution-data";
import {
  useFocusTimer, formatMmSs, modeLabel,
  focusStatsToday, focusWeeklyMinutes, focusStreak,
} from "@/lib/use-focus-timer";

const MODULE_COLORS: Record<EvoCategory, string> = {
  Wealth:    "#00ff88",
  Nutrition: "#a3ff5c",
  Fitness:   "#fb923c",
  Journal:   "#c084fc",
  Notes:     "#38bdf8",
  Investing: "#3b82f6",
  Business:  "#60a5fa",
  Hobby:     "#ff2d55",
};
const MODULES: EvoCategory[] = ["Wealth", "Nutrition", "Fitness", "Journal", "Notes", "Investing", "Business", "Hobby"];


export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Mode — Evolution" },
      { name: "description", content: "Pomodoro-style focus timer with session tracking, weekly stats, and streaks." },
    ],
  }),
  component: FocusPage,
});

function FocusPage() {
  const { data } = useEvolutionData();
  const timer = useFocusTimer();
  const [editing, setEditing] = useState<null | FocusMode>(null);
  const [editVal, setEditVal] = useState("");

  const stats = focusStatsToday(data.focusSessions);
  const weekly = focusWeeklyMinutes(data.focusSessions);
  const streak = focusStreak(data.focusSessions);
  const weeklyMax = Math.max(1, ...weekly.map((w) => w.minutes));

  // ---- Time Invested This Week (combines habit + focus TimeLogs) ----
  const timeWeek = useMemo(() => {
    const start = weekStartMonday();
    const days = weekDaysMonSun(start);
    const logs = weekLogs(data.timeLogs ?? [], start);
    const totalMin = logs.reduce((s, l) => s + l.minutes, 0);
    const byModule: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    const byLabel: { label: string; module: EvoCategory; minutes: number; hasTime: boolean }[] = [];
    const labelIndex = new Map<string, number>();
    for (const l of logs) {
      byModule[l.module] = (byModule[l.module] ?? 0) + l.minutes;
      byDay[l.date] = (byDay[l.date] ?? 0) + l.minutes;
      const key = `${l.source}::${l.habitId ?? l.label}`;
      const existing = labelIndex.get(key);
      if (existing != null) byLabel[existing].minutes += l.minutes;
      else {
        labelIndex.set(key, byLabel.length);
        byLabel.push({ label: l.label, module: l.module, minutes: l.minutes, hasTime: true });
      }
    }
    byLabel.sort((a, b) => b.minutes - a.minutes);
    const moduleMax = Math.max(1, ...Object.values(byModule));
    const dayMax = Math.max(1, ...days.map((d) => byDay[d] ?? 0));
    return { totalMin, byModule, byDay, byLabel, days, moduleMax, dayMax };
  }, [data.timeLogs]);

  const ringPct = timer.totalMs > 0 ? (timer.remainingMs / timer.totalMs) * 100 : 0;


  const startEdit = (mode: FocusMode) => {
    setEditing(mode);
    setEditVal(String(
      mode === "focus" ? timer.settings.focusMin :
      mode === "short" ? timer.settings.shortMin : timer.settings.longMin
    ));
  };
  const commitEdit = () => {
    if (editing == null) return;
    const v = Math.max(1, Math.min(180, Math.round(Number(editVal) || 0)));
    const key = editing === "focus" ? "focusMin" : editing === "short" ? "shortMin" : "longMin";
    timer.updateSettings({ [key]: v });
    setEditing(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>

        <main className="order-1 lg:order-2 flex flex-col gap-6 min-w-0">
          {/* Header */}
          <div className="hud-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <h1 className="hud-label text-lg text-foreground">Focus Mode</h1>
                <div className="hud-label text-[10px] text-muted-foreground">Deep work, measured.</div>
              </div>
            </div>
            <Link to="/" className="hud-label text-[10px] text-primary hover:underline">← Dashboard</Link>
          </div>

          {/* Top: timer */}
          <section className="hud-card p-6 md:p-8 flex flex-col items-center gap-5">
            {/* mode tabs */}
            <div className="flex gap-2">
              {(["focus", "short", "long"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => timer.setMode(m)}
                  className={`hud-label text-[11px] px-4 py-1.5 rounded border transition-colors ${
                    timer.mode === m
                      ? "border-primary/60 bg-primary/15 text-primary hud-glow"
                      : "border-border text-foreground/70 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {m === "focus" ? "Focus" : m === "short" ? "Short Break" : "Long Break"}
                </button>
              ))}
            </div>

            {/* current task label */}
            {timer.task && (
              <div className="hud-label text-xs text-muted-foreground">
                <span className="text-primary">▸</span> {timer.task}
                {timer.tag && <span className="ml-2 text-accent">#{timer.tag}</span>}
              </div>
            )}

            {/* Holographic ring */}
            <div className="relative" style={{ width: 320, height: 320 }}>
              {/* orbital backdrop */}
              <div className="absolute inset-0 holo-jarvis" style={{ width: "100%", height: "100%", top: 0, right: 0 }}>
                <div className="holo-j-base" />
                <div className="holo-j-base holo-j-base--inner" />
                <div className="holo-j-orbit holo-j-orbit--1" />
                <div className="holo-j-orbit holo-j-orbit--2" />
                <div className="holo-j-orbit holo-j-orbit--3" />
                <div className="holo-j-scan" />
              </div>

              {/* progress ring */}
              <FocusRing pct={ringPct} size={320} />

              {/* center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="hud-label text-primary hud-glow text-6xl tabular-nums tracking-wider">
                  {formatMmSs(timer.remainingMs)}
                </div>
                <div className="hud-label text-[11px] text-muted-foreground mt-2">
                  {modeLabel(timer.mode).toUpperCase()}
                </div>
                <div className="hud-label text-[10px] text-primary/80 mt-1">
                  Round {timer.round} · long break every {timer.settings.longEvery}
                </div>
              </div>
            </div>

            {/* duration controls (click to edit) */}
            <div className="flex items-center gap-3 text-xs">
              {(["focus", "short", "long"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => startEdit(m)}
                  className="hud-label text-[10px] text-muted-foreground hover:text-primary border border-dashed border-border rounded px-2 py-1"
                >
                  {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}:{" "}
                  <span className="text-primary">
                    {m === "focus" ? timer.settings.focusMin : m === "short" ? timer.settings.shortMin : timer.settings.longMin}m
                  </span>
                </button>
              ))}
            </div>

            {editing && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                  autoFocus
                  className="h-8 w-20 text-xs"
                />
                <button onClick={commitEdit} className="h-8 px-3 rounded border border-primary/40 text-primary hud-label text-[10px] hover:bg-primary/10">Save</button>
                <button onClick={() => setEditing(null)} className="h-8 px-3 rounded border border-border text-muted-foreground hud-label text-[10px] hover:text-foreground">Cancel</button>
              </div>
            )}

            {/* main controls: Pause / Start / Restart */}
            <div className="flex gap-3">
              <button
                onClick={() => timer.pause()}
                disabled={!timer.running}
                className="h-11 px-6 rounded-md border border-border text-foreground/80 hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center gap-2 disabled:opacity-40 disabled:hover:text-foreground/80 disabled:hover:border-border"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button
                onClick={() => timer.start()}
                disabled={timer.running}
                className="h-11 px-6 rounded-md border border-primary/60 bg-primary/15 text-primary hud-label text-xs hover:bg-primary/25 flex items-center gap-2 hud-glow disabled:opacity-40 disabled:hover:bg-primary/15"
              >
                <Play className="h-4 w-4" /> Start
              </button>
              <button
                onClick={() => timer.reset()}
                className="h-11 px-5 rounded-md border border-border text-foreground/80 hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Restart
              </button>
              <button
                onClick={() => timer.logSession()}
                className="h-11 px-5 rounded-md border border-border text-foreground/80 hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" /> Log Session
              </button>
            </div>
          </section>

          {/* Middle: current session */}
          <section className="hud-card p-5 flex flex-col gap-4">
            <div className="hud-label text-xs text-muted-foreground">Current Session</div>
            <Input
              value={timer.task}
              onChange={(e) => timer.setTask(e.target.value)}
              placeholder="What are you working on?"
              className="h-10 text-sm"
            />
            <div>
              <div className="hud-label text-[10px] text-muted-foreground mb-2">Tag a category</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => timer.setTag(null)}
                  className={`hud-label text-[10px] px-3 py-1.5 rounded border transition-colors ${
                    timer.tag === null
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border text-foreground/70 hover:border-primary/40"
                  }`}
                >
                  None
                </button>
                {FOCUS_TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => timer.setTag(t as FocusTag)}
                    className={`hud-label text-[10px] px-3 py-1.5 rounded border transition-colors ${
                      timer.tag === t
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border text-foreground/70 hover:border-primary/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom: stats grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard label="Total Today" value={formatHrs(stats.totalSec)} />
            <StatCard label="Sessions" value={String(stats.count)} />
            <StatCard label="Longest Today" value={stats.longest ? formatHrs(stats.longest) : "—"} />
            <StatCard label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} />
          </section>

          {/* Weekly chart */}
          <section className="hud-card p-5">
            <div className="hud-label text-xs text-muted-foreground mb-3">Past 7 days · focus minutes</div>
            <div className="flex items-end justify-between gap-2 h-40">
              {weekly.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="hud-label text-[9px] text-primary tabular-nums">{w.minutes}</div>
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${(w.minutes / weeklyMax) * 100}%`,
                      minHeight: 4,
                      background: "linear-gradient(180deg, var(--primary), color-mix(in oklab, var(--primary) 40%, transparent))",
                      boxShadow: "0 0 8px color-mix(in oklab, var(--glow) 60%, transparent)",
                    }}
                  />
                  <div className="hud-label text-[9px] text-muted-foreground">{w.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Time Invested This Week */}
          <section className="hud-card p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div className="hud-label text-xs text-foreground">TIME INVESTED THIS WEEK</div>
              </div>
              <div className="hud-label text-2xl text-primary hud-glow tabular-nums">{formatHm(timeWeek.totalMin)}</div>
            </div>

            {timeWeek.totalMin === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No time logged yet — check off a time-tracked habit or finish a Focus session.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Habits list */}
                <div className="flex flex-col gap-2">
                  <div className="hud-label text-[10px] text-muted-foreground">BY ACTIVITY</div>
                  {timeWeek.byLabel.slice(0, 8).map((h) => {
                    const color = MODULE_COLORS[h.module];
                    const pct = Math.round((h.minutes / Math.max(1, timeWeek.byLabel[0].minutes)) * 100);
                    return (
                      <div key={h.label + h.module} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground/90 truncate mr-2">{h.label}</span>
                          <span className="hud-label tabular-nums" style={{ color }}>{formatHm(h.minutes)}</span>
                        </div>
                        <div className="h-1.5 rounded bg-muted overflow-hidden">
                          <div className="h-full transition-all"
                               style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Category chart */}
                <div className="flex flex-col gap-2">
                  <div className="hud-label text-[10px] text-muted-foreground">BY MODULE</div>
                  {MODULES.map((m) => {
                    const mins = timeWeek.byModule[m] ?? 0;
                    if (mins === 0) return null;
                    const color = MODULE_COLORS[m];
                    const pct = Math.round((mins / timeWeek.moduleMax) * 100);
                    return (
                      <div key={m} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="hud-label" style={{ color }}>{m}</span>
                          <span className="hud-label tabular-nums text-foreground/80">{formatHm(mins)}</span>
                        </div>
                        <div className="h-2 rounded bg-muted overflow-hidden">
                          <div className="h-full transition-all"
                               style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily breakdown */}
            <div className="flex flex-col gap-2">
              <div className="hud-label text-[10px] text-muted-foreground">DAILY</div>
              <div className="flex items-end justify-between gap-2 h-24">
                {timeWeek.days.map((d, i) => {
                  const mins = timeWeek.byDay[d] ?? 0;
                  const pct = Math.round((mins / timeWeek.dayMax) * 100);
                  const isToday = d === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="hud-label text-[9px] text-primary tabular-nums">{mins > 0 ? formatHm(mins) : "—"}</div>
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: `${pct}%`,
                          minHeight: 3,
                          background: mins > 0
                            ? "linear-gradient(180deg, var(--primary), color-mix(in oklab, var(--primary) 40%, transparent))"
                            : "color-mix(in oklab, var(--primary) 15%, transparent)",
                          boxShadow: mins > 0 ? "0 0 8px color-mix(in oklab, var(--glow) 60%, transparent)" : undefined,
                        }}
                      />
                      <div className={`hud-label text-[9px] ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {WEEKDAY_LABELS[i]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>



          {/* Session log */}
          <section className="hud-card p-5">
            <div className="hud-label text-xs text-muted-foreground mb-3">Today's Sessions</div>
            {stats.todays.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">No sessions yet — hit Start to begin.</div>
            ) : (
              <ul className="divide-y divide-border">
                {[...stats.todays].reverse().map((s) => (
                  <li key={s.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground truncate">{s.task}</div>
                      <div className="hud-label text-[9px] text-muted-foreground mt-0.5">
                        {new Date(s.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {s.tag && <span className="ml-2 text-accent">#{s.tag}</span>}
                      </div>
                    </div>
                    <div className="hud-label text-primary tabular-nums">{Math.round(s.durationSec / 60)}m</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="hud-card p-5">
      <div className="hud-label text-[10px] text-muted-foreground">{label}</div>
      <div className="hud-label text-2xl text-primary hud-glow mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function FocusRing({ pct, size }: { pct: number; size: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in oklab, var(--primary) 25%, transparent)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        style={{
          filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--glow) 80%, transparent))",
          transition: "stroke-dasharray 0.4s linear",
        }}
      />
    </svg>
  );
}

function formatHrs(sec: number) {
  if (sec === 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

