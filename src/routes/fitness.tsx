import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { BarChart } from "@/components/evolution/BarChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, fitnessSummary, todayDate } from "@/lib/evolution-data";

export const Route = createFileRoute("/fitness")({
  head: () => ({
    meta: [
      { title: "Fitness — Evolution" },
      { name: "description", content: "Weekly sessions, PRs, and workout log." },
    ],
  }),
  component: FitnessPage,
});

function FitnessPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const fit = fitnessSummary(data.fitness, data.profile.gymSessionsTarget);

  const logSession = () => {
    const today = todayDate();
    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    const label = labels[new Date().getDay()];
    mutate((prev) => {
      const existing = prev.fitness.find((r) => r.date === today);
      const next = existing
        ? prev.fitness.map((r) => r.date === today ? { ...r, workouts: r.workouts + 1 } : r)
        : [...prev.fitness, { date: today, workouts: 1, label }];
      return { fitness: next };
    });
  };

  const total = data.fitness.reduce((a, r) => a + r.workouts, 0);

  return (
    <ModuleLayout number="03" title="Fitness" subtitle="Sessions · PRs · Training" icon={Dumbbell}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel title="This Week">
          <div className="hud-label text-3xl text-primary hud-glow">{fit.daysHit} / {fit.target}</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-2">Sessions completed</div>
        </Panel>
        <Panel title="All-Time">
          <div className="hud-label text-3xl text-primary hud-glow">{total}</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-2">Total workouts</div>
        </Panel>
        <Panel title="Log">
          <Button onClick={logSession} className="w-full hud-label text-[10px]">+ Log Session (Today)</Button>
        </Panel>
      </div>

      <Panel title="Weekly Activity">
        <BarChart data={fit.data.length ? fit.data : [0]} labels={fit.labels} height={200} />
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Personal Records">
          <div className="space-y-3">
            {([["bench", "Bench", data.profile.bench],
               ["squat", "Squat", data.profile.squat],
               ["deadlift", "Deadlift", data.profile.deadlift]] as const).map(([key, label, v]) => (
              <label key={key} className="block">
                <span className="hud-label text-[10px] text-muted-foreground">{label} (lbs)</span>
                <Input type="number" value={v} onChange={(e) => updateProfile({ [key]: Number(e.target.value) || 0 } as any)} className="h-9 text-xs mt-1" />
              </label>
            ))}
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Weekly target</span>
              <Input type="number" value={data.profile.gymSessionsTarget} onChange={(e) => updateProfile({ gymSessionsTarget: Number(e.target.value) || 0 })} className="h-9 text-xs mt-1" />
            </label>
          </div>
        </Panel>

        <Panel title="History">
          <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
            {[...data.fitness].reverse().map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="hud-label text-[10px] text-muted-foreground">{e.date}</span>
                <span className="hud-label text-xs text-primary">{e.workouts} session{e.workouts === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </ModuleLayout>
  );
}
