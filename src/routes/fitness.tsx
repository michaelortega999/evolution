import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Dumbbell, Trash2, Plus } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { BarChart } from "@/components/evolution/BarChart";
import { Sparkline } from "@/components/evolution/Sparkline";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useEvolutionData, fitnessSummary, todayDate, uid,
  type WorkoutType, type StressLevel, type PRLift,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/fitness")({
  head: () => ({
    meta: [
      { title: "Fitness — Evolution" },
      { name: "description", content: "Workouts, PRs, recovery, and progress charts." },
    ],
  }),
  component: FitnessPage,
});

const WORKOUT_TYPES: WorkoutType[] = ["Push", "Pull", "Legs", "Cardio", "Full Body"];
const STRESS: StressLevel[] = ["Low", "Medium", "High"];

function FitnessPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const fit = fitnessSummary(data.fitness, data.profile.gymSessionsTarget);
  const total = data.fitness.reduce((a, r) => a + r.workouts, 0);

  // Log session modal
  const [logOpen, setLogOpen] = useState(false);
  const [wType, setWType] = useState<WorkoutType>("Push");
  const [wDur, setWDur] = useState("60");
  const [wNotes, setWNotes] = useState("");

  const submitSession = () => {
    const today = todayDate();
    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    const label = labels[new Date().getDay()];
    mutate((prev) => {
      const existing = prev.fitness.find((r) => r.date === today);
      const fitnessNext = existing
        ? prev.fitness.map((r) => r.date === today ? { ...r, workouts: r.workouts + 1 } : r)
        : [...prev.fitness, { date: today, workouts: 1, label }];
      return {
        fitness: fitnessNext,
        workouts: [...prev.workouts, {
          id: uid(), date: today, type: wType,
          durationMin: Number(wDur) || 0, notes: wNotes.trim() || undefined,
        }],
      };
    });
    setWDur("60"); setWNotes("");
    setLogOpen(false);
  };

  const deleteWorkout = (id: string) => {
    mutate((prev) => ({ workouts: prev.workouts.filter((w) => w.id !== id) }));
  };

  // PRs
  const [prDraft, setPrDraft] = useState({ bench: "", squat: "", deadlift: "" });
  const updatePR = (lift: PRLift) => {
    const v = Number(prDraft[lift]);
    if (!v) return;
    updateProfile({ [lift]: v } as Partial<typeof data.profile>);
    mutate((prev) => ({ prHistory: [...prev.prHistory, { id: uid(), date: todayDate(), lift, weight: v }] }));
    setPrDraft((p) => ({ ...p, [lift]: "" }));
  };

  // Recovery
  const [sleep, setSleep] = useState("7.5");
  const [stress, setStress] = useState<StressLevel>("Low");
  const lastRecovery = data.recovery.at(-1);
  const recoveryScore = useMemo(() => {
    if (!lastRecovery) return 0;
    const sleepScore = Math.min(100, (lastRecovery.sleepHours / 8) * 60);
    const stressScore = lastRecovery.stress === "Low" ? 40 : lastRecovery.stress === "Medium" ? 25 : 10;
    return Math.round(sleepScore + stressScore);
  }, [lastRecovery]);
  const logRecovery = () => {
    mutate((prev) => ({
      recovery: [...prev.recovery, { id: uid(), date: todayDate(), sleepHours: Number(sleep) || 0, stress }],
    }));
  };

  // PR progress data
  const prSeries = (lift: PRLift) => {
    const arr = data.prHistory.filter((p) => p.lift === lift).map((p) => p.weight);
    if (arr.length < 2) return [data.profile[lift], data.profile[lift]];
    return arr;
  };

  return (
    <ModuleLayout number="03" title="Fitness" subtitle="Sessions · PRs · Training" icon={Dumbbell}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prs">PR Tracker</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
              <Button onClick={() => setLogOpen(true)} className="w-full hud-label text-[10px]">+ Log Session</Button>
            </Panel>
          </div>
          <Panel title="Weekly Activity">
            <BarChart data={fit.data.length ? fit.data : [0]} labels={fit.labels} height={200} />
          </Panel>
        </TabsContent>

        <TabsContent value="prs" className="space-y-6">
          <Panel title="Personal Records">
            <div className="space-y-4">
              {(["bench", "squat", "deadlift"] as const).map((lift) => (
                <div key={lift} className="grid grid-cols-[120px_1fr_auto_auto] items-center gap-3">
                  <span className="hud-label text-xs text-muted-foreground capitalize">{lift}</span>
                  <span className="hud-label text-2xl text-primary hud-glow">{data.profile[lift]} lb</span>
                  <Input
                    type="number"
                    placeholder="New PR"
                    value={prDraft[lift]}
                    onChange={(e) => setPrDraft((p) => ({ ...p, [lift]: e.target.value }))}
                    className="h-9 text-xs w-28"
                  />
                  <Button size="sm" onClick={() => updatePR(lift)} className="hud-label text-[10px]">Update PR</Button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Weekly target sessions</span>
                <Input type="number" value={data.profile.gymSessionsTarget}
                  onChange={(e) => updateProfile({ gymSessionsTarget: Number(e.target.value) || 0 })}
                  className="h-9 text-xs mt-1 w-32" />
              </label>
            </div>
          </Panel>
          <Panel title={`PR History (${data.prHistory.length})`}>
            <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {[...data.prHistory].reverse().map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-xs">
                  <span className="hud-label text-muted-foreground">{p.date}</span>
                  <span className="hud-label capitalize text-foreground/80">{p.lift}</span>
                  <span className="hud-label text-primary">{p.weight} lb</span>
                </li>
              ))}
              {!data.prHistory.length && <li className="text-xs text-muted-foreground py-4 text-center">No PRs logged yet.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <Panel title={`All Workouts (${data.workouts.length})`}>
            <Button onClick={() => setLogOpen(true)} size="sm" className="hud-label text-[10px] mb-4">
              <Plus className="h-3 w-3 mr-1" /> Add Workout
            </Button>
            <ul className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {[...data.workouts].reverse().map((w) => (
                <li key={w.id} className="py-3 flex items-center gap-3 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="hud-label text-[10px] text-muted-foreground">{w.date}</span>
                      <span className="hud-label text-xs text-primary">{w.type}</span>
                      <span className="hud-label text-[10px] text-foreground/70">{w.durationMin} min</span>
                    </div>
                    {w.notes && <div className="text-[11px] text-foreground/70 mt-1">{w.notes}</div>}
                  </div>
                  <button onClick={() => deleteWorkout(w.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!data.workouts.length && <li className="text-xs text-muted-foreground py-6 text-center">No workouts logged.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {(["bench", "squat", "deadlift"] as const).map((lift) => (
            <Panel key={lift} title={`${lift.charAt(0).toUpperCase() + lift.slice(1)} Progress`}>
              <Sparkline data={prSeries(lift)} height={140} />
              <div className="hud-label text-[10px] text-muted-foreground mt-2">
                Current: <span className="text-primary">{data.profile[lift]} lb</span>
              </div>
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="recovery" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <Panel title="Log Recovery">
              <div className="space-y-3">
                <label className="block">
                  <span className="hud-label text-[10px] text-muted-foreground">Sleep (hours)</span>
                  <Input type="number" step="0.1" value={sleep} onChange={(e) => setSleep(e.target.value)} className="h-9 text-xs mt-1" />
                </label>
                <div>
                  <span className="hud-label text-[10px] text-muted-foreground">Stress level</span>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {STRESS.map((s) => (
                      <button key={s} type="button" onClick={() => setStress(s)}
                        className={`hud-label text-[10px] py-2 rounded border ${stress === s ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={logRecovery} className="w-full hud-label text-[10px]">Save Recovery</Button>
              </div>
            </Panel>
            <Panel title="Recovery Score">
              <div className="flex justify-center">
                <RingProgress value={recoveryScore} size={160} label={`${recoveryScore}`} sublabel="of 100" />
              </div>
              <div className="text-center hud-label text-[10px] text-muted-foreground mt-3">
                {lastRecovery ? `Last: ${lastRecovery.sleepHours}h sleep · ${lastRecovery.stress} stress` : "No data yet"}
              </div>
            </Panel>
          </div>
          <Panel title={`Recovery History (${data.recovery.length})`}>
            <ul className="divide-y divide-border max-h-[260px] overflow-y-auto">
              {[...data.recovery].reverse().map((r) => (
                <li key={r.id} className="py-2 flex justify-between text-xs">
                  <span className="hud-label text-muted-foreground">{r.date}</span>
                  <span className="hud-label text-foreground/80">{r.sleepHours}h sleep</span>
                  <span className="hud-label text-primary">{r.stress}</span>
                </li>
              ))}
              {!data.recovery.length && <li className="text-xs text-muted-foreground py-4 text-center">No entries yet.</li>}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">Log Workout Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Type</span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {WORKOUT_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setWType(t)}
                    className={`hud-label text-[10px] py-2 rounded border ${wType === t ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Duration (minutes)</span>
              <Input type="number" value={wDur} onChange={(e) => setWDur(e.target.value)} className="h-9 text-xs mt-1" />
            </label>
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Notes</span>
              <textarea value={wNotes} onChange={(e) => setWNotes(e.target.value)}
                rows={3} className="w-full bg-transparent border border-border rounded p-2 text-xs mt-1 focus:outline-none focus:border-primary/50" />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitSession} className="hud-label text-[10px]">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
