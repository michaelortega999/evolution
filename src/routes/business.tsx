import { localISO } from "@/lib/utils";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Briefcase, Trash2, Plus } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEvolutionData, todayDate, uid, type ProjectStatus, type TaskPriority } from "@/lib/evolution-data";

export const Route = createFileRoute("/business")({
  head: () => ({ meta: [{ title: "Business — Evolution" }, { name: "description", content: "Projects, revenue, tasks, and business goals." }] }),
  component: BusinessPage,
});

const STATUSES: ProjectStatus[] = ["Planning", "In Progress", "On Hold", "Completed"];
const PRIORITIES: TaskPriority[] = ["High", "Medium", "Low"];

function fmt(n: number) {
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function BusinessPage() {
  const { data, mutate } = useEvolutionData();

  const totalRevenue = data.revenue.reduce((a, r) => a + r.amount, 0);
  const monthRevenue = useMemo(() => {
    const m = localISO().slice(0, 7);
    return data.revenue.filter((r) => r.date.startsWith(m)).reduce((a, r) => a + r.amount, 0);
  }, [data.revenue]);
  const activeProjects = data.projects.filter((p) => p.status !== "Completed").length;
  const avgProgress = data.projects.length
    ? Math.round(data.projects.reduce((a, p) => a + p.progress, 0) / data.projects.length)
    : 0;

  // Project modal
  const [projOpen, setProjOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pName, setPName] = useState(""); const [pDesc, setPDesc] = useState("");
  const [pStatus, setPStatus] = useState<ProjectStatus>("Planning");
  const [pProg, setPProg] = useState(0); const [pDeadline, setPDeadline] = useState("");
  const [pRevTarget, setPRevTarget] = useState("");

  const openNewProj = () => { setEditId(null); setPName(""); setPDesc(""); setPStatus("Planning"); setPProg(0); setPDeadline(""); setPRevTarget(""); setProjOpen(true); };
  const openEditProj = (id: string) => {
    const p = data.projects.find((x) => x.id === id); if (!p) return;
    setEditId(id); setPName(p.name); setPDesc(p.description); setPStatus(p.status);
    setPProg(p.progress); setPDeadline(p.deadline); setPRevTarget(String(p.revenueTarget));
    setProjOpen(true);
  };
  const saveProj = () => {
    if (!pName.trim()) { toast.error("Give the project a name."); return; }
    if (pRevTarget && !(Number(pRevTarget) >= 0)) { toast.error("Revenue target must be 0 or more."); return; }
    mutate((prev) => ({
      projects: editId
        ? prev.projects.map((x) => x.id === editId ? { ...x, name: pName.trim(), description: pDesc, status: pStatus, progress: pProg, deadline: pDeadline, revenueTarget: Number(pRevTarget) || 0 } : x)
        : [...prev.projects, { id: uid(), name: pName.trim(), description: pDesc, status: pStatus, progress: pProg, deadline: pDeadline || todayDate(), revenueTarget: Number(pRevTarget) || 0 }],
    }));
    setProjOpen(false);
  };
  const delProj = (id: string) => mutate((prev) => ({ projects: prev.projects.filter((p) => p.id !== id) }));

  // Revenue
  const [rAmt, setRAmt] = useState(""); const [rSrc, setRSrc] = useState(""); const [rDate, setRDate] = useState(todayDate()); const [rCat, setRCat] = useState("Sales");
  const addRev = () => {
    if (!rSrc.trim()) { toast.error("Add a revenue source."); return; }
    if (!(Number(rAmt) > 0)) { toast.error("Enter an amount above 0."); return; }
    mutate((prev) => ({ revenue: [...prev.revenue, { id: uid(), date: rDate, amount: Number(rAmt), source: rSrc.trim(), category: rCat }] }));
    setRAmt(""); setRSrc("");
  };
  const delRev = (id: string) => mutate((prev) => ({ revenue: prev.revenue.filter((r) => r.id !== id) }));

  const revSeries = useMemo(() => {
    const sorted = [...data.revenue].sort((a, b) => a.date.localeCompare(b.date));
    if (!sorted.length) return [0, 0];
    let cum = 0;
    return sorted.map((r) => (cum += r.amount));
  }, [data.revenue]);

  // Tasks
  const [taskText, setTaskText] = useState(""); const [taskPri, setTaskPri] = useState<TaskPriority>("Medium");
  const [taskDue, setTaskDue] = useState(""); const [taskCat, setTaskCat] = useState("General");
  const [taskFilter, setTaskFilter] = useState<TaskPriority | "All">("All");
  const addTask = () => {
    if (!taskText.trim()) { toast.error("Write the task first."); return; }
    mutate((prev) => ({ bizTasks: [...prev.bizTasks, { id: uid(), text: taskText.trim(), priority: taskPri, due: taskDue || todayDate(), category: taskCat, done: false }] }));
    setTaskText("");
  };
  const toggleTask = (id: string) => mutate((prev) => ({ bizTasks: prev.bizTasks.map((t) => t.id === id ? { ...t, done: !t.done } : t) }));
  const delTask = (id: string) => mutate((prev) => ({ bizTasks: prev.bizTasks.filter((t) => t.id !== id) }));
  const visibleTasks = data.bizTasks.filter((t) => taskFilter === "All" || t.priority === taskFilter);

  // Goals
  const bizGoals = data.goals.filter((g) => g.category === "Business");
  const [gTitle, setGTitle] = useState(""); const [gTarget, setGTarget] = useState(""); const [gCurrent, setGCurrent] = useState(""); const [gDeadline, setGDeadline] = useState("");
  const addGoal = () => {
    if (!gTitle.trim()) { toast.error("Give the goal a title."); return; }
    if (!(Number(gTarget) > 0)) { toast.error("Target must be above 0."); return; }
    mutate((prev) => ({ goals: [...prev.goals, { id: uid(), title: gTitle.trim(), category: "Business", target: Number(gTarget), current: Number(gCurrent) || 0, deadline: gDeadline || todayDate(), completed: false }] }));
    setGTitle(""); setGTarget(""); setGCurrent(""); setGDeadline("");
  };
  const updateGoal = (id: string, current: number) =>
    mutate((prev) => ({ goals: prev.goals.map((g) => g.id === id ? { ...g, current, completed: current >= g.target } : g) }));
  const delGoal = (id: string) => mutate((prev) => ({ goals: prev.goals.filter((g) => g.id !== id) }));

  return (
    <ModuleLayout number="07" title="Business" subtitle="Projects · Revenue · Execution" icon={Briefcase}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="Total Revenue"><div className="hud-label text-3xl text-primary hud-glow">{fmt(totalRevenue)}</div><div className="hud-label text-[10px] text-muted-foreground mt-2">This month: {fmt(monthRevenue)}</div></Panel>
            <Panel title="Active Projects"><div className="hud-label text-3xl text-primary hud-glow">{activeProjects}</div><div className="hud-label text-[10px] text-muted-foreground mt-2">{data.projects.length} total</div></Panel>
            <Panel title="Health Score">
              <div className="flex items-center gap-4">
                <RingProgress value={avgProgress} size={80} label={`${avgProgress}%`} />
                <div className="hud-label text-[10px] text-muted-foreground">Avg progress across projects</div>
              </div>
            </Panel>
          </div>

          {/* Projects */}
          <Button onClick={openNewProj} size="sm" className="hud-label text-[10px]">
            <Plus className="h-3 w-3 mr-1" /> Add Project
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.projects.map((p) => (
              <div key={p.id} className="hud-card p-4 group relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="hud-label text-sm text-primary hud-glow">{p.name}</div>
                    <div className="hud-label text-[10px] text-muted-foreground mt-0.5">{p.status} · Due {p.deadline}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditProj(p.id)} className="hud-label text-[10px] text-muted-foreground hover:text-primary">Edit</button>
                    <button onClick={() => delProj(p.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {p.description && <p className="text-xs text-foreground/70 mt-2">{p.description}</p>}
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%`, boxShadow: "0 0 8px var(--primary)" }} />
                </div>
                <div className="flex justify-between hud-label text-[10px] mt-1">
                  <span className="text-primary">{p.progress}%</span>
                  <span className="text-muted-foreground">Target {fmt(p.revenueTarget)}</span>
                </div>
              </div>
            ))}
            {!data.projects.length && <div className="text-xs text-muted-foreground py-6 text-center col-span-full">No projects yet.</div>}
          </div>
          {/* Revenue */}
          <Panel title="Add Revenue">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input type="number" placeholder="Amount" value={rAmt} onChange={(e) => setRAmt(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Source" value={rSrc} onChange={(e) => setRSrc(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Category" value={rCat} onChange={(e) => setRCat(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addRev} size="sm" className="hud-label text-[10px]">+ Add</Button>
            </div>
          </Panel>
          <Panel title="Cumulative Revenue">
            <Sparkline data={revSeries} height={180} />
          </Panel>
          <Panel title={`Entries (${data.revenue.length}) · Total ${fmt(totalRevenue)}`}>
            <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {[...data.revenue].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
                <li key={r.id} className="py-2 grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 group text-xs">
                  <span className="hud-label text-[10px] text-muted-foreground">{r.date}</span>
                  <div>
                    <div className="hud-label text-foreground">{r.source}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">{r.category}</div>
                  </div>
                  <span className="hud-label text-primary">{fmt(r.amount)}</span>
                  <button onClick={() => delRev(r.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!data.revenue.length && <li className="text-xs text-muted-foreground py-6 text-center">No revenue logged.</li>}
            </ul>
          </Panel>
          {/* Tasks */}
          <Panel title="Add Task">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_140px_auto] gap-3">
              <Input placeholder="Task" value={taskText} onChange={(e) => setTaskText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} className="h-9 text-xs" />
              <select value={taskPri} onChange={(e) => setTaskPri(e.target.value as TaskPriority)} className="h-9 bg-input border border-border rounded px-2 text-xs">
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Category" value={taskCat} onChange={(e) => setTaskCat(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addTask} size="sm" className="hud-label text-[10px]">+ Add</Button>
            </div>
          </Panel>
          <Panel title={`Tasks (${visibleTasks.filter((t) => !t.done).length} open)`}>
            <div className="flex gap-2 mb-3">
              {(["All", ...PRIORITIES] as const).map((p) => (
                <button key={p} onClick={() => setTaskFilter(p)}
                  className={`hud-label text-[10px] px-3 py-1 rounded border ${taskFilter === p ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
            <ul className="space-y-1">
              {visibleTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 border border-border rounded p-2 group">
                  <button onClick={() => toggleTask(t.id)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${t.done ? "bg-primary border-primary" : "border-primary/50"}`}>
                    {t.done && <span className="text-[10px] text-primary-foreground">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.text}</span>
                  <span className={`hud-label text-[10px] px-2 py-0.5 rounded border ${t.priority === "High" ? "border-destructive text-destructive" : t.priority === "Medium" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{t.priority}</span>
                  <span className="hud-label text-[10px] text-muted-foreground">{t.due}</span>
                  <button onClick={() => delTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!visibleTasks.length && <li className="text-xs text-muted-foreground py-4 text-center">No tasks.</li>}
            </ul>
          </Panel>
          {/* Goals */}
          <Panel title="Add Business Goal">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Title" value={gTitle} onChange={(e) => setGTitle(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Target" value={gTarget} onChange={(e) => setGTarget(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Current" value={gCurrent} onChange={(e) => setGCurrent(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} className="h-9 text-xs" />
            </div>
            <Button onClick={addGoal} size="sm" className="hud-label text-[10px] mt-3">+ Add Goal</Button>
          </Panel>
          <Panel title={`Goals (${bizGoals.length})`}>
            <ul className="space-y-3">
              {bizGoals.map((g) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <li key={g.id} className="border border-border rounded p-3 group">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="hud-label text-xs text-foreground">{g.title}</div>
                        <div className="hud-label text-[10px] text-muted-foreground">Due {g.deadline}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" value={g.current} onChange={(e) => updateGoal(g.id, Number(e.target.value) || 0)} className="h-8 text-xs w-24" />
                        <span className="hud-label text-xs text-primary">/ {g.target}</span>
                        <button onClick={() => delGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--primary)" }} />
                    </div>
                  </li>
                );
              })}
              {!bizGoals.length && <li className="text-xs text-muted-foreground py-6 text-center">No goals yet.</li>}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>

      <Dialog open={projOpen} onOpenChange={setProjOpen}>
        <DialogContent className="hud-card border-primary/40 max-w-lg">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">{editId ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={pName} onChange={(e) => setPName(e.target.value)} className="h-9 text-xs" />
            <textarea placeholder="Description" value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={3}
              className="w-full bg-transparent border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50" />
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Status</span>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setPStatus(s)}
                    className={`hud-label text-[10px] py-2 rounded border ${pStatus === s ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Progress: {pProg}%</span>
              <input type="range" min={0} max={100} value={pProg} onChange={(e) => setPProg(Number(e.target.value))} className="w-full" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Deadline</span>
                <Input type="date" value={pDeadline} onChange={(e) => setPDeadline(e.target.value)} className="h-9 text-xs mt-1" />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Revenue Target ($)</span>
                <Input type="number" value={pRevTarget} onChange={(e) => setPRevTarget(e.target.value)} className="h-9 text-xs mt-1" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={saveProj} className="hud-label text-[10px]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
