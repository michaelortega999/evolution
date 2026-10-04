import { localISO } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";
import { useMemo } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { useEvolutionData, todayDate, dayTotals } from "@/lib/evolution-data";
import { useSelectedMonth, MONTH_LABELS } from "@/lib/use-selected-month";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Evolution" }, { name: "description", content: "Reports module of Evolution OS." }, { property: "og:title", content: "Reports — Evolution" }, { property: "og:description", content: "Reports module of Evolution OS." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useEvolutionData();
  const { year: selYear, month: selMonth, key: selMonthKey } = useSelectedMonth();

  // Selected month bounds
  const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
  const days = daysInMonth;
  const since = `${selMonthKey}-01`;
  const until = `${selMonthKey}-${String(daysInMonth).padStart(2, "0")}`;
  const sinceMs = new Date(since).getTime();
  const untilMs = new Date(until).getTime() + 86_400_000;

  const inMonth = (d: string) => d >= since && d <= until;
  const dayIso = (i: number) => `${selMonthKey}-${String(i + 1).padStart(2, "0")}`;

  // ----- Trading (real trades) -----
  const trades = data.trades.filter((t) => inMonth(t.date));
  const tradePnl = trades.reduce((a, t) => a + t.pnl, 0);
  const wins = trades.filter((t) => t.pnl > 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;
  const pnlByDay = new Map<string, number>();
  trades.forEach((t) => pnlByDay.set(t.date, (pnlByDay.get(t.date) ?? 0) + t.pnl));
  let bestDay = 0, worstDay = 0;
  pnlByDay.forEach((v) => { if (v > bestDay) bestDay = v; if (v < worstDay) worstDay = v; });
  const tradeSeries = Array.from({ length: days }, (_, i) => pnlByDay.get(dayIso(i)) ?? 0);

  // ----- Nutrition (mealLogs) -----
  const dayKeys = Array.from({ length: days }, (_, i) => dayIso(i));
  const calsPerDay = dayKeys.map((d) => dayTotals(d, data.mealLogs).kcal);
  const proteinPerDay = dayKeys.map((d) => dayTotals(d, data.mealLogs).p);
  const loggedDays = calsPerDay.filter((c) => c > 0);
  const avgCals = loggedDays.length ? Math.round(loggedDays.reduce((a, b) => a + b, 0) / loggedDays.length) : 0;
  const avgProt = loggedDays.length ? Math.round(proteinPerDay.filter((_, i) => calsPerDay[i] > 0).reduce((a, b) => a + b, 0) / loggedDays.length) : 0;
  const calTarget = data.profile.calorieTarget || 2000;
  const daysHitGoal = calsPerDay.filter((c) => c >= calTarget * 0.85 && c <= calTarget * 1.05).length;

  // ----- Fitness (workouts + fitness rows) -----
  const workoutLogs = data.workouts.filter((w) => inMonth(w.date));
  const sessions = workoutCount(data.fitness, data.workouts, inMonth);
  const totalVolume = workoutLogs.reduce((a, w) => a + w.durationMin * 100, 0);
  const prsThisMonth = data.prHistory.filter((p) => inMonth(p.date)).length;

  // ----- Journal -----
  const journalEntries = data.journalEntries.filter((e) => inMonth(e.date)).length
    + data.journal.filter((e) => inMonth(e.date)).length;
  const moodCounts: Record<string, number> = {};
  data.journalEntries.filter((e) => inMonth(e.date)).forEach((e) => { moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // ----- Focus -----
  const focus = data.focusSessions.filter((s) => s.completedAt >= sinceMs && s.completedAt < untilMs);
  const focusHours = Math.round((focus.reduce((a, s) => a + s.durationSec, 0) / 3600) * 10) / 10;
  const focusCount = focus.length;
  const focusByDay = new Map<string, number>();
  focus.forEach((s) => {
    const k = localISO(new Date(s.completedAt));
    focusByDay.set(k, (focusByDay.get(k) ?? 0) + s.durationSec);
  });
  let mostFocusedDay = "—"; let mostFocusedSec = 0;
  focusByDay.forEach((v, k) => { if (v > mostFocusedSec) { mostFocusedSec = v; mostFocusedDay = k; } });

  // ----- Business -----
  const monthRevenue = data.revenue.filter((r) => r.date.startsWith(selMonthKey)).reduce((a, r) => a + r.amount, 0);
  const projectsCompleted = data.projects.filter((p) => p.status === "Completed").length;

  const summary = useMemo(() => ({
    month: selMonthKey, generatedAt: new Date().toISOString(),
    trading: { trades: trades.length, pnl: tradePnl, winRate, bestDay, worstDay },
    nutrition: { avgCalories: avgCals, avgProtein: avgProt, daysHitGoal },
    fitness: { sessions, totalVolume, prsThisMonth },
    journal: { entries: journalEntries, topMood },
    focus: { hours: focusHours, sessions: focusCount, mostFocusedDay },
    business: { monthRevenue, projectsCompleted },
  }), [selMonthKey, trades.length, tradePnl, winRate, bestDay, worstDay, avgCals, avgProt, daysHitGoal, sessions, totalVolume, prsThisMonth, journalEntries, topMood, focusHours, focusCount, mostFocusedDay, monthRevenue, projectsCompleted]);

  function exportReport() {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-report-${selMonthKey}-${todayDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ModuleLayout number="" title="Reports" subtitle="Performance summary across modules" icon={BarChart3}>
      <Panel title="RANGE">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-4 py-2 hud-label text-[10px] border border-primary text-primary bg-primary/15 hud-glow rounded">
            {MONTH_LABELS[selMonth]} {selYear} · {daysInMonth} DAYS
          </div>
          <div className="hud-label text-[10px] text-muted-foreground">
            Change month on the dashboard selector
          </div>
          <button onClick={exportReport}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary text-primary hud-label text-[10px] rounded hover:bg-primary/25">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </Panel>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Panel title="TRADING">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="P&L" value={`${tradePnl >= 0 ? "+" : ""}$${tradePnl.toLocaleString()}`} accent={tradePnl >= 0} />
            <Stat label="Trades" value={String(trades.length)} />
            <Stat label="Win Rate" value={`${winRate}%`} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Stat label="Best Day" value={`+$${bestDay.toLocaleString()}`} />
            <Stat label="Worst Day" value={`$${worstDay.toLocaleString()}`} />
          </div>
          <Sparkline data={tradeSeries.length ? tradeSeries : [0]} />
        </Panel>

        <Panel title="NUTRITION">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Avg Cals" value={`${avgCals}`} />
            <Stat label="Avg Protein" value={`${avgProt}g`} />
            <Stat label="On Goal" value={`${daysHitGoal}d`} />
          </div>
          <Sparkline data={calsPerDay.length ? calsPerDay : [0]} />
        </Panel>

        <Panel title="FITNESS">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Sessions" value={String(sessions)} />
            <Stat label="Volume" value={`${(totalVolume / 1000).toFixed(1)}k`} />
            <Stat label="PRs/mo" value={String(prsThisMonth)} />
          </div>
        </Panel>

        <Panel title="JOURNAL">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Entries" value={String(journalEntries)} />
            <Stat label="Top Mood" value={topMood} />
          </div>
        </Panel>

        <Panel title="FOCUS">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Hours" value={`${focusHours}h`} />
            <Stat label="Sessions" value={String(focusCount)} />
            <Stat label="Best Day" value={mostFocusedDay.slice(5) || "—"} />
          </div>
        </Panel>

        <Panel title="BUSINESS">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Revenue (mo)" value={`$${monthRevenue.toLocaleString()}`} accent />
            <Stat label="Completed" value={String(projectsCompleted)} />
          </div>
        </Panel>
      </section>
    </ModuleLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-border rounded p-3 bg-primary/5">
      <div className="hud-label text-[9px] text-muted-foreground">{label}</div>
      <div className={`hud-label text-lg ${accent ? "text-primary hud-glow" : "text-foreground"} truncate`}>{value}</div>
    </div>
  );
}
