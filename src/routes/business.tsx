import { localISO } from "@/lib/utils";
import { toast } from "sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import {
  Briefcase,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Network,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Music2,
  Globe,
  Lightbulb,
  Pencil,
  CircleCheck,
  Send,
  CalendarDays,
  Search,
  X,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { MediaSystemDashboard } from "@/components/evolution/MediaSystemDashboard";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useEvolutionData,
  todayDate,
  uid,
  type ProjectStatus,
  type TaskPriority,
  type EvolutionData,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/business")({
  validateSearch: (search: Record<string, unknown>): { section?: "social-media" | "marketing-system" } => ({
    section:
      search.section === "social-media"
        ? "social-media"
        : search.section === "marketing-system"
          ? "marketing-system"
          : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Business — Evolution" },
      { property: "og:title", content: "Business — Evolution" },
      {
        property: "og:description",
        content: "Projects, revenue, tasks, and business goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "description",
        content: "Projects, revenue, tasks, and business goals.",
      },
    ],
  }),
  component: BusinessRoute,
});

const STATUSES: ProjectStatus[] = ["Planning", "In Progress", "On Hold", "Completed"];
const PRIORITIES: TaskPriority[] = ["High", "Medium", "Low"];

function fmt(n: number) {
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function BusinessRoute() {
  const { section } = Route.useSearch();
  if (section === "social-media") return <SocialMediaPage />;
  if (section === "marketing-system") {
    return (
      <ModuleLayout number="07" title="Media System" subtitle="Business · Automated marketing overview" icon={Network}>
        <MediaSystemDashboard />
      </ModuleLayout>
    );
  }
  return <BusinessPage />;
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
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pStatus, setPStatus] = useState<ProjectStatus>("Planning");
  const [pProg, setPProg] = useState(0);
  const [pDeadline, setPDeadline] = useState("");
  const [pRevTarget, setPRevTarget] = useState("");

  const openNewProj = () => {
    setEditId(null);
    setPName("");
    setPDesc("");
    setPStatus("Planning");
    setPProg(0);
    setPDeadline("");
    setPRevTarget("");
    setProjOpen(true);
  };
  const openEditProj = (id: string) => {
    const p = data.projects.find((x) => x.id === id);
    if (!p) return;
    setEditId(id);
    setPName(p.name);
    setPDesc(p.description);
    setPStatus(p.status);
    setPProg(p.progress);
    setPDeadline(p.deadline);
    setPRevTarget(String(p.revenueTarget));
    setProjOpen(true);
  };
  const saveProj = () => {
    if (!pName.trim()) {
      toast.error("Give the project a name.");
      return;
    }
    if (pRevTarget && !(Number(pRevTarget) >= 0)) {
      toast.error("Revenue target must be 0 or more.");
      return;
    }
    mutate((prev) => ({
      projects: editId
        ? prev.projects.map((x) =>
            x.id === editId
              ? {
                  ...x,
                  name: pName.trim(),
                  description: pDesc,
                  status: pStatus,
                  progress: pProg,
                  deadline: pDeadline,
                  revenueTarget: Number(pRevTarget) || 0,
                }
              : x,
          )
        : [
            ...prev.projects,
            {
              id: uid(),
              name: pName.trim(),
              description: pDesc,
              status: pStatus,
              progress: pProg,
              deadline: pDeadline || todayDate(),
              revenueTarget: Number(pRevTarget) || 0,
            },
          ],
    }));
    setProjOpen(false);
  };
  const delProj = (id: string) => mutate((prev) => ({ projects: prev.projects.filter((p) => p.id !== id) }));

  // Revenue
  const [rAmt, setRAmt] = useState("");
  const [rSrc, setRSrc] = useState("");
  const [rDate, setRDate] = useState(todayDate());
  const [rCat, setRCat] = useState("Sales");
  const addRev = () => {
    if (!rSrc.trim()) {
      toast.error("Add a revenue source.");
      return;
    }
    if (!(Number(rAmt) > 0)) {
      toast.error("Enter an amount above 0.");
      return;
    }
    mutate((prev) => ({
      revenue: [...prev.revenue, { id: uid(), date: rDate, amount: Number(rAmt), source: rSrc.trim(), category: rCat }],
    }));
    setRAmt("");
    setRSrc("");
  };
  const delRev = (id: string) => mutate((prev) => ({ revenue: prev.revenue.filter((r) => r.id !== id) }));

  const revSeries = useMemo(() => {
    const sorted = [...data.revenue].sort((a, b) => a.date.localeCompare(b.date));
    if (!sorted.length) return [0, 0];
    let cum = 0;
    return sorted.map((r) => (cum += r.amount));
  }, [data.revenue]);

  // Tasks
  const [taskText, setTaskText] = useState("");
  const [taskPri, setTaskPri] = useState<TaskPriority>("Medium");
  const [taskDue, setTaskDue] = useState("");
  const [taskCat, setTaskCat] = useState("General");
  const [taskFilter, setTaskFilter] = useState<TaskPriority | "All">("All");
  const addTask = () => {
    if (!taskText.trim()) {
      toast.error("Write the task first.");
      return;
    }
    mutate((prev) => ({
      bizTasks: [
        ...prev.bizTasks,
        {
          id: uid(),
          text: taskText.trim(),
          priority: taskPri,
          due: taskDue || todayDate(),
          category: taskCat,
          done: false,
        },
      ],
    }));
    setTaskText("");
  };
  const toggleTask = (id: string) =>
    mutate((prev) => ({ bizTasks: prev.bizTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const delTask = (id: string) => mutate((prev) => ({ bizTasks: prev.bizTasks.filter((t) => t.id !== id) }));
  const visibleTasks = data.bizTasks.filter((t) => taskFilter === "All" || t.priority === taskFilter);

  // Goals
  const bizGoals = data.goals.filter((g) => g.category === "Business");
  const [gTitle, setGTitle] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [gCurrent, setGCurrent] = useState("");
  const [gDeadline, setGDeadline] = useState("");
  const addGoal = () => {
    if (!gTitle.trim()) {
      toast.error("Give the goal a title.");
      return;
    }
    if (!(Number(gTarget) > 0)) {
      toast.error("Target must be above 0.");
      return;
    }
    mutate((prev) => ({
      goals: [
        ...prev.goals,
        {
          id: uid(),
          title: gTitle.trim(),
          category: "Business",
          target: Number(gTarget),
          current: Number(gCurrent) || 0,
          deadline: gDeadline || todayDate(),
          completed: false,
        },
      ],
    }));
    setGTitle("");
    setGTarget("");
    setGCurrent("");
    setGDeadline("");
  };
  const updateGoal = (id: string, current: number) =>
    mutate((prev) => ({
      goals: prev.goals.map((g) => (g.id === id ? { ...g, current, completed: current >= g.target } : g)),
    }));
  const delGoal = (id: string) => mutate((prev) => ({ goals: prev.goals.filter((g) => g.id !== id) }));

  return (
    <ModuleLayout number="07" title="Business" subtitle="Projects · Revenue · Execution" icon={Briefcase}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Link
            to="/business"
            search={{ section: "social-media" }}
            className="hud-card group flex flex-wrap items-center gap-5 p-5 border-cyan-400/35 hover:border-cyan-300/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            style={{
              background: "linear-gradient(110deg, rgba(8, 47, 73, .85), rgba(3, 12, 25, .95))",
            }}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
              <Network className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="hud-label text-[9px] tracking-[.22em] text-cyan-300/65 mb-1">Business workspace</div>
              <h2 className="hud-label text-lg text-cyan-200">Social Media</h2>
              <p className="mt-1 text-sm text-slate-400">
                Projects, content ideas, and your publishing plan in one place.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 hud-label text-[10px] text-cyan-300">
              Open workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            to="/business"
            search={{ section: "marketing-system" }}
            className="hud-card group flex flex-wrap items-center gap-5 p-5 border-cyan-400/35 hover:border-cyan-300/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            style={{
              background: "linear-gradient(110deg, rgba(8, 47, 73, .85), rgba(3, 12, 25, .95))",
            }}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
              <Globe className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="hud-label text-[9px] tracking-[.22em] text-cyan-300/65 mb-1">
                Business workspace · demo
              </div>
              <h2 className="hud-label text-lg text-cyan-200">Marketing System</h2>
              <p className="mt-1 text-sm text-slate-400">
                Automated marketing overview: traffic, AI agents, workflow, and campaign performance (sample data).
              </p>
            </div>
            <span className="inline-flex items-center gap-2 hud-label text-[10px] text-cyan-300">
              Open dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="Total Revenue">
              <div className="hud-label text-3xl text-primary hud-glow">{fmt(totalRevenue)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">This month: {fmt(monthRevenue)}</div>
            </Panel>
            <Panel title="Active Projects">
              <div className="hud-label text-3xl text-primary hud-glow">{activeProjects}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">{data.projects.length} total</div>
            </Panel>
            <Panel title="Health Score">
              <div className="flex items-center gap-4">
                <RingProgress value={avgProgress} size={80} label={`${avgProgress}%`} />
                <div className="hud-label text-[10px] text-muted-foreground">Avg progress across projects</div>
              </div>
            </Panel>
          </div>

          {/* Projects */}
          <Button id="business-projects" onClick={openNewProj} size="sm" className="hud-label text-[10px]">
            <Plus className="h-3 w-3 mr-1" /> Add Project
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.projects.map((p) => (
              <div key={p.id} className="hud-card p-4 group relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="hud-label text-sm text-primary hud-glow">{p.name}</div>
                    <div className="hud-label text-[10px] text-muted-foreground mt-0.5">
                      {p.status} · Due {p.deadline}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditProj(p.id)}
                      className="hud-label text-[10px] text-muted-foreground hover:text-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => delProj(p.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {p.description && <p className="text-xs text-foreground/70 mt-2">{p.description}</p>}
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${p.progress}%`, boxShadow: "0 0 8px var(--primary)" }}
                  />
                </div>
                <div className="flex justify-between hud-label text-[10px] mt-1">
                  <span className="text-primary">{p.progress}%</span>
                  <span className="text-muted-foreground">Target {fmt(p.revenueTarget)}</span>
                </div>
              </div>
            ))}
            {!data.projects.length && (
              <div className="text-xs text-muted-foreground py-6 text-center col-span-full">No projects yet.</div>
            )}
          </div>
          {/* Revenue */}
          <Panel title="Add Revenue">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input
                type="number"
                placeholder="Amount"
                value={rAmt}
                onChange={(e) => setRAmt(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="Source"
                value={rSrc}
                onChange={(e) => setRSrc(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="Category"
                value={rCat}
                onChange={(e) => setRCat(e.target.value)}
                className="h-9 text-xs"
              />
              <Input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addRev} size="sm" className="hud-label text-[10px]">
                + Add
              </Button>
            </div>
          </Panel>
          <Panel title="Cumulative Revenue">
            <Sparkline data={revSeries} height={180} />
          </Panel>
          <Panel title={`Entries (${data.revenue.length}) · Total ${fmt(totalRevenue)}`}>
            <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {[...data.revenue]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((r) => (
                  <li key={r.id} className="py-2 grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 group text-xs">
                    <span className="hud-label text-[10px] text-muted-foreground">{r.date}</span>
                    <div>
                      <div className="hud-label text-foreground">{r.source}</div>
                      <div className="hud-label text-[10px] text-muted-foreground">{r.category}</div>
                    </div>
                    <span className="hud-label text-primary">{fmt(r.amount)}</span>
                    <button
                      onClick={() => delRev(r.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              {!data.revenue.length && (
                <li className="text-xs text-muted-foreground py-6 text-center">No revenue logged.</li>
              )}
            </ul>
          </Panel>
          {/* Tasks */}
          <Panel title="Add Task">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_140px_auto] gap-3">
              <Input
                placeholder="Task"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className="h-9 text-xs"
              />
              <select
                value={taskPri}
                onChange={(e) => setTaskPri(e.target.value as TaskPriority)}
                className="h-9 bg-input border border-border rounded px-2 text-xs"
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="h-9 text-xs" />
              <Input
                placeholder="Category"
                value={taskCat}
                onChange={(e) => setTaskCat(e.target.value)}
                className="h-9 text-xs"
              />
              <Button onClick={addTask} size="sm" className="hud-label text-[10px]">
                + Add
              </Button>
            </div>
          </Panel>
          <Panel title={`Tasks (${visibleTasks.filter((t) => !t.done).length} open)`}>
            <div className="flex gap-2 mb-3">
              {(["All", ...PRIORITIES] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTaskFilter(p)}
                  className={`hud-label text-[10px] px-3 py-1 rounded border ${taskFilter === p ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <ul className="space-y-1">
              {visibleTasks.map((t) => (
                <li key={t.id} className="evo-surface flex items-center gap-3 border border-border rounded p-2 group">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${t.done ? "bg-primary border-primary" : "border-primary/50"}`}
                  >
                    {t.done && <span className="text-[10px] text-primary-foreground">✓</span>}
                  </button>
                  <span
                    className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}
                  >
                    {t.text}
                  </span>
                  <span
                    className={`hud-label text-[10px] px-2 py-0.5 rounded border ${t.priority === "High" ? "border-destructive text-destructive" : t.priority === "Medium" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {t.priority}
                  </span>
                  <span className="hud-label text-[10px] text-muted-foreground">{t.due}</span>
                  <button
                    onClick={() => delTask(t.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
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
              <Input
                placeholder="Title"
                value={gTitle}
                onChange={(e) => setGTitle(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                type="number"
                placeholder="Target"
                value={gTarget}
                onChange={(e) => setGTarget(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                type="number"
                placeholder="Current"
                value={gCurrent}
                onChange={(e) => setGCurrent(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                type="date"
                value={gDeadline}
                onChange={(e) => setGDeadline(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <Button onClick={addGoal} size="sm" className="hud-label text-[10px] mt-3">
              + Add Goal
            </Button>
          </Panel>
          <Panel title={`Goals (${bizGoals.length})`}>
            <ul className="space-y-3">
              {bizGoals.map((g) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <li key={g.id} className="evo-surface border border-border rounded p-3 group">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="hud-label text-xs text-foreground">{g.title}</div>
                        <div className="hud-label text-[10px] text-muted-foreground">Due {g.deadline}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={g.current}
                          onChange={(e) => updateGoal(g.id, Number(e.target.value) || 0)}
                          className="h-8 text-xs w-24"
                        />
                        <span className="hud-label text-xs text-primary">/ {g.target}</span>
                        <button
                          onClick={() => delGoal(g.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--primary)" }}
                      />
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
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">
              {editId ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              className="h-9 text-xs"
            />
            <textarea
              placeholder="Description"
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50"
            />
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Status</span>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPStatus(s)}
                    className={`hud-label text-[10px] py-2 rounded border ${pStatus === s ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Progress: {pProg}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={pProg}
                onChange={(e) => setPProg(Number(e.target.value))}
                className="w-full"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Deadline</span>
                <Input
                  type="date"
                  value={pDeadline}
                  onChange={(e) => setPDeadline(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Revenue Target ($)</span>
                <Input
                  type="number"
                  value={pRevTarget}
                  onChange={(e) => setPRevTarget(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjOpen(false)} className="hud-label text-[10px]">
              Cancel
            </Button>
            <Button onClick={saveProj} className="hud-label text-[10px]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

const MEDIA_CHANNELS = [
  { name: "Instagram", icon: Instagram, color: "#e879f9" },
  { name: "TikTok", icon: Music2, color: "#22d3ee" },
  { name: "YouTube", icon: Youtube, color: "#fb7185" },
  { name: "Facebook", icon: Facebook, color: "#60a5fa" },
  { name: "LinkedIn", icon: Linkedin, color: "#38bdf8" },
  { name: "Other", icon: Globe, color: "#34d399" },
] as const;
const MEDIA_STAGES = ["Idea", "Draft", "Ready", "Published"] as const;
type MediaStage = (typeof MEDIA_STAGES)[number];
type MediaItem = {
  id: string;
  title: string;
  channel: string;
  stage: MediaStage;
  date: string;
  notes?: string;
};
const MEDIA_STAGE_META = [
  {
    name: "Idea",
    icon: Lightbulb,
    color: "#c084fc",
    hint: "Capture the next great idea",
    action: "Add idea",
  },
  {
    name: "Draft",
    icon: Pencil,
    color: "#38bdf8",
    hint: "Shape the story and the creative",
    action: "Add draft",
  },
  {
    name: "Ready",
    icon: CircleCheck,
    color: "#2dd4bf",
    hint: "Reviewed and ready to share",
    action: "Add ready content",
  },
  {
    name: "Published",
    icon: Send,
    color: "#fbbf24",
    hint: "Your manually logged posts",
    action: "Log published content",
  },
] as const;

function mediaRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function readMediaItems(data: EvolutionData): MediaItem[] {
  const items = mediaRecord(data.phoneStore?.data?.biz).mediaItems;
  if (!Array.isArray(items)) return [];
  return items.flatMap((value) => {
    const item = mediaRecord(value);
    if (typeof item.id !== "string" || typeof item.title !== "string") return [];
    return [
      {
        ...item,
        id: item.id,
        title: item.title,
        channel: typeof item.channel === "string" ? item.channel : "Other",
        stage: MEDIA_STAGES.includes(item.stage as MediaStage) ? (item.stage as MediaStage) : "Idea",
        date: typeof item.date === "string" ? item.date : "",
        notes: typeof item.notes === "string" ? item.notes : "",
      },
    ];
  });
}

// Keep the planner in the existing, account-scoped phone store. The existing
// three-way record merge preserves desktop/phone edits without a new schema.
function mediaPatch(data: EvolutionData, update: (items: MediaItem[]) => MediaItem[]): Partial<EvolutionData> {
  const phoneData = data.phoneStore?.data ?? {};
  return {
    phoneStore: {
      v: data.phoneStore?.v ?? 1,
      data: {
        ...phoneData,
        biz: {
          ...mediaRecord(phoneData.biz),
          mediaItems: update(readMediaItems(data)),
        },
      },
    },
  };
}

function SocialMediaPage() {
  const { data, mutate } = useEvolutionData();
  const items = readMediaItems(data);
  const [channel, setChannel] = useState("All");
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const submitGuard = useRef(false);
  const newItemId = useRef<string | null>(null);
  const [title, setTitle] = useState("");
  const [itemChannel, setItemChannel] = useState("Instagram");
  const [stage, setStage] = useState<MediaStage>("Idea");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const activeProjects = data.projects.filter((project) => project.status !== "Completed");
  const openItems = items.filter((item) => item.stage !== "Published");
  const dueItems = openItems.filter((item) => item.date && item.date <= todayDate());
  const visibleItems = items
    .filter(
      (item) =>
        (channel === "All" || item.channel === channel) &&
        `${item.title} ${item.notes ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  const openEditor = (item?: MediaItem, initialStage: MediaStage = "Idea") => {
    submitGuard.current = false;
    newItemId.current = item?.id ?? uid();
    setEditingId(item?.id ?? null);
    setTitle(item?.title ?? "");
    setItemChannel(item?.channel ?? (channel === "All" ? "Instagram" : channel));
    setStage(item?.stage ?? initialStage);
    setDate(item?.date ?? "");
    setNotes(item?.notes ?? "");
    setEditorOpen(true);
  };
  const saveItem = () => {
    if (submitGuard.current) return;
    if (!title.trim()) {
      toast.error("Give your content a title.");
      return;
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast.error("Choose a valid planned date.");
      return;
    }
    const item: MediaItem = {
      id: editingId ?? newItemId.current ?? uid(),
      title: title.trim(),
      channel: itemChannel,
      stage,
      date,
      notes: notes.trim(),
    };
    submitGuard.current = true;
    let removed = false;
    try {
      mutate((prev) => {
        if (editingId && !readMediaItems(prev).some((record) => record.id === editingId)) {
          removed = true;
          return {};
        }
        return mediaPatch(prev, (current) =>
          editingId
            ? current.map((record) => (record.id === editingId ? { ...record, ...item } : record))
            : current.some((record) => record.id === item.id)
              ? current
              : [...current, item],
        );
      });
    } catch {
      submitGuard.current = false;
      toast.error("Content could not be saved. Please try again.");
      return;
    }
    if (removed) {
      submitGuard.current = false;
      toast.error("This content was removed elsewhere. Copy your changes before closing.");
      return;
    }
    setEditorOpen(false);
  };
  const moveItem = (id: string, nextStage: MediaStage) => {
    mutate((prev) =>
      mediaPatch(prev, (current) => current.map((item) => (item.id === id ? { ...item, stage: nextStage } : item))),
    );
  };
  const deleteItem = () => {
    if (!deleteTarget) return;
    mutate((prev) => mediaPatch(prev, (current) => current.filter((item) => item.id !== deleteTarget.id)));
    setDeleteTarget(null);
  };

  return (
    <ModuleLayout number="07" title="Social Media" subtitle="Business · Content command center" icon={Network}>
      <style>{`
        .media-workspace { --media-cyan: #22d3ee; color: #e2e8f0; }
        .media-panel { position: relative; border: 1px solid rgba(34,211,238,.24); background: linear-gradient(135deg,rgba(8,28,46,.96),rgba(3,10,22,.98)); box-shadow: inset 0 0 26px rgba(14,165,233,.035),0 0 18px rgba(14,165,233,.035); border-radius: 12px; }
        html:not([data-card-style]) .media-panel::before { content: ''; pointer-events: none; position: absolute; top: -1px; left: 22px; width: 55px; height: 2px; background: #22d3ee; box-shadow: 0 0 11px #22d3ee70; }
        html:not([data-card-style]) .media-panel::after { content: ''; pointer-events: none; position: absolute; bottom: -1px; right: 22px; width: 32px; height: 2px; background: #22d3ee80; }
        .media-card-link { transition: border-color .18s, box-shadow .18s; }
        .media-card-link:hover { border-color: rgba(103,232,249,.65); box-shadow: inset 0 0 28px #0ea5e90a,0 0 22px #0ea5e915; }
        .media-card-link:focus-visible,.media-workspace button:focus-visible,.media-workspace a:focus-visible { outline: 2px solid #67e8f9; outline-offset: 4px; }
        .media-orbit { position: relative; width: 78px; height: 78px; display: grid; place-items: center; flex-shrink: 0; border: 1px solid #22d3ee50; border-radius: 50%; background: radial-gradient(circle,#0ea5e922,transparent 70%); box-shadow: 0 0 26px #0ea5e915,inset 0 0 18px #0ea5e915; }
        .media-orbit::before { content: ''; position: absolute; inset: 7px; border: 1px dashed #22d3ee40; border-radius: 50%; }
        .media-grid { background-image: linear-gradient(#22d3ee05 1px,transparent 1px),linear-gradient(90deg,#22d3ee05 1px,transparent 1px); background-size: 28px 28px; }
        .media-workspace select { color-scheme: dark; }
      `}</style>
      <div className="media-workspace space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/business"
            search={{}}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Business
          </Link>
          <span className="hud-label text-[9px] tracking-widest text-cyan-300/60">Plan · Create · Publish</span>
        </div>

        <section
          className="evo-surface media-panel media-grid overflow-hidden p-6 md:p-7"
          aria-label="Social media workspace"
        >
          <div
            className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-cyan-400/10"
            aria-hidden="true"
          />
          <div
            className="absolute -right-1 -top-12 h-48 w-48 rounded-full border border-cyan-400/10"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="hud-label text-[9px] tracking-[.3em] text-cyan-300 mb-3">Evolution / Media operations</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-100">
                Your ideas. A clear path to publish.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-400">
                Bring your projects and content plan into one focused workspace.
              </p>
            </div>
            <div className="flex items-center gap-5 rounded-lg border border-cyan-400/15 bg-[#030b16]/70 px-5 py-3">
              <div>
                <div className="hud-label text-xl text-cyan-200">{openItems.length}</div>
                <div className="hud-label text-[8px] tracking-widest text-slate-400 mt-1">In pipeline</div>
              </div>
              <div className="h-8 w-px bg-cyan-400/15" />
              <div>
                <div className="hud-label text-xl text-cyan-200">{dueItems.length}</div>
                <div className="hud-label text-[8px] tracking-widest text-slate-400 mt-1">Due / overdue</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            to="/business"
            search={{}}
            hash="business-projects"
            className="evo-surface media-panel media-card-link block p-6 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="hud-label text-[9px] tracking-[.24em] text-cyan-300/60 mb-2">01 / Build the vision</div>
                <h2 className="hud-label text-xl text-cyan-100">Projects</h2>
              </div>
              <div className="media-orbit">
                <FolderKanban className="h-7 w-7 text-cyan-300" />
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400 mt-4">
              Turn business goals into projects. Keep milestones, progress, and deadlines together.
            </p>
            <div className="mt-6 flex items-end justify-between gap-3 border-t border-cyan-400/15 pt-4">
              <div>
                <span className="hud-label text-2xl text-cyan-200">{activeProjects.length}</span>
                <span className="ml-2 text-xs text-slate-400">active projects</span>
              </div>
              <span className="inline-flex items-center gap-2 hud-label text-[9px] text-cyan-300">
                Open projects <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
          <a href="#media-planner" className="evo-surface media-panel media-card-link block p-6 group">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="hud-label text-[9px] tracking-[.24em] text-cyan-300/60 mb-2">
                  02 / Create the content
                </div>
                <h2 className="hud-label text-xl text-cyan-100">Media System</h2>
              </div>
              <div className="media-orbit">
                <Network className="h-7 w-7 text-cyan-300" />
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400 mt-4">
              Capture ideas, develop drafts, and plan your channels. A clear workflow for every piece of content.
            </p>
            <div className="mt-6 flex items-end justify-between gap-3 border-t border-cyan-400/15 pt-4">
              <div>
                <span className="hud-label text-2xl text-cyan-200">{items.length}</span>
                <span className="ml-2 text-xs text-slate-400">content items</span>
              </div>
              <span className="inline-flex items-center gap-2 hud-label text-[9px] text-cyan-300">
                Open planner <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </a>
          <Link
            to="/business"
            search={{ section: "marketing-system" }}
            className="evo-surface media-panel media-card-link block p-6 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="hud-label text-[9px] tracking-[.24em] text-cyan-300/60 mb-2">
                  03 / Marketing overview · demo
                </div>
                <h2 className="hud-label text-xl text-cyan-100">Marketing System</h2>
              </div>
              <div className="media-orbit">
                <Globe className="h-7 w-7 text-cyan-300" />
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400 mt-4">
              Traffic sources, AI agents, automated workflow, and campaign performance in one dashboard. Sample data
              shown until real sources are connected.
            </p>
            <div className="mt-6 flex items-end justify-end border-t border-cyan-400/15 pt-4">
              <span className="inline-flex items-center gap-2 hud-label text-[9px] text-cyan-300">
                Open dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>

        <section aria-labelledby="media-channels-title">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 id="media-channels-title" className="hud-label text-[10px] tracking-widest text-cyan-200">
              Content channels
            </h2>
            <button
              type="button"
              onClick={() => setChannel("All")}
              aria-pressed={channel === "All"}
              className={`text-xs px-3 py-1 rounded border ${channel === "All" ? "border-cyan-400/45 text-cyan-200 bg-cyan-400/10" : "border-slate-700 text-slate-400"}`}
            >
              All channels
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {MEDIA_CHANNELS.map(({ name, icon: Icon, color }) => (
              <button
                type="button"
                key={name}
                onClick={() => setChannel(channel === name ? "All" : name)}
                aria-pressed={channel === name}
                className={`evo-surface media-panel media-card-link text-left p-4 ${channel === name ? "ring-1 ring-cyan-300" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon className="h-5 w-5" style={{ color }} />
                  <span className="hud-label text-lg text-slate-200">
                    {items.filter((item) => item.channel === name).length}
                  </span>
                </div>
                <div className="hud-label text-[9px] text-slate-300 mt-3">{name}</div>
                <div className="mt-1 text-[10px] text-slate-400">Planned & logged</div>
              </button>
            ))}
          </div>
        </section>

        <section id="media-planner" className="scroll-mt-6" aria-labelledby="media-planner-title">
          <div className="evo-surface media-panel p-5 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="hud-label text-[8px] tracking-[.25em] text-cyan-300/60 mb-1">Media System</div>
                <h2 id="media-planner-title" className="hud-label text-base text-cyan-100">
                  Content pipeline
                </h2>
              </div>
              <Button
                onClick={() => openEditor()}
                size="sm"
                className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 hud-label text-[10px]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add content
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 border-t border-cyan-400/15 pt-4">
              <p className="max-w-lg text-xs leading-relaxed text-slate-400">
                A manual planning workspace. Planned dates are for your reference; publishing and channel connections
                are not automated.
              </p>
              <label className="relative min-w-[180px] flex-1 max-w-xs">
                <span className="sr-only">Search content</span>
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search content…"
                  className="h-9 pl-9 bg-[#030b16] border-cyan-400/20 text-xs text-slate-200"
                />
              </label>
            </div>
            {(channel !== "All" || query) && (
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <span>
                  {visibleItems.length} result
                  {visibleItems.length === 1 ? "" : "s"}
                  {channel !== "All" ? ` · ${channel}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setChannel("All");
                    setQuery("");
                  }}
                  className="inline-flex items-center gap-1 text-cyan-300"
                >
                  <X className="h-3 w-3" /> Clear filters
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {MEDIA_STAGE_META.map(({ name, icon: Icon, color, hint, action }, index) => {
              const column = visibleItems.filter((item) => item.stage === name);
              return (
                <section key={name} className="evo-surface media-panel flex flex-col min-w-0 overflow-hidden">
                  <div className="p-4 border-b border-cyan-400/10">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color }} />
                      <h3 className="hud-label text-[10px] text-slate-200">{name}</h3>
                      <span className="ml-auto text-[10px] rounded border border-slate-700 px-1.5 text-slate-400">
                        {column.length}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">{hint}</div>
                  </div>
                  <div className="p-3 flex-1 space-y-3 min-h-[180px]">
                    {column.map((item) => {
                      const itemMeta = MEDIA_CHANNELS.find((entry) => entry.name === item.channel);
                      const ChannelIcon = itemMeta?.icon ?? Globe;
                      const overdue = item.stage !== "Published" && item.date && item.date < todayDate();
                      return (
                        <article key={item.id} className="rounded-lg border border-cyan-400/15 bg-[#071426] p-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <ChannelIcon className="h-3 w-3" style={{ color: itemMeta?.color ?? "#34d399" }} />
                            {item.channel}
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditor(item)}
                            className="block text-left text-sm font-medium text-slate-100 hover:text-cyan-200 mt-2 break-words w-full"
                          >
                            {item.title}
                          </button>
                          {item.notes && (
                            <p className="mt-2 text-xs text-slate-400 line-clamp-2 break-words whitespace-pre-wrap">
                              {item.notes}
                            </p>
                          )}
                          <div
                            className={`flex items-center gap-1.5 text-[10px] mt-3 ${overdue ? "text-amber-300" : "text-slate-400"}`}
                          >
                            <CalendarDays className="h-3 w-3" />
                            {item.date || "No planned date"}
                            {overdue ? " · Overdue" : ""}
                          </div>
                          <div className="mt-3 pt-2 border-t border-cyan-400/10 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditor(item)}
                              className="text-[10px] text-cyan-300 hover:text-cyan-100"
                            >
                              Edit
                            </button>
                            {index < MEDIA_STAGES.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveItem(item.id, MEDIA_STAGES[index + 1])}
                                className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-200"
                                title={
                                  index === 2 ? "Mark as published manually" : `Move to ${MEDIA_STAGES[index + 1]}`
                                }
                              >
                                {index === 2 ? "Log published" : MEDIA_STAGES[index + 1]}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              aria-label={`Delete ${item.title}`}
                              className={`${index === MEDIA_STAGES.length - 1 ? "ml-auto" : ""} rounded p-1 text-slate-400 hover:text-red-400`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                    {!column.length && (
                      <div className="rounded-lg border border-dashed border-cyan-400/15 px-3 py-6 text-center">
                        <Icon className="h-6 w-6 mx-auto opacity-50" style={{ color }} />
                        <p className="mt-3 text-xs text-slate-400">
                          {items.length
                            ? "No matching content"
                            : name === "Idea"
                              ? "Start with a spark."
                              : `No ${name.toLowerCase()} content yet.`}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditor(undefined, name)}
                    className="m-3 mt-0 flex items-center justify-center gap-1.5 rounded border border-cyan-400/15 py-2.5 text-[10px] text-slate-400 hover:text-cyan-200 hover:bg-cyan-400/5"
                  >
                    <Plus className="h-3 w-3" />
                    {action}
                  </button>
                </section>
              );
            })}
          </div>
          <p className="mt-4 text-center text-[10px] text-slate-400">
            Counts reflect your saved content. Published status is recorded manually.
          </p>
        </section>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="border-cyan-400/30 bg-[#071222] text-slate-100 max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="hud-label text-cyan-200">{editingId ? "Edit content" : "New content"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveItem();
            }}
            className="space-y-4"
          >
            <label className="block text-xs text-slate-400">
              Title
              <Input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                placeholder="What are you creating?"
                className="mt-1.5 border-slate-700 text-slate-100"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs text-slate-400">
                Channel
                <select
                  value={itemChannel}
                  onChange={(event) => setItemChannel(event.target.value)}
                  className="mt-1.5 w-full h-10 rounded-md border border-slate-700 bg-[#071222] px-2 text-sm text-slate-100"
                >
                  {MEDIA_CHANNELS.map(({ name }) => (
                    <option key={name}>{name}</option>
                  ))}
                  {!MEDIA_CHANNELS.some((entry) => entry.name === itemChannel) && <option>{itemChannel}</option>}
                </select>
              </label>
              <label className="block text-xs text-slate-400">
                Stage
                <select
                  value={stage}
                  onChange={(event) => setStage(event.target.value as MediaStage)}
                  className="mt-1.5 w-full h-10 rounded-md border border-slate-700 bg-[#071222] px-2 text-sm text-slate-100"
                >
                  {MEDIA_STAGES.map((name) => (
                    <option key={name} value={name}>
                      {name === "Published" ? "Published (manual)" : name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs text-slate-400">
              Planned date <span className="text-slate-400">· Optional</span>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1.5 border-slate-700 text-slate-100 [color-scheme:dark]"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Notes / caption
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Outline the idea, draft a caption, or add a checklist…"
                className="mt-1.5 w-full rounded-md border border-slate-700 bg-transparent p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Saving content does not schedule or publish a post on any platform.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                Save content
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="border-cyan-400/30 bg-[#071222] text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete content?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400 break-words">
            Remove “{deleteTarget?.title}” from your planner? This won't remove anything from a social platform.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
