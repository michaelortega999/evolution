import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { useEvolutionData } from "@/lib/evolution-data";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Evolution" }] }),
  component: ReportsPage,
});

type Range = "week" | "month";

function ReportsPage() {
  const { data } = useEvolutionData();
  const [range, setRange] = useState<Range>("week");
  const days = range === "week" ? 7 : 30;

  const nutritionRows = data.nutrition.slice(-days);
  const fitnessRows = data.fitness.slice(-days);
  const investingRows = data.investing.slice(-days);

  const avgCals = nutritionRows.length
    ? Math.round(nutritionRows.reduce((s, r) => s + r.calories, 0) / nutritionRows.length) : 0;
  const avgProt = nutritionRows.length
    ? Math.round(nutritionRows.reduce((s, r) => s + (r.protein ?? 0), 0) / nutritionRows.length) : 0;

  const sessions = fitnessRows.reduce((s, r) => s + r.workouts, 0);
  const totalVolume = sessions * 12500; // synthetic estimate

  const trades = investingRows.length;
  const pnl = investingRows.length >= 2
    ? investingRows[investingRows.length - 1].value - investingRows[0].value : 0;
  const wins = investingRows.filter((r, i) => i > 0 && r.value > investingRows[i - 1].value).length;
  const winRate = trades > 1 ? Math.round((wins / (trades - 1)) * 100) : 0;

  const journalCount = data.journal.length;
  const notesCount = data.notes.length;

  const summary = useMemo(() => ({
    range,
    generatedAt: new Date().toISOString(),
    trading: { trades, pnl, winRate },
    nutrition: { avgCalories: avgCals, avgProtein: avgProt },
    fitness: { sessions, totalVolume },
    journal: { entries: journalCount },
    notes: { ideas: notesCount },
  }), [range, trades, pnl, winRate, avgCals, avgProt, sessions, totalVolume, journalCount, notesCount]);

  function exportReport() {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-report-${range}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ModuleLayout number="" title="Reports" subtitle="Performance summary across modules" icon={BarChart3}>
      <Panel title="RANGE">
        <div className="flex items-center gap-2 flex-wrap">
          {(["week", "month"] as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-2 hud-label text-[10px] border rounded ${range === r ? "border-primary text-primary bg-primary/15 hud-glow" : "border-border text-foreground/70 hover:bg-primary/5"}`}>
              {r === "week" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
          <button onClick={exportReport}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary text-primary hud-label text-[10px] rounded hover:bg-primary/25">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </Panel>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Panel title="TRADING">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="P&L" value={`${pnl >= 0 ? "+" : ""}$${pnl.toLocaleString()}`} accent={pnl >= 0} />
            <Stat label="Trades" value={String(trades)} />
            <Stat label="Win Rate" value={`${winRate}%`} />
          </div>
          <Sparkline data={investingRows.map((r) => r.value)} />
        </Panel>

        <Panel title="NUTRITION">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Stat label="Avg Cals" value={`${avgCals}`} />
            <Stat label="Avg Protein" value={`${avgProt}g`} />
          </div>
          <Sparkline data={nutritionRows.map((r) => r.calories)} />
        </Panel>

        <Panel title="FITNESS">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Stat label="Sessions" value={String(sessions)} />
            <Stat label="Volume" value={`${(totalVolume / 1000).toFixed(1)}k`} />
          </div>
          <Sparkline data={fitnessRows.map((r) => r.workouts * 100)} />
        </Panel>

        <Panel title="JOURNAL">
          <Stat label="Entries" value={String(journalCount)} />
          <p className="text-xs text-muted-foreground mt-3">Total journal entries logged.</p>
        </Panel>

        <Panel title="NOTES">
          <Stat label="Ideas Captured" value={String(notesCount)} />
          <p className="text-xs text-muted-foreground mt-3">Notes saved on the dashboard.</p>
        </Panel>

        <Panel title="GOALS">
          <Stat label="Active" value={String((data.goals ?? []).filter((g) => !g.completed).length)} />
          <Stat label="Completed" value={String((data.goals ?? []).filter((g) => g.completed).length)} />
        </Panel>
      </section>
    </ModuleLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-border rounded p-3 bg-primary/5">
      <div className="hud-label text-[9px] text-muted-foreground">{label}</div>
      <div className={`hud-label text-lg ${accent ? "text-primary hud-glow" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
