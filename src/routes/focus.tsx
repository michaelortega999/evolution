import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Play, Pause, RotateCcw, Target,
} from "lucide-react";
import { Sidebar } from "@/components/evolution/Sidebar";
import { Input } from "@/components/ui/input";
import { useEvolutionData, FOCUS_TAGS, type FocusMode, type FocusTag } from "@/lib/evolution-data";
import {
  useFocusTimer, formatMmSs, modeLabel,
  focusStatsToday, focusWeeklyMinutes, focusStreak,
} from "@/lib/use-focus-timer";

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
        <div className="lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>

        <main className="flex flex-col gap-6 min-w-0">
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

            {/* main controls */}
            <div className="flex gap-3">
              <button
                onClick={() => (timer.running ? timer.pause() : timer.start())}
                className="h-11 px-6 rounded-md border border-primary/60 bg-primary/15 text-primary hud-label text-xs hover:bg-primary/25 flex items-center gap-2 hud-glow"
              >
                {timer.running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
              </button>
              <button
                onClick={() => timer.reset()}
                className="h-11 px-5 rounded-md border border-border text-foreground/80 hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Reset
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

