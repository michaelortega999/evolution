import { BrandMark } from "@/components/evolution/BrandMark";
import { ContentWorkbench } from "@/components/evolution/ContentWorkbench";
import { captureOwnerGuard } from "@/lib/owner-guard";
import { applyContentUpdate, archiveContent, isArchived, isValidPlannedDate, restoreContent, setContentStage, STALE_MESSAGE, targetState } from "@/lib/media-content";
function BusinessOverviewRefined() {
  const { data } = useEvolutionData();
  const [selected, setSelected] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const [notice, setNotice] = useState<"Ads" | "Automation" | null>(null);
  const month = localISO().slice(0, 7);
  const monthly = data.revenue.filter((r) => r.date.startsWith(month));
  const active = data.projects.filter((p) => p.status !== "Completed");
  const contentItems = readActiveMediaItems(data);
  const recent = [...data.revenue].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const timeline = [...active]
    .filter((p) => p.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3);
  type HubCard = {
    id: string;
    name: string;
    detail: string;
    section: "workspace" | "social-media" | "content-creator" | "media-system";
    icon: typeof Globe;
    progress?: number;
    evolution?: boolean;
    dashboard?: boolean;
  };
  const cards: HubCard[] = [
    {
      id: "evolution-workspace",
      name: "Evolution OS",
      detail: "Life operating system · workspace",
      section: "workspace",
      icon: Globe,
      evolution: true,
      dashboard: true,
    },
    ...data.projects.map((p) => ({
      id: p.id,
      name: p.name,
      detail: p.status,
      section: "workspace" as const,
      icon: FolderKanban,
      progress: p.progress,
      evolution: /^evolution[\s-]*(os)?$/i.test(p.name.trim()),
    })),
    {
      id: "social",
      name: "Social Media",
      detail: "Plan your publishing",
      section: "social-media",
      icon: Network,
    },
    {
      id: "creator",
      name: "Content Creator",
      detail: "Ideas into content",
      section: "content-creator",
      icon: Clapperboard,
    },
    {
      id: "media",
      name: "Media System",
      detail: "Your content workspace",
      section: "media-system",
      icon: Globe,
    },
  ];
  const index = selected % cards.length;
  const current = cards[index];
  const move = (step: number) => setSelected((index + step + cards.length) % cards.length);
  const actionClass =
    "inline-flex items-center justify-center gap-2 rounded-md border border-cyan-400/30 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200";
  return (
    <ModuleLayout number="07" title="Business Overview" subtitle="Build. Create. Grow." icon={Briefcase}>
      {" "}
      <div className="business-overview space-y-5 text-slate-200">
        {" "}
        <style>{`
          .business-overview .bo-panel{border:1px solid #4bbfff36;border-radius:12px;background:linear-gradient(135deg,#071a2ce8,#030914f5);box-shadow:inset 0 1px 0 #b0eaff0a,0 8px 30px #0003}
          .business-overview .bo-hub{position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 65%,#0965ad33,transparent 62%),linear-gradient(#061220,#020711)}
          .business-overview .bo-hub:before{content:"";position:absolute;inset:45% -20% -70%;background:linear-gradient(#20adff16 1px,transparent 1px),linear-gradient(90deg,#20adff16 1px,transparent 1px);background-size:55px 55px;transform:perspective(350px) rotateX(60deg);pointer-events:none}
          .business-overview .bo-orbit{position:absolute;left:4%;right:4%;height:145px;bottom:100px;border:1px solid #7ddfff99;border-radius:50%;box-shadow:0 0 20px #16acff44,inset 0 0 30px #008cff29;pointer-events:none}
          .business-overview .bo-orbit:after,.business-overview .bo-orbit:before{content:"";position:absolute;inset:16px -3%;border:1px solid #37beff60;border-radius:50%}
          .business-overview .bo-orbit:before{inset:35px 8%;box-shadow:0 0 18px #36c6ff66}
          .business-overview .bo-wheel{--bo-step:clamp(112px,15vw,190px);position:relative;height:365px;margin:14px 0 10px;perspective:1100px;isolation:isolate;touch-action:pan-y;outline-offset:-3px}
          .business-overview .bo-card{position:absolute;top:28px;left:50%;width:220px;height:290px;margin-left:-110px;border:1px solid #36bcff80;border-radius:13px;background:linear-gradient(155deg,#0a2d49f5,#030b18fa);padding:20px 14px;box-shadow:0 22px 32px #0009,inset 0 0 15px #22baff0e;transform:translate3d(calc(var(--bo-offset)*var(--bo-step)),calc(var(--bo-distance)*12px),calc(var(--bo-distance)*-120px)) rotateY(calc(var(--bo-offset)*-18deg));opacity:var(--bo-opacity);z-index:var(--bo-layer);transition:transform .55s cubic-bezier(.2,.75,.25,1),opacity .45s,border-color .3s;user-select:none}
          .business-overview .bo-card[data-active="true"]{border-color:#a2edff;box-shadow:0 0 28px #1caaff55,inset 0 0 24px #24bcff22}
          .business-overview .bo-card:after{content:"";position:absolute;bottom:-12px;left:8%;right:8%;height:4px;border-radius:50%;background:#21bcff;box-shadow:0 0 18px #25c3ff;opacity:.65}
          .business-overview .bo-emblem{height:140px;display:grid;place-items:center;color:#8de5ff;margin-bottom:18px;background:radial-gradient(ellipse,#24acff20,transparent 68%)}
          .business-overview .bo-emblem svg{filter:drop-shadow(0 0 10px #1cafff)}
          .business-overview .bo-bonsai{height:139px;width:100%;object-fit:contain;mix-blend-mode:screen;pointer-events:none;filter:drop-shadow(0 0 9px #1cafff44)}
          .business-overview .bo-card-brand{display:flex;align-items:center;min-height:48px;transform:scale(.85);transform-origin:center top}
          .business-overview .bo-card-brand .text-primary{color:#67e8f9}.business-overview .bo-card-brand .text-brand-ink{color:#e6faff}
          @media(max-width:600px){.business-overview .bo-wheel{--bo-step:125px;height:335px}.business-overview .bo-card{width:200px;margin-left:-100px;height:275px;padding:17px 12px}.business-overview .bo-orbit{bottom:115px;left:-20%;right:-20%}.business-overview .bo-bonsai{height:125px}}
          @media(prefers-reduced-motion:reduce){.business-overview .bo-card{transition:none}}
        `}</style>{" "}
        <nav
          aria-label="Business sections"
          className="flex items-center gap-1 overflow-x-auto border-b border-cyan-400/20 pb-3 text-xs"
        >
          {" "}
          <span aria-current="page" className="rounded-md bg-cyan-400/15 px-4 py-2 text-cyan-200">
            {" "}
            Overview{" "}
          </span>{" "}
          <Link to="/business" search={{ section: "workspace" }} hash="business-projects" className={actionClass}>
            {" "}
            Projects{" "}
          </Link>{" "}
          <Link to="/business" search={{ section: "content-creator" }} className={actionClass}>
            {" "}
            Content{" "}
          </Link>{" "}
          <Link to="/business" search={{ section: "workspace" }} hash="business-revenue" className={actionClass}>
            {" "}
            Sales{" "}
          </Link>{" "}
          <button type="button" onClick={() => setNotice("Ads")} className={actionClass}>
            {" "}
            Ads{" "}
          </button>{" "}
          <Link to="/business" search={{ section: "workspace" }} hash="business-revenue" className={actionClass}>
            {" "}
            Analytics{" "}
          </Link>{" "}
          <button type="button" onClick={() => setNotice("Automation")} className={actionClass}>
            {" "}
            Automation{" "}
          </button>{" "}
        </nav>{" "}
        {notice && (
          <div className="bo-panel flex items-start gap-3 p-4 text-sm" role="status">
            {" "}
            <div className="flex-1">
              {" "}
              <strong className="text-cyan-200"> {notice} — not connected </strong>{" "}
              <p className="mt-1 text-slate-400">
                {" "}
                {notice === "Ads"
                  ? "No live ad account is connected here. The Media System is a separate demo, not your campaign results."
                  : "No live business automations are connected here. Plan work in Tasks; the Media System remains a demo."}{" "}
              </p>{" "}
            </div>{" "}
            <button
              type="button"
              aria-label="Dismiss information"
              onClick={() => setNotice(null)}
              className={actionClass}
            >
              {" "}
              <X size={16} />{" "}
            </button>{" "}
          </div>
        )}{" "}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {" "}
          {[
            {
              label: "Active projects",
              value: String(active.length),
              detail: `${data.projects.length} saved projects`,
              icon: FolderKanban,
            },
            {
              label: "Content pieces",
              value: String(contentItems.length),
              detail: "Saved planner items · all stages",
              icon: Clapperboard,
            },
            {
              label: "Total followers",
              value: "—",
              detail: "Live accounts not connected",
              icon: Users,
            },
            {
              label: "Total views",
              value: "—",
              detail: "Live analytics not connected",
              icon: BarChart3,
            },
            {
              label: "Monthly revenue",
              value: monthly.length ? fmt(monthly.reduce((sum, r) => sum + r.amount, 0)) : "—",
              detail: monthly.length ? "Manually logged · this month" : "No entries this month",
              icon: Target,
            },
          ].map(({ label, value, detail, icon: Icon }) => (
            <section key={label} className="bo-panel min-w-0 p-4 last:col-span-2 lg:last:col-span-1">
              {" "}
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                {" "}
                <span>{label}</span> <Icon size={15} className="shrink-0 text-cyan-300" />{" "}
              </div>{" "}
              <div className="mt-3 text-2xl font-semibold tracking-wide text-cyan-100"> {value} </div>{" "}
              <p className="mt-2 text-[10px] text-slate-400">{detail}</p>{" "}
            </section>
          ))}{" "}
        </div>{" "}
        <section className="bo-panel bo-hub px-3 pb-5 pt-7 text-center sm:px-6" aria-label="Projects hub">
          {" "}
          <p className="text-[10px] uppercase tracking-[.32em] text-cyan-300"> Projects hub </p>{" "}
          <h2 className="mt-3 text-xl font-semibold tracking-[.12em] text-cyan-50 sm:text-3xl">
            {" "}
            BUILD. CREATE. GROW.{" "}
          </h2>{" "}
          <p className="mt-2 text-[10px] uppercase tracking-[.2em] text-slate-400">
            {" "}
            All your projects. One system.{" "}
          </p>{" "}
          <div className="bo-orbit" aria-hidden="true" />{" "}
          <div
            className="bo-wheel focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
            role="region"
            aria-roledescription="carousel"
            aria-label="Rotating project selector"
            tabIndex={0}
            onPointerDown={(e) => {
              swipeStart.current = { x: e.clientX, y: e.clientY };
              suppressClick.current = false;
            }}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
            onPointerUp={(e) => {
              const start = swipeStart.current;
              swipeStart.current = null;
              if (!start) return;
              const dx = e.clientX - start.x;
              const dy = e.clientY - start.y;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                suppressClick.current = true;
                move(dx < 0 ? 1 : -1);
              }
            }}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                e.currentTarget.focus();
                if (e.key === "Home") setSelected(0);
                else if (e.key === "End") setSelected(cards.length - 1);
                else move(e.key === "ArrowLeft" ? -1 : 1);
              }
            }}
          >
            {cards.map((card, position) => {
              let offset = (position - index + cards.length) % cards.length;
              if (offset > cards.length / 2) offset -= cards.length;
              const distance = Math.abs(offset);
              const visible = distance <= 2;
              const Icon = card.icon;
              return (
                <button
                  type="button"
                  key={`${card.dashboard ? "hub" : card.section}-${card.id}`}
                  data-active={offset === 0}
                  className="bo-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                  style={
                    {
                      "--bo-offset": offset,
                      "--bo-distance": distance,
                      "--bo-opacity": visible ? (offset === 0 ? 1 : 0.78) : 0,
                      "--bo-layer": 10 - distance,
                      pointerEvents: visible ? "auto" : "none",
                    } as CSSProperties
                  }
                  tabIndex={offset === 0 ? 0 : -1}
                  aria-hidden={!visible}
                  aria-label={`${card.name}${offset === 0 ? ", selected" : ", select"}`}
                  aria-pressed={offset === 0}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    setSelected(position);
                  }}
                >
                  {card.evolution ? (
                    <>
                      <BrandMark compact className="bo-card-brand" />
                      <img src={hologramSrc("bonsai")} alt="Cyan bonsai tree" draggable={false} className="bo-bonsai" />
                    </>
                  ) : (
                    <span className="bo-emblem">
                      <Icon size={72} strokeWidth={1} />
                    </span>
                  )}
                  <span className="block truncate text-sm font-semibold tracking-wide text-cyan-100">{card.name}</span>
                  <span className="mt-2 block text-[10px] uppercase tracking-wider text-slate-400">{card.detail}</span>
                  {card.progress !== undefined && (
                    <span className="mt-3 block text-[10px] text-cyan-300">{card.progress}% recorded progress</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            {" "}
            <button
              type="button"
              className={actionClass}
              aria-label="Previous project or workspace"
              onClick={() => move(-1)}
            >
              {" "}
              <ArrowLeft size={16} />{" "}
            </button>{" "}
            {current.dashboard ? (
              <Link to="/" className={`${actionClass} bg-cyan-400/10`}>
                Open Evolution OS <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                to="/business"
                search={{ section: current.section }}
                hash={current.section === "workspace" ? `business-project-${current.id}` : undefined}
                className={`${actionClass} bg-cyan-400/10`}
              >
                {" "}
                Open {current.name} <ArrowRight size={14} />{" "}
              </Link>
            )}{" "}
            <button
              type="button"
              className={actionClass}
              aria-label="Next project or workspace"
              onClick={() => move(1)}
            >
              {" "}
              <ArrowRight size={16} />{" "}
            </button>{" "}
          </div>{" "}
          <p aria-live="polite" className="relative mt-3 text-[10px] text-slate-400">
            {" "}
            {index + 1} / {cards.length} · {current.name}{" "}
          </p>{" "}
          {!data.projects.length && (
            <p className="relative mt-2 text-xs text-slate-400">
              {" "}
              No saved projects yet. Select a workspace to get started.{" "}
            </p>
          )}{" "}
        </section>{" "}
        <div className="grid gap-4 lg:grid-cols-3">
          {" "}
          <section className="bo-panel p-5">
            {" "}
            <h2 className="text-xs uppercase tracking-widest text-cyan-200"> Recent activity </h2>{" "}
            <p className="mt-1 text-[10px] text-slate-500"> Latest manually logged revenue </p>{" "}
            <div className="mt-4 space-y-4">
              {" "}
              {recent.length ? (
                recent.map((r) => (
                  <div key={r.id} className="flex justify-between gap-3 text-xs">
                    {" "}
                    <div className="min-w-0">
                      {" "}
                      <p className="truncate text-slate-200">{r.source}</p>{" "}
                      <p className="mt-1 text-[10px] text-slate-500"> {r.date} </p>{" "}
                    </div>{" "}
                    <span className="shrink-0 text-cyan-200"> {fmt(r.amount)} </span>{" "}
                  </div>
                ))
              ) : (
                <p className="text-xs leading-6 text-slate-400">
                  {" "}
                  No revenue entries yet. Log an entry to start your activity history.{" "}
                </p>
              )}{" "}
            </div>{" "}
          </section>{" "}
          <section className="bo-panel p-5">
            {" "}
            <h2 className="text-xs uppercase tracking-widest text-cyan-200"> Project timeline </h2>{" "}
            <div className="mt-4 space-y-4">
              {" "}
              {timeline.length ? (
                timeline.map((p) => (
                  <div key={p.id} className="border-l border-cyan-400/40 pl-3">
                    {" "}
                    <p className="truncate text-xs">{p.name}</p>{" "}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {" "}
                      {p.deadline} · {p.status}{" "}
                    </p>{" "}
                  </div>
                ))
              ) : (
                <p className="text-xs leading-6 text-slate-400">
                  {" "}
                  No active project deadlines recorded. Add a project to build your timeline.{" "}
                </p>
              )}{" "}
            </div>{" "}
          </section>{" "}
          <section className="bo-panel p-5">
            {" "}
            <h2 className="text-xs uppercase tracking-widest text-cyan-200"> Quick actions </h2>{" "}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {" "}
              <Link to="/business" search={{ section: "workspace" }} hash="business-projects" className={actionClass}>
                {" "}
                <Plus size={14} /> Projects{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "workspace" }} hash="business-tasks" className={actionClass}>
                {" "}
                <ListTodo size={14} /> Tasks{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "content-creator" }} className={actionClass}>
                {" "}
                <Clapperboard size={14} /> Create{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "social-media" }} className={actionClass}>
                {" "}
                <Network size={14} /> Social{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "workspace" }} hash="business-revenue" className={actionClass}>
                {" "}
                Log revenue{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "media-system" }} className={actionClass}>
                {" "}
                Media demo{" "}
              </Link>{" "}
            </div>{" "}
          </section>{" "}
        </div>{" "}
      </div>{" "}
    </ModuleLayout>
  );
}

import { localISO } from "@/lib/utils";
import { toast } from "sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
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
  Database,
  Users,
  ShoppingCart,
  Bot,
  BrainCircuit,
  Mail,
  Target,
  BarChart3,
  Zap,
  Clock3,
  ChevronRight,
  Infinity as InfinityIcon,
  ListTodo,
  Clapperboard,
  Image as ImageIcon,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { hologramSrc } from "@/lib/holograms";
import type { CSSProperties, ReactNode } from "react";
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
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    section?: "workspace" | "social-media" | "media-system" | "marketing-system" | "content-creator";
    channel?: string;
  } => ({
    section:
      search.section === "workspace" ||
      search.section === "social-media" ||
      search.section === "media-system" ||
      search.section === "marketing-system" ||
      search.section === "content-creator"
        ? search.section
        : undefined,
    channel:
      typeof search.channel === "string" &&
      ["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "Other"].includes(search.channel)
        ? search.channel
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
  const { section, channel } = Route.useSearch();
  // Account swap: drop open editors, drafts, save status and pending Undo toasts by remounting.
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const reset = () => {
      toast.dismiss();
      setGeneration((g) => g + 1);
    };
    window.addEventListener("evolution:owner-changing", reset);
    window.addEventListener("evolution:owner-changed", reset);
    return () => {
      window.removeEventListener("evolution:owner-changing", reset);
      window.removeEventListener("evolution:owner-changed", reset);
    };
  }, []);
  if (section === "social-media") return <SocialMediaPage key={`${generation}:${channel ?? "all"}`} />;
  if (section === "media-system" || section === "marketing-system") return <MediaSystemPage key={generation} />;
  if (section === "content-creator") return <ContentCreatorPage key={generation} />;
  if (section === "workspace") return <BusinessPage key={generation} />;
  return <BusinessOverviewRefined key={generation} />;
}
function BusinessOverview() {
  const { data } = useEvolutionData();
  const [selected, setSelected] = useState(0);
  const [notice, setNotice] = useState<"Ads" | "Automation" | null>(null);
  const month = localISO().slice(0, 7);
  const monthly = data.revenue.filter((r) => r.date.startsWith(month));
  const active = data.projects.filter((p) => p.status !== "Completed");
  const contentItems = readActiveMediaItems(data);
  const recent = [...data.revenue].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const timeline = [...active]
    .filter((p) => p.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3);
  type HubCard = {
    id: string;
    name: string;
    detail: string;
    section: "workspace" | "social-media" | "content-creator" | "media-system";
    icon: typeof Globe;
    progress?: number;
  };
  const cards: HubCard[] = [
    ...data.projects.map((p) => ({
      id: p.id,
      name: p.name,
      detail: p.status,
      section: "workspace" as const,
      icon: FolderKanban,
      progress: p.progress,
    })),
    { id: "social", name: "Social Media", detail: "Plan your publishing", section: "social-media", icon: Network },
    {
      id: "creator",
      name: "Content Creator",
      detail: "Ideas into content",
      section: "content-creator",
      icon: Clapperboard,
    },
    { id: "media", name: "Media System", detail: "Your content workspace", section: "media-system", icon: Globe },
  ];
  const index = selected % cards.length;
  const current = cards[index];
  const move = (step: number) => setSelected((index + step + cards.length) % cards.length);
  const actionClass =
    "inline-flex items-center justify-center gap-2 rounded-md border border-cyan-400/30 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200";
  return (
    <ModuleLayout number="07" title="Business Overview" subtitle="Build. Create. Grow." icon={Briefcase}>
      {" "}
      <div className="business-overview space-y-5 text-slate-200">
        {" "}
        <style>{`           .business-overview .bo-panel{border:1px solid #4bbfff36;border-radius:12px;background:linear-gradient(135deg,#071a2ce8,#030914f5);box-shadow:inset 0 1px 0 #b0eaff0a,0 8px 30px #0003}           .business-overview .bo-hub{position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 73%,#0965ad33,transparent 62%),linear-gradient(#061220,#020711)}           .business-overview .bo-orbit{position:absolute;left:10%;right:10%;height:100px;bottom:58px;border:1px solid #37beff70;border-radius:50%;box-shadow:0 0 16px #16acff24,inset 0 0 20px #008cff19;pointer-events:none}           .business-overview .bo-orbit:after{content:"";position:absolute;inset:18px -8%;border:1px solid #37beff35;border-radius:50%}           .business-overview .bo-card{position:relative;flex:0 0 min(58%,250px);min-width:0;min-height:210px;border:1px solid #36bcff4a;border-radius:12px;background:linear-gradient(155deg,#0a2d49ed,#040c19);padding:22px 14px;transition:transform .25s,opacity .25s;box-shadow:0 18px 35px #0008}           .business-overview .bo-card[data-active="true"]{transform:translateY(-13px);border-color:#65d6ff;box-shadow:0 0 28px #1caaff38,inset 0 0 24px #24bcff12}           .business-overview .bo-card[data-active="false"]{opacity:.64;transform:scale(.9) rotateY(12deg)}           .business-overview .bo-hub:before{content:"";position:absolute;inset:45% -20% -70%;background:linear-gradient(#20adff16 1px,transparent 1px),linear-gradient(90deg,#20adff16 1px,transparent 1px);background-size:55px 55px;transform:perspective(350px) rotateX(60deg);pointer-events:none}           @keyframes bo-arrive{from{opacity:.25;translate:18px 0}to{opacity:1;translate:0 0}}           @media(prefers-reduced-motion:no-preference){.business-overview .bo-card[data-active="true"]{animation:bo-arrive .3s ease-out}}           .business-overview .bo-emblem{height:82px;width:82px;margin:0 auto 18px;display:grid;place-items:center;color:#8de5ff;border:1px solid #48caff70;border-radius:22px;background:radial-gradient(circle,#24acff30,transparent);box-shadow:0 0 28px #159bff24;transform:rotate(-7deg)}           .business-overview .bo-emblem svg{transform:rotate(7deg);filter:drop-shadow(0 0 7px #1cafff)}           @media(max-width:600px){.business-overview .bo-card{flex-basis:72%;min-height:195px}.business-overview .bo-card[data-active="false"]{display:none}.business-overview .bo-orbit{left:2%;right:2%}}           @media(prefers-reduced-motion:reduce){.business-overview .bo-card{transition:none}}         `}</style>{" "}
        <nav
          aria-label="Business sections"
          className="flex items-center gap-1 overflow-x-auto border-b border-cyan-400/20 pb-3 text-xs"
        >
          {" "}
          <span aria-current="page" className="rounded-md bg-cyan-400/15 px-4 py-2 text-cyan-200">
            {" "}
            Overview{" "}
          </span>{" "}
          <Link to="/business" search={{ section: "workspace" }} hash="business-projects" className={actionClass}>
            {" "}
            Projects{" "}
          </Link>{" "}
          <Link to="/business" search={{ section: "content-creator" }} className={actionClass}>
            {" "}
            Content{" "}
          </Link>{" "}
          <Link to="/business" search={{ section: "workspace" }} hash="business-revenue" className={actionClass}>
            {" "}
            Sales{" "}
          </Link>{" "}
          <button type="button" onClick={() => setNotice("Ads")} className={actionClass}>
            {" "}
            Ads{" "}
          </button>{" "}
          <Link to="/business" search={{ section: "workspace" }} hash="business-revenue" className={actionClass}>
            {" "}
            Analytics{" "}
          </Link>{" "}
          <button type="button" onClick={() => setNotice("Automation")} className={actionClass}>
            {" "}
            Automation{" "}
          </button>{" "}
        </nav>{" "}
        {notice && (
          <div className="bo-panel flex items-start gap-3 p-4 text-sm" role="status">
            {" "}
            <div className="flex-1">
              {" "}
              <strong className="text-cyan-200"> {notice} — not connected </strong>{" "}
              <p className="mt-1 text-slate-400">
                {" "}
                {notice === "Ads"
                  ? "No live ad account is connected here. The Media System is a separate demo, not your campaign results."
                  : "No live business automations are connected here. Plan work in Tasks; the Media System remains a demo."}{" "}
              </p>{" "}
            </div>{" "}
            <button
              type="button"
              aria-label="Dismiss information"
              onClick={() => setNotice(null)}
              className={actionClass}
            >
              {" "}
              <X size={16} />{" "}
            </button>{" "}
          </div>
        )}{" "}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {" "}
          {[
            {
              label: "Active projects",
              value: String(active.length),
              detail: `${data.projects.length} saved projects`,
              icon: FolderKanban,
            },
            {
              label: "Content pieces",
              value: String(contentItems.length),
              detail: "Saved planner items · all stages",
              icon: Clapperboard,
            },
            { label: "Total followers", value: "—", detail: "Live accounts not connected", icon: Users },
            { label: "Total views", value: "—", detail: "Live analytics not connected", icon: BarChart3 },
            {
              label: "Monthly revenue",
              value: monthly.length ? fmt(monthly.reduce((sum, r) => sum + r.amount, 0)) : "—",
              detail: monthly.length ? "Manually logged · this month" : "No entries this month",
              icon: Target,
            },
          ].map(({ label, value, detail, icon: Icon }) => (
            <section key={label} className="bo-panel min-w-0 p-4 last:col-span-2 lg:last:col-span-1">
              {" "}
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                {" "}
                <span>{label}</span> <Icon size={15} className="shrink-0 text-cyan-300" />{" "}
              </div>{" "}
              <div className="mt-3 text-2xl font-semibold tracking-wide text-cyan-100"> {value} </div>{" "}
              <p className="mt-2 text-[10px] text-slate-400">{detail}</p>{" "}
            </section>
          ))}{" "}
        </div>{" "}
        <section className="bo-panel bo-hub px-3 pb-5 pt-7 text-center sm:px-6" aria-label="Projects hub">
          {" "}
          <p className="text-[10px] uppercase tracking-[.32em] text-cyan-300"> Projects hub </p>{" "}
          <h2 className="mt-3 text-xl font-semibold tracking-[.12em] text-cyan-50 sm:text-3xl">
            {" "}
            BUILD. CREATE. GROW.{" "}
          </h2>{" "}
          <p className="mt-2 text-[10px] uppercase tracking-[.2em] text-slate-400">
            {" "}
            All your projects. One system.{" "}
          </p>{" "}
          <div className="bo-orbit" aria-hidden="true" />{" "}
          <div
            className="relative my-8 flex min-h-[225px] items-center justify-center gap-2 sm:gap-5"
            aria-roledescription="carousel"
            aria-label="Projects and workspaces"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                e.currentTarget.focus();
                move(-1);
              }
              if (e.key === "ArrowRight") {
                e.preventDefault();
                e.currentTarget.focus();
                move(1);
              }
            }}
          >
            {" "}
            {[-1, 0, 1].map((offset) => {
              const position = (index + offset + cards.length) % cards.length;
              const card = cards[position];
              const Icon = card.icon;
              return (
                <button
                  type="button"
                  key={`${card.id}-${offset}-${index}`}
                  data-active={offset === 0}
                  className="bo-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                  aria-label={`${card.name}${offset === 0 ? ", selected" : ", select workspace"}`}
                  aria-pressed={offset === 0}
                  onClick={() => setSelected(position)}
                >
                  {" "}
                  <span className="bo-emblem">
                    {" "}
                    <Icon size={42} strokeWidth={1.1} />{" "}
                  </span>{" "}
                  <span className="block truncate text-sm font-semibold tracking-wide text-cyan-100">
                    {" "}
                    {card.name}{" "}
                  </span>{" "}
                  <span className="mt-2 block text-[10px] uppercase tracking-wider text-slate-400">
                    {" "}
                    {card.detail}{" "}
                  </span>{" "}
                  {card.progress !== undefined && (
                    <span className="mt-3 block text-[10px] text-cyan-300"> {card.progress}% recorded progress </span>
                  )}{" "}
                </button>
              );
            })}{" "}
          </div>{" "}
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            {" "}
            <button
              type="button"
              className={actionClass}
              aria-label="Previous project or workspace"
              onClick={() => move(-1)}
            >
              {" "}
              <ArrowLeft size={16} />{" "}
            </button>{" "}
            <Link
              to="/business"
              search={{ section: current.section }}
              hash={current.section === "workspace" ? `business-project-${current.id}` : undefined}
              className={`${actionClass} bg-cyan-400/10`}
            >
              {" "}
              Open {current.name} <ArrowRight size={14} />{" "}
            </Link>{" "}
            <button
              type="button"
              className={actionClass}
              aria-label="Next project or workspace"
              onClick={() => move(1)}
            >
              {" "}
              <ArrowRight size={16} />{" "}
            </button>{" "}
          </div>{" "}
          <p aria-live="polite" className="relative mt-3 text-[10px] text-slate-400">
            {" "}
            {index + 1} / {cards.length} · {current.name}{" "}
          </p>{" "}
          {!data.projects.length && (
            <p className="relative mt-2 text-xs text-slate-400">
              {" "}
              No saved projects yet. Your existing workspaces are ready below.{" "}
            </p>
          )}{" "}
        </section>{" "}
        <div className="grid gap-4 lg:grid-cols-3">
          {" "}
          <section className="bo-panel p-5">
            {" "}
            <h2 className="text-xs uppercase tracking-widest text-cyan-200"> Recent activity </h2>{" "}
            <p className="mt-1 text-[10px] text-slate-500"> Latest manually logged revenue </p>{" "}
            <div className="mt-4 space-y-4">
              {" "}
              {recent.length ? (
                recent.map((r) => (
                  <div key={r.id} className="flex justify-between gap-3 text-xs">
                    {" "}
                    <div className="min-w-0">
                      {" "}
                      <p className="truncate text-slate-200">{r.source}</p>{" "}
                      <p className="mt-1 text-[10px] text-slate-500"> {r.date} </p>{" "}
                    </div>{" "}
                    <span className="shrink-0 text-cyan-200"> {fmt(r.amount)} </span>{" "}
                  </div>
                ))
              ) : (
                <p className="text-xs leading-6 text-slate-400">
                  {" "}
                  No revenue entries yet. Log an entry to start your activity history.{" "}
                </p>
              )}{" "}
            </div>{" "}
          </section>{" "}
          <section className="bo-panel p-5">
            {" "}
            <h2 className="text-xs uppercase tracking-widest text-cyan-200"> Project timeline </h2>{" "}
            <div className="mt-4 space-y-4">
              {" "}
              {timeline.length ? (
                timeline.map((p) => (
                  <div key={p.id} className="border-l border-cyan-400/40 pl-3">
                    {" "}
                    <p className="truncate text-xs">{p.name}</p>{" "}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {" "}
                      {p.deadline} · {p.status}{" "}
                    </p>{" "}
                  </div>
                ))
              ) : (
                <p className="text-xs leading-6 text-slate-400">
                  {" "}
                  No active project deadlines recorded. Add a project to build your timeline.{" "}
                </p>
              )}{" "}
            </div>{" "}
          </section>{" "}
          <section className="bo-panel p-5">
            {" "}
            <h2 className="text-xs uppercase tracking-widest text-cyan-200"> Quick actions </h2>{" "}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {" "}
              <Link to="/business" search={{ section: "workspace" }} hash="business-projects" className={actionClass}>
                {" "}
                <Plus size={14} /> Projects{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "workspace" }} hash="business-tasks" className={actionClass}>
                {" "}
                <ListTodo size={14} /> Tasks{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "content-creator" }} className={actionClass}>
                {" "}
                <Clapperboard size={14} /> Create{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "social-media" }} className={actionClass}>
                {" "}
                <Network size={14} /> Social{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "workspace" }} hash="business-revenue" className={actionClass}>
                {" "}
                Log revenue{" "}
              </Link>{" "}
              <Link to="/business" search={{ section: "media-system" }} className={actionClass}>
                {" "}
                Media demo{" "}
              </Link>{" "}
            </div>{" "}
          </section>{" "}
        </div>{" "}
      </div>{" "}
    </ModuleLayout>
  );
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
    mutate((prev) => ({
      bizTasks: prev.bizTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
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
    <ModuleLayout number="07" title="Business Workspace" subtitle="Projects · Revenue · Execution" icon={Briefcase}>
      {" "}
      <Link
        to="/business"
        search={{}}
        className="inline-flex items-center gap-2 text-xs text-cyan-300 hover:text-cyan-100"
      >
        <ArrowLeft size={14} /> Back to Business Overview
      </Link>
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
              <div key={p.id} id={`business-project-${p.id}`} className="hud-card p-4 group relative scroll-mt-6">
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
          <div id="business-revenue" className="scroll-mt-6" />
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
          <div id="business-tasks" className="scroll-mt-6" />
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
  projectId?: string;
  archivedAt?: string;
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

/** Active (non-archived) content for boards, calendars and counts. Writes still use the full list. */
function readActiveMediaItems(data: EvolutionData): MediaItem[] {
  return readMediaItems(data).filter((item) => !isArchived(item));
}

const MEDIA_WORKSPACE_CSS = `
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
      `;

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
          // Unparsable raw entries and archived rows are always carried through.
          mediaItems: applyContentUpdate(mediaRecord(phoneData.biz).mediaItems, (all) =>
            update(all as MediaItem[]),
          ),
        },
      },
    },
  };
}

/** Stage/archive/restore with stale-target and storage-failure handling; returns true only on a real write. */
function runMediaAction(
  mutate: (fn: (prev: EvolutionData) => Partial<EvolutionData>) => void,
  id: string,
  action: "stage" | "archive" | "restore",
  stage?: MediaStage,
): boolean {
  let problem = "";
  try {
    mutate((prev) => {
      const state = targetState(readMediaItems(prev), id);
      const expected = action === "restore" ? "archived" : "active";
      if (state !== expected) {
        problem = state === "missing" ? STALE_MESSAGE.missing : action === "restore" ? "That content is already active." : STALE_MESSAGE.archived;
        return {};
      }
      return mediaPatch(prev, (current) =>
        action === "stage"
          ? (setContentStage(current, id, stage ?? "Idea").items as MediaItem[])
          : action === "archive"
            ? (archiveContent(current, id, new Date().toISOString()) as MediaItem[])
            : (restoreContent(current, id) as MediaItem[]),
      );
    });
  } catch {
    problem = "Couldn't save on this device (storage may be full or blocked). Nothing was changed.";
  }
  if (problem) toast.error(problem);
  return !problem;
}

function SocialMediaPage() {
  const { data, mutate } = useEvolutionData();
  const items = readActiveMediaItems(data);
  const { channel: initialChannel } = Route.useSearch();
  const [channel, setChannel] = useState(initialChannel ?? "All");
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
    if (!isValidPlannedDate(date)) {
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
        if (editingId && !readActiveMediaItems(prev).some((record) => record.id === editingId)) {
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
      toast.error("This content was removed or archived elsewhere. Copy your changes before closing.");
      return;
    }
    setEditorOpen(false);
  };
  const moveItem = (id: string, nextStage: MediaStage) => {
    runMediaAction(mutate, id, "stage", nextStage);
  };
  const deleteItem = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const owner = captureOwnerGuard(getLocalOwner);
    if (!runMediaAction(mutate, target.id, "archive")) return; // keep the confirm open on failure
    setDeleteTarget(null);
    toast(`Archived “${target.title}”. Restore it any time from Archived in the Media System workbench.`, {
      action: {
        label: "Undo",
        onClick: () =>
          void owner.run(
            () => runMediaAction(mutate, target.id, "restore"),
            () => toast.error("You switched accounts, so this Undo no longer applies."),
          ),
      },
    });
  };

  return (
    <ModuleLayout number="07" title="Social Media" subtitle="Business · Content command center" icon={Network}>
      <style>{MEDIA_WORKSPACE_CSS}</style>
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
          <Link
            to="/business"
            search={{ section: "media-system" }}
            className="evo-surface media-panel media-card-link block p-6 group"
          >
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
              Open your visual command center for channels, campaigns, and content. Your saved planner stays one click
              away.
            </p>
            <div className="mt-6 flex items-end justify-between gap-3 border-t border-cyan-400/15 pt-4">
              <div>
                <span className="hud-label text-2xl text-cyan-200">{items.length}</span>
                <span className="ml-2 text-xs text-slate-400">content items</span>
              </div>
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
                              aria-label={`Archive ${item.title}`}
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
            <DialogTitle>Archive content?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400 break-words">
            Archive “{deleteTarget?.title}”? It leaves your board but can be restored from Archived. Nothing changes on any social platform.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button onClick={deleteItem}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

// ============= Content Creator hub (second page of the Media System) =============
// Reuses the same account-scoped planner records (phoneStore biz.mediaItems) so
// desktop/phone three-way merge keeps working with no new schema.

type ContentGoal = { id: string; label: string; target: number; current: number };

function readContentGoals(data: EvolutionData): ContentGoal[] {
  const goals = mediaRecord(data.phoneStore?.data?.biz).contentGoals;
  if (!Array.isArray(goals)) return [];
  return goals.flatMap((value) => {
    const goal = mediaRecord(value);
    if (typeof goal.id !== "string" || typeof goal.label !== "string") return [];
    return [
      {
        id: goal.id,
        label: goal.label,
        target: typeof goal.target === "number" && goal.target > 0 ? goal.target : 1,
        current: typeof goal.current === "number" && goal.current >= 0 ? goal.current : 0,
      },
    ];
  });
}

function bizPatch(
  data: EvolutionData,
  update: (biz: Record<string, unknown>) => Record<string, unknown>,
): Partial<EvolutionData> {
  const phoneData = data.phoneStore?.data ?? {};
  return {
    phoneStore: {
      v: data.phoneStore?.v ?? 1,
      data: { ...phoneData, biz: update(mediaRecord(phoneData.biz)) },
    },
  };
}

const CC_WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const CC_MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

function ccFmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function ContentCreatorPage() {
  const { data, mutate } = useEvolutionData();
  const items = readActiveMediaItems(data);
  const goals = readContentGoals(data);
  const today = todayDate();

  // Calendar state
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Library state
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"All" | MediaStage>("All");

  // Editor dialog state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const submitGuard = useRef(false);
  const newItemId = useRef<string | null>(null);
  const [title, setTitle] = useState("");
  const [itemChannel, setItemChannel] = useState("TikTok");
  const [stage, setStage] = useState<MediaStage>("Idea");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  // Goal dialog state
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalEditId, setGoalEditId] = useState<string | null>(null);
  const goalGuard = useRef(false);
  const [goalLabel, setGoalLabel] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");

  const monthKey = `${view.year}-${String(view.month + 1).padStart(2, "0")}`;
  const publishedThisMonth = items.filter(
    (item) => item.stage === "Published" && item.date.startsWith(monthKey),
  ).length;
  const inPipeline = items.filter((item) => item.stage !== "Published").length;

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const prevMonthDays = new Date(view.year, view.month, 0).getDate();
    const arr: { date: string; day: number; outside: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = view.month - 1;
      arr.push({ date: ccFmtDate(m < 0 ? view.year - 1 : view.year, (m + 12) % 12, d), day: d, outside: true });
    }
    for (let d = 1; d <= daysInMonth; d++)
      arr.push({ date: ccFmtDate(view.year, view.month, d), day: d, outside: false });
    let idx = 1;
    while (arr.length < 42) {
      const m = view.month + 1;
      arr.push({ date: ccFmtDate(m > 11 ? view.year + 1 : view.year, m % 12, idx), day: idx, outside: true });
      idx++;
    }
    return arr;
  }, [view]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, MediaItem[]>();
    for (const item of items) {
      if (!item.date) continue;
      if (!map.has(item.date)) map.set(item.date, []);
      map.get(item.date)!.push(item);
    }
    return map;
  }, [items]);

  const visibleItems = items
    .filter(
      (item) =>
        (stageFilter === "All" || item.stage === stageFilter) &&
        `${item.title} ${item.notes ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  const navigateMonth = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      if (m < 0) return { year: v.year - 1, month: 11 };
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: m };
    });
  };
  const goToday = () => {
    const now = new Date();
    setView({ year: now.getFullYear(), month: now.getMonth() });
  };

  const openEditor = (item?: MediaItem, initialStage: MediaStage = "Idea", initialDate = "") => {
    submitGuard.current = false;
    newItemId.current = item?.id ?? uid();
    setEditingId(item?.id ?? null);
    setTitle(item?.title ?? "");
    setItemChannel(item?.channel ?? "TikTok");
    setStage(item?.stage ?? initialStage);
    setDate(item?.date ?? initialDate);
    setNotes(item?.notes ?? "");
    setEditorOpen(true);
  };

  const saveItem = () => {
    if (submitGuard.current) return;
    if (!title.trim()) {
      toast.error("Give your content a title.");
      return;
    }
    if (!isValidPlannedDate(date)) {
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
        if (editingId && !readActiveMediaItems(prev).some((record) => record.id === editingId)) {
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
      toast.error("This content was removed or archived elsewhere. Copy your changes before closing.");
      return;
    }
    setEditorOpen(false);
  };

  const moveItem = (id: string, nextStage: MediaStage) => {
    runMediaAction(mutate, id, "stage", nextStage);
  };

  const deleteItem = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const owner = captureOwnerGuard(getLocalOwner);
    if (!runMediaAction(mutate, target.id, "archive")) return; // keep the confirm open on failure
    setDeleteTarget(null);
    toast(`Archived “${target.title}”. Restore it any time from Archived in the Media System workbench.`, {
      action: {
        label: "Undo",
        onClick: () =>
          void owner.run(
            () => runMediaAction(mutate, target.id, "restore"),
            () => toast.error("You switched accounts, so this Undo no longer applies."),
          ),
      },
    });
  };

  const notBuiltYet = (feature: string) => {
    toast.info(
      `${feature} isn't built into Evolution yet. Create it in your usual editor, then log it here as Ready or Published so your plan stays accurate.`,
    );
  };

  const openGoalEditor = (goal?: ContentGoal) => {
    goalGuard.current = false;
    setGoalEditId(goal?.id ?? null);
    setGoalLabel(goal?.label ?? "");
    setGoalTarget(goal ? String(goal.target) : "");
    setGoalCurrent(goal ? String(goal.current) : "");
    setGoalOpen(true);
  };

  const saveGoal = () => {
    if (goalGuard.current) return;
    if (!goalLabel.trim()) {
      toast.error("Give your goal a name.");
      return;
    }
    const target = Number(goalTarget);
    const current = goalCurrent.trim() === "" ? 0 : Number(goalCurrent);
    if (!Number.isFinite(target) || target <= 0) {
      toast.error("Target must be a number above zero.");
      return;
    }
    if (!Number.isFinite(current) || current < 0) {
      toast.error("Progress must be zero or more.");
      return;
    }
    goalGuard.current = true;
    const id = goalEditId ?? uid();
    try {
      mutate((prev) =>
        bizPatch(prev, (biz) => {
          const current2 = readContentGoals(prev);
          const next: ContentGoal = { id, label: goalLabel.trim(), target, current };
          return {
            ...biz,
            contentGoals: goalEditId
              ? current2.map((goal) => (goal.id === goalEditId ? next : goal))
              : [...current2, next],
          };
        }),
      );
    } catch {
      goalGuard.current = false;
      toast.error("Goal could not be saved. Please try again.");
      return;
    }
    setGoalOpen(false);
  };

  const deleteGoal = (id: string) => {
    mutate((prev) =>
      bizPatch(prev, (biz) => ({ ...biz, contentGoals: readContentGoals(prev).filter((goal) => goal.id !== id) })),
    );
  };

  return (
    <ModuleLayout number="07" title="Content Creator" subtitle="Business · Creator studio" icon={Clapperboard}>
      {" "}
      <style>{`@media(max-width:767px){main:has(.creator-page) > div:first-child h1{font-size:16px;letter-spacing:1px;overflow-wrap:anywhere}main:has(.creator-page){padding-bottom:90px}.creator-back-desktop{display:none}}@media(min-width:768px){.creator-back-phone{display:none}}`}</style>
      <style>{MEDIA_WORKSPACE_CSS}</style>
      <div className="media-workspace creator-page space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/business"
            search={{ section: "media-system" }}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> <span className="creator-back-desktop">Back to Media System</span>
            <span className="creator-back-phone">Back to mobile workspace</span>
          </Link>
          <span className="hud-label text-[9px] tracking-widest text-cyan-300/60">
            Ideas · Plan · Shoot · Edit · Post · Grow
          </span>
        </div>

        {/* Studio banner — counts are real derived totals from your saved content */}
        <section
          className="evo-surface media-panel media-grid overflow-hidden p-6 md:p-7"
          aria-label="Creator studio summary"
        >
          <div
            className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-cyan-400/10"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="hud-label text-[9px] tracking-[.3em] text-cyan-300 mb-3">Evolution / Creator studio</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-100">
                Plan it. Shoot it. Post it.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-400">
                Your content calendar, library, and pipeline — built from the records you save here.
              </p>
            </div>
            <div className="flex items-center gap-5 rounded-lg border border-cyan-400/15 bg-[#030b16]/70 px-5 py-3">
              <div>
                <div className="hud-label text-xl text-cyan-200">{items.length}</div>
                <div className="hud-label text-[8px] tracking-widest text-slate-400 mt-1">Saved items</div>
              </div>
              <div className="h-8 w-px bg-cyan-400/15" />
              <div>
                <div className="hud-label text-xl text-cyan-200">{inPipeline}</div>
                <div className="hud-label text-[8px] tracking-widest text-slate-400 mt-1">In pipeline</div>
              </div>
              <div className="h-8 w-px bg-cyan-400/15" />
              <div>
                <div className="hud-label text-xl text-cyan-200">{publishedThisMonth}</div>
                <div className="hud-label text-[8px] tracking-widest text-slate-400 mt-1">Posted this month</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
          {/* Content calendar */}
          <section className="evo-surface media-panel p-5" aria-label="Content calendar">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="hud-label text-xs text-cyan-200 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-300" /> Content calendar
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className="h-7 w-7 rounded border border-cyan-400/20 flex items-center justify-center text-cyan-300 hover:bg-cyan-400/10"
                  aria-label="Previous month"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <span className="hud-label text-[10px] text-cyan-100 tracking-widest min-w-28 text-center">
                  {CC_MONTHS[view.month]} {view.year}
                </span>
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className="h-7 w-7 rounded border border-cyan-400/20 flex items-center justify-center text-cyan-300 hover:bg-cyan-400/10"
                  aria-label="Next month"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={goToday}
                  className="h-7 px-2 rounded border border-cyan-400/20 hud-label text-[9px] text-cyan-300 hover:bg-cyan-400/10"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => openEditor(undefined, "Idea", today)}
                  className="h-7 px-2 rounded border border-cyan-400/40 bg-cyan-400/10 hud-label text-[9px] text-cyan-100 hover:bg-cyan-400/20 inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {CC_WEEKDAYS.map((d) => (
                <div key={d} className="hud-label text-[8px] text-slate-500 text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell) => {
                const dayItems = itemsByDate.get(cell.date) ?? [];
                const isToday = cell.date === today;
                return (
                  <button
                    key={cell.date + (cell.outside ? "o" : "")}
                    type="button"
                    onClick={() => openEditor(undefined, "Idea", cell.date)}
                    className={[
                      "min-h-14 md:min-h-16 rounded border p-1 text-left align-top transition-colors overflow-hidden",
                      cell.outside
                        ? "border-transparent opacity-40"
                        : "border-cyan-400/15 hover:border-cyan-300/50 hover:bg-cyan-400/5",
                      isToday ? "border-cyan-300/70 bg-cyan-400/10" : "",
                    ].join(" ")}
                  >
                    <span className={`hud-label text-[9px] ${isToday ? "text-cyan-200" : "text-slate-400"}`}>
                      {cell.day}
                    </span>
                    <span className="block space-y-0.5 mt-0.5">
                      {dayItems.slice(0, 2).map((item) => {
                        const meta = MEDIA_CHANNELS.find((entry) => entry.name === item.channel);
                        return (
                          <span
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditor(item);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.stopPropagation();
                                openEditor(item);
                              }
                            }}
                            className="block truncate rounded px-1 py-0.5 text-[9px] text-slate-200 hover:bg-cyan-400/15"
                            style={{ borderLeft: `2px solid ${meta?.color ?? "#22d3ee"}` }}
                          >
                            {item.title}
                          </span>
                        );
                      })}
                      {dayItems.length > 2 && (
                        <span className="block hud-label text-[8px] text-cyan-300/70 px-1">
                          +{dayItems.length - 2} more
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick actions + platforms */}
          <div className="space-y-5">
            <section className="evo-surface media-panel p-5" aria-label="Quick actions">
              <h3 className="hud-label text-xs text-cyan-200 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-300" /> Quick actions
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => openEditor(undefined, "Idea")}
                  className="w-full rounded border border-cyan-400/20 px-3 py-2 text-left text-xs text-slate-200 hover:bg-cyan-400/10 inline-flex items-center gap-2"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-cyan-300" /> New video idea
                </button>
                <button
                  type="button"
                  onClick={() => openEditor(undefined, "Idea", today)}
                  className="w-full rounded border border-cyan-400/20 px-3 py-2 text-left text-xs text-slate-200 hover:bg-cyan-400/10 inline-flex items-center gap-2"
                >
                  <CalendarDays className="h-3.5 w-3.5 text-cyan-300" /> Plan on calendar
                </button>
                <button
                  type="button"
                  onClick={() => openEditor(undefined, "Draft")}
                  className="w-full rounded border border-cyan-400/20 px-3 py-2 text-left text-xs text-slate-200 hover:bg-cyan-400/10 inline-flex items-center gap-2"
                >
                  <Pencil className="h-3.5 w-3.5 text-cyan-300" /> Write script / notes
                </button>
                <button
                  type="button"
                  onClick={() => notBuiltYet("Video upload")}
                  className="w-full rounded border border-cyan-400/10 px-3 py-2 text-left text-xs text-slate-500 hover:bg-cyan-400/5 inline-flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" /> Upload video{" "}
                  <span className="ml-auto hud-label text-[8px] text-slate-500">not built in</span>
                </button>
                <button
                  type="button"
                  onClick={() => notBuiltYet("Video editing")}
                  className="w-full rounded border border-cyan-400/10 px-3 py-2 text-left text-xs text-slate-500 hover:bg-cyan-400/5 inline-flex items-center gap-2"
                >
                  <Clapperboard className="h-3.5 w-3.5" /> Edit video{" "}
                  <span className="ml-auto hud-label text-[8px] text-slate-500">not built in</span>
                </button>
                <button
                  type="button"
                  onClick={() => notBuiltYet("Thumbnail creation")}
                  className="w-full rounded border border-cyan-400/10 px-3 py-2 text-left text-xs text-slate-500 hover:bg-cyan-400/5 inline-flex items-center gap-2"
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Create thumbnail{" "}
                  <span className="ml-auto hud-label text-[8px] text-slate-500">not built in</span>
                </button>
              </div>
            </section>

            <section className="evo-surface media-panel p-5" aria-label="Platforms">
              <h3 className="hud-label text-xs text-cyan-200 mb-1 flex items-center gap-2">
                <Network className="h-4 w-4 text-cyan-300" /> Platforms
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">
                No platform accounts are connected, so there are no live follower or view stats. Counts below are your
                saved content items.
              </p>
              <div className="space-y-2">
                {MEDIA_CHANNELS.map(({ name, icon: Icon, color }) => {
                  const count = items.filter((item) => item.channel === name).length;
                  const status =
                    name === "TikTok" ? "Current platform" : name === "Instagram" ? "Planned next" : "Not connected";
                  return (
                    <div key={name} className="flex items-center gap-3 rounded border border-cyan-400/10 px-3 py-2">
                      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
                      <div className="min-w-0">
                        <div className="text-xs text-slate-200">{name}</div>
                        <div className="hud-label text-[8px] text-slate-500">{status}</div>
                      </div>
                      <span className="ml-auto hud-label text-[10px] text-cyan-200 whitespace-nowrap">
                        {count} saved
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* Production pipeline */}
        <section className="evo-surface media-panel p-5" aria-label="Production pipeline">
          <h3 className="hud-label text-xs text-cyan-200 mb-3 flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-cyan-300" /> Production pipeline
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MEDIA_STAGE_META.map(({ name, icon: Icon, color, hint, action }) => {
              const stageItems = items.filter((item) => item.stage === name);
              return (
                <div
                  key={name}
                  className={`rounded-lg border p-3 transition-colors ${
                    stageFilter === name ? "border-cyan-300/60 bg-cyan-400/10" : "border-cyan-400/15"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setStageFilter(stageFilter === name ? "All" : name)}
                    className="w-full text-left"
                    aria-pressed={stageFilter === name}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color }} />
                      <span className="hud-label text-[10px] text-slate-200">{name}</span>
                      <span className="ml-auto hud-label text-lg" style={{ color }}>
                        {stageItems.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{hint}</p>
                  </button>
                  <div className="mt-2 space-y-1">
                    {stageItems.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openEditor(item)}
                        className="block w-full truncate text-left text-[10px] text-slate-300 hover:text-cyan-200 px-1 py-0.5 rounded hover:bg-cyan-400/10"
                      >
                        {item.title}
                      </button>
                    ))}
                    {stageItems.length > 4 && (
                      <span className="block hud-label text-[8px] text-cyan-300/70 px-1">
                        +{stageItems.length - 4} more
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditor(undefined, name)}
                    className="mt-2 inline-flex items-center gap-1 hud-label text-[9px] text-cyan-300 hover:text-cyan-100"
                  >
                    <Plus className="h-3 w-3" /> {action}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
          {/* Content library */}
          <section className="evo-surface media-panel p-5" aria-label="Content library">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="hud-label text-xs text-cyan-200 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-cyan-300" /> Content library
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search titles and notes…"
                    className="h-8 pl-7 text-xs w-52"
                  />
                </div>
                <select
                  value={stageFilter}
                  onChange={(event) => setStageFilter(event.target.value as "All" | MediaStage)}
                  className="h-8 rounded border border-cyan-400/20 bg-[#04101d] px-2 text-xs text-slate-200"
                  aria-label="Filter by stage"
                >
                  <option value="All">All stages</option>
                  {MEDIA_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {visibleItems.length === 0 ? (
              <p className="text-xs text-slate-500">
                {items.length === 0
                  ? "Nothing saved yet. Add your first idea with a quick action above."
                  : "No content matches this search or filter."}
              </p>
            ) : (
              <ul className="space-y-2">
                {visibleItems.map((item) => {
                  const meta = MEDIA_CHANNELS.find((entry) => entry.name === item.channel);
                  const stageMeta = MEDIA_STAGE_META.find((entry) => entry.name === item.stage);
                  return (
                    <li key={item.id} className="flex items-center gap-3 rounded border border-cyan-400/10 px-3 py-2">
                      {meta && <meta.icon className="h-4 w-4 shrink-0" style={{ color: meta.color }} />}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-slate-200 truncate">{item.title}</div>
                        <div className="hud-label text-[8px] text-slate-500">
                          {item.channel} · {item.stage}
                          {item.date ? ` · ${item.date}` : " · no date"}
                        </div>
                      </div>
                      <select
                        value={item.stage}
                        onChange={(event) => moveItem(item.id, event.target.value as MediaStage)}
                        className="h-7 rounded border border-cyan-400/20 bg-[#04101d] px-1.5 text-[10px] text-slate-200"
                        aria-label={`Move ${item.title} to another stage`}
                      >
                        {MEDIA_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => openEditor(item)}
                        className="h-7 w-7 rounded border border-cyan-400/20 flex items-center justify-center text-cyan-300 hover:bg-cyan-400/10"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="h-7 w-7 rounded border border-cyan-400/20 flex items-center justify-center text-rose-300/80 hover:bg-rose-400/10"
                        aria-label={`Archive ${item.title}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      {stageMeta && <span className="sr-only">{stageMeta.hint}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Content goals */}
          <section className="evo-surface media-panel p-5" aria-label="Content goals">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="hud-label text-xs text-cyan-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-300" /> Content goals
              </h3>
              <button
                type="button"
                onClick={() => openGoalEditor()}
                className="inline-flex items-center gap-1 hud-label text-[9px] text-cyan-300 hover:text-cyan-100"
              >
                <Plus className="h-3 w-3" /> Add goal
              </button>
            </div>
            {goals.length === 0 ? (
              <p className="text-xs text-slate-500">
                No goals yet. Add one — for example "Post 5x per week" — and update your progress as you go.
              </p>
            ) : (
              <ul className="space-y-3">
                {goals.map((goal) => {
                  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                  const done = goal.current >= goal.target;
                  return (
                    <li key={goal.id}>
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CircleCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-cyan-400/40 shrink-0" />
                        )}
                        <span className="text-xs text-slate-200 truncate">{goal.label}</span>
                        <span className="ml-auto hud-label text-[9px] text-cyan-200 whitespace-nowrap">
                          {goal.current} / {goal.target}
                        </span>
                        <button
                          type="button"
                          onClick={() => openGoalEditor(goal)}
                          className="text-slate-500 hover:text-cyan-200"
                          aria-label={`Edit goal ${goal.label}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-slate-500 hover:text-rose-300"
                          aria-label={`Delete goal ${goal.label}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-cyan-400/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${done ? "bg-emerald-400" : "bg-cyan-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-4 text-[10px] text-slate-500 border-t border-cyan-400/10 pt-3">
              Goal progress is updated by you — Evolution doesn't pull live stats from any platform.
            </p>
          </section>
        </div>
      </div>
      {/* Content editor dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit content" : "New content"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={itemChannel}
                onChange={(event) => setItemChannel(event.target.value)}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                aria-label="Platform"
              >
                {MEDIA_CHANNELS.map(({ name }) => (
                  <option key={name}>{name}</option>
                ))}
                {!MEDIA_CHANNELS.some((entry) => entry.name === itemChannel) && <option>{itemChannel}</option>}
              </select>
              <select
                value={stage}
                onChange={(event) => setStage(event.target.value as MediaStage)}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                aria-label="Stage"
              >
                {MEDIA_STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Planned date"
            />
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Script, shot list, or notes…"
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveItem}>{editingId ? "Save changes" : "Save content"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive content?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Archive “{deleteTarget?.title}”? It leaves your library but can be restored from Archived. Nothing changes on any social platform.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Keep it
            </Button>
            <Button onClick={deleteItem}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Goal editor dialog */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{goalEditId ? "Edit goal" : "New content goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={goalLabel}
              onChange={(event) => setGoalLabel(event.target.value)}
              placeholder="Goal — e.g. Post 5x per week"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={goalCurrent}
                onChange={(event) => setGoalCurrent(event.target.value)}
                placeholder="Progress (e.g. 3)"
                inputMode="numeric"
                aria-label="Current progress"
              />
              <Input
                value={goalTarget}
                onChange={(event) => setGoalTarget(event.target.value)}
                placeholder="Target (e.g. 5)"
                inputMode="numeric"
                aria-label="Target"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGoal}>{goalEditId ? "Save changes" : "Save goal"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

const DASH_TABS = [
  "Overview",
  "Automation",
  "Analytics",
  "Campaigns",
  "Leads",
  "Sales",
  "Content",
  "Services",
] as const;
type DashboardTab = (typeof DASH_TABS)[number];
const DASH_SOURCES = [
  { name: "Meta Ads", icon: InfinityIcon, color: "#218cff", visits: 24532, change: 18 },
  { name: "Instagram", icon: Instagram, color: "#d946ef", visits: 18421, change: 24 },
  { name: "TikTok", icon: Music2, color: "#13dcea", visits: 31208, change: 37 },
  { name: "Facebook", icon: Facebook, color: "#3797ff", visits: 12963, change: 12 },
  { name: "YouTube", icon: Youtube, color: "#ff4f67", visits: 8714, change: 29 },
  { name: "Store / Direct", icon: ShoppingCart, color: "#4ade80", visits: 6302, change: 41 },
];
const DASH_WORKFLOW = [
  {
    name: "Research",
    icon: BrainCircuit,
    color: "#c084fc",
    lines: ["Competitor research", "Market trends", "Audience insights"],
    count: 42,
    tab: "Content",
    stage: "Idea",
  },
  {
    name: "Ads",
    icon: InfinityIcon,
    color: "#268bff",
    lines: ["Campaign planning", "Creative concepts", "Budget notes"],
    count: 35,
    tab: "Campaigns",
    stage: "Draft",
  },
  {
    name: "Content",
    icon: Youtube,
    color: "#e879f9",
    lines: ["Generate ideas", "Create content", "Review drafts"],
    count: 68,
    tab: "Content",
    stage: "Draft",
  },
  {
    name: "Posting",
    icon: Music2,
    color: "#21dce7",
    lines: ["Plan publish dates", "Review ready posts", "Log published work"],
    count: 52,
    tab: "Content",
    stage: "Ready",
  },
  {
    name: "Leads",
    icon: Users,
    color: "#20dcc7",
    lines: ["Capture follow-ups", "Prepare outreach", "Track next steps"],
    count: 43,
    tab: "Leads",
    stage: "Idea",
  },
  {
    name: "Sales",
    icon: ShoppingCart,
    color: "#f5d37b",
    lines: ["Record revenue", "Review sources", "Track business goals"],
    count: 38,
    tab: "Sales",
    stage: "Published",
  },
  {
    name: "Follow-ups",
    icon: Mail,
    color: "#21d6ff",
    lines: ["Plan email / SMS", "Follow-up tasks", "Keep commitments"],
    count: 44,
    tab: "Leads",
    stage: "Ready",
  },
  {
    name: "Booking",
    icon: CalendarDays,
    color: "#30c6ff",
    lines: ["Plan appointments", "Review calendar", "Add meeting details"],
    count: 27,
    tab: "Services",
    stage: "Published",
  },
] as const;
const SAMPLE_TREND = [8, 12, 9, 18, 16, 25, 19, 31, 24, 28, 40, 35, 48, 45, 62, 58, 67, 63, 80, 75, 94];
const SAMPLE_CAMPAIGNS = [
  {
    name: "Meta · ASC",
    source: "Meta Ads",
    spend: 2430,
    leads: 684,
    sales: 9860,
    roas: "4.1x",
    color: "#22d3ee",
  },
  {
    name: "IG · Reels",
    source: "Instagram",
    spend: 1280,
    leads: 412,
    sales: 5601,
    roas: "4.4x",
    color: "#e879f9",
  },
  {
    name: "TikTok · Broad",
    source: "TikTok",
    spend: 1950,
    leads: 890,
    sales: 13420,
    roas: "6.9x",
    color: "#22d3ee",
  },
  {
    name: "Facebook · Local",
    source: "Facebook",
    spend: 890,
    leads: 306,
    sales: 4125,
    roas: "4.6x",
    color: "#60a5fa",
  },
  {
    name: "YouTube · Video",
    source: "YouTube",
    spend: 620,
    leads: 201,
    sales: 2987,
    roas: "4.8x",
    color: "#fb7185",
  },
];

function DashPanel({
  title,
  children,
  className = "",
  color = "#44ceff",
  detail,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  color?: string;
  detail?: string;
}) {
  return (
    <section className={`evo-surface md-panel ${className}`} style={{ "--md-accent": color } as CSSProperties}>
      <div className="md-panel-heading">
        <h2>{title}</h2>
        {detail && <span>{detail}</span>}
      </div>
      {children}
    </section>
  );
}

function DashGraph({
  values,
  color = "#28beff",
  bars = false,
  label,
}: {
  values: number[];
  color?: string;
  bars?: boolean;
  label: string;
}) {
  const safe = values.length ? values : [0, 0];
  const max = Math.max(1, ...safe.map(Math.abs));
  const coords = safe
    .map((value, i) => `${8 + (i * 264) / Math.max(1, safe.length - 1)},${93 - (Math.max(0, value) / max) * 80}`)
    .join(" ");
  return (
    <svg viewBox="0 0 280 104" role="img" aria-label={label} className="md-graph" preserveAspectRatio="none">
      {[23, 46, 69, 92].map((y) => (
        <line key={y} x1="4" x2="278" y1={y} y2={y} stroke="#68b8e6" strokeOpacity=".1" strokeDasharray="2 4" />
      ))}
      {bars &&
        safe.map((value, i) => (
          <rect
            key={i}
            x={8 + (i * 264) / safe.length}
            y={94 - (Math.max(0, value) / max) * 70}
            width={Math.max(2, 264 / safe.length - 4)}
            height={(Math.max(0, value) / max) * 70}
            fill={color}
            opacity={0.45 + (i / safe.length) * 0.4}
          />
        ))}
      <polygon points={`8,94 ${coords} 272,94`} fill={color} opacity=".07" />
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
      {safe.length <= 8 &&
        safe.map((value, i) => (
          <circle
            key={i}
            cx={8 + (i * 264) / Math.max(1, safe.length - 1)}
            cy={93 - (Math.max(0, value) / max) * 80}
            r="2.3"
            fill={color}
          />
        ))}
    </svg>
  );
}

function DashDonut({
  values,
  colors,
  total,
  label,
}: {
  values: number[];
  colors: string[];
  total: string;
  label: string;
}) {
  const sum = values.reduce((a, b) => a + b, 0);
  let offset = 0;
  return (
    <div className="md-donut" role="img" aria-label={`${total} ${label}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="48" fill="none" stroke="#112b42" strokeWidth="9" />
        {values.map((value, i) => {
          const share = sum ? (value / sum) * 301.59 : 0;
          const start = offset;
          offset += share;
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="9"
              strokeDasharray={`${Math.max(0, share - 2)} ${301.59 - Math.max(0, share - 2)}`}
              strokeDashoffset={-start}
              transform="rotate(-90 60 60)"
            />
          );
        })}
      </svg>
      <div>
        <strong>{total}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function DatabaseNode({
  label,
  detail,
  color,
  icon: Icon,
  onClick,
}: {
  label: string;
  detail: string;
  color: string;
  icon: typeof Database;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="md-database"
      style={{ "--node-color": color } as CSSProperties}
      onClick={onClick}
      aria-label={`Explore ${label}`}
    >
      <svg viewBox="0 0 220 155" aria-hidden="true">
        <ellipse cx="110" cy="127" rx="104" ry="24" />
        <ellipse cx="110" cy="127" rx="95" ry="20" />
        <ellipse cx="110" cy="127" rx="84" ry="16" />
        <path d="M29 29v91c0 30 162 30 162 0V29" fill={color} fillOpacity=".055" />
        <ellipse cx="110" cy="29" rx="81" ry="24" />
        <ellipse cx="110" cy="29" rx="72" ry="18" />
        <ellipse cx="110" cy="29" rx="60" ry="12" />
        <path d="M29 106c0 30 162 30 162 0" strokeOpacity=".5" />
      </svg>
      <div>
        <Icon size={28} />
        <span>
          <strong>{label}</strong>
          <small>{detail}</small>
        </span>
      </div>
    </button>
  );
}

function MediaSystemPage() {
  const { data, mutate } = useEvolutionData();
  const [activeTab, setActiveTab] = useState<DashboardTab>("Overview");
  const [mode, setMode] = useState<"demo" | "saved">("saved");
  const [selectedSource, setSelectedSource] = useState("All");
  const [period, setPeriod] = useState("month");
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [chartView, setChartView] = useState("Revenue");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskSaved, setTaskSaved] = useState(false);
  const taskSubmit = useRef(false);
  const workbench = useRef<HTMLDivElement>(null);
  const allItems = readActiveMediaItems(data);
  const today = todayDate();
  const now = new Date(`${today}T12:00:00`);
  const monthStart = `${today.slice(0, 7)}-01`;
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const cutoff = period === "month" ? monthStart : period === "30" ? localISO(thirtyDaysAgo) : "";
  const monthEnd = localISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const upperBound = period === "month" ? monthEnd : period === "30" ? today : "";
  const inPeriod = (date: string) => !date || ((!cutoff || date >= cutoff) && (!upperBound || date <= upperBound));
  const savedItems = allItems.filter(
    (item) => inPeriod(item.date) && (selectedSource === "All" || item.channel === selectedSource),
  );
  const revenues = data.revenue.filter((item) => inPeriod(item.date) && item.date <= today);
  const realRevenue = revenues.reduce((sum, item) => sum + item.amount, 0);
  const realOpenTasks = data.bizTasks.filter((task) => !task.done);
  const realActiveProjects = data.projects.filter((project) => project.status !== "Completed");
  const sources =
    mode === "demo"
      ? DASH_SOURCES
      : MEDIA_CHANNELS.map((source) => ({
          ...source,
          visits: savedItems.filter((item) => item.channel === source.name).length,
          change: 0,
        }));
  const factor = period === "30" ? 0.92 : period === "all" ? 1.8 : 1;
  const chosenDemo = DASH_SOURCES.find((source) => source.name === selectedSource);
  const portion = chosenDemo ? chosenDemo.visits / 102140 : 1;
  const sampleTotal = Math.round((chosenDemo?.visits ?? 102140) * factor);
  const stageCounts = MEDIA_STAGES.map((stage) => savedItems.filter((item) => item.stage === stage).length);
  const activityValues =
    mode === "demo" ? [124, 68, 52, 46, 36].map((v) => Math.round(v * factor * portion)) : stageCounts;
  const activityNames =
    mode === "demo" ? ["Content", "Research", "Outreach", "Data analysis", "Other"] : [...MEDIA_STAGES];
  const palette = ["#2aa9ff", "#a855f7", "#20d6bb", "#fbbf24", "#83b1e0"];
  const demoTrend = SAMPLE_TREND.map((value) => value * factor * portion);
  const revenueTrend = [...revenues].sort((a, b) => a.date.localeCompare(b.date)).map((entry) => entry.amount);
  const actualMetricSeries = [
    stageCounts,
    revenueTrend,
    data.projects.map((project) => project.progress),
    PRIORITIES.map((priority) => realOpenTasks.filter((task) => task.priority === priority).length),
  ];
  const totalActivity = activityValues.reduce((sum, value) => sum + value, 0);
  const metrics =
    mode === "demo"
      ? [
          {
            title: "Leads",
            value: Math.round(2856 * factor * portion).toLocaleString(),
            icon: Users,
            color: "#2bbaff",
            detail: "▲ 34% · sample",
          },
          {
            title: "Sales",
            value: `$${Math.round(38755 * factor * portion).toLocaleString()}`,
            icon: ShoppingCart,
            color: "#f1d07a",
            detail: "▲ 41% · sample",
          },
          {
            title: "Conversion rate",
            value: "3.7%",
            icon: Target,
            color: "#d17cff",
            detail: "▲ 0.8% · sample",
          },
          {
            title: "ROAS",
            value: "4.2x",
            icon: BarChart3,
            color: "#22c6f5",
            detail: "▲ 26% · sample",
          },
        ]
      : [
          {
            title: "Content",
            value: String(savedItems.length),
            icon: Pencil,
            color: "#2bbaff",
            detail: "Saved content items",
          },
          {
            title: "Revenue",
            value: fmt(realRevenue),
            icon: ShoppingCart,
            color: "#f1d07a",
            detail: "Business revenue entries",
          },
          {
            title: "Projects",
            value: String(realActiveProjects.length),
            icon: FolderKanban,
            color: "#d17cff",
            detail: "Active business projects",
          },
          {
            title: "Open tasks",
            value: String(realOpenTasks.length),
            icon: ListTodo,
            color: "#22c6f5",
            detail: "Business task list",
          },
        ];
  const validPlannerChannel = MEDIA_CHANNELS.some((source) => source.name === selectedSource)
    ? selectedSource
    : undefined;
  const plannerSearch = {
    section: "social-media" as const,
    ...(validPlannerChannel ? { channel: validPlannerChannel } : {}),
  };
  const selectTab = (tab: DashboardTab, workflow = "") => {
    setActiveTab(tab);
    setSelectedWorkflow(workflow);
    setTaskSaved(false);
    if (tab !== "Overview" && tab !== "Analytics")
      requestAnimationFrame(() => workbench.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    if (tab === "Analytics")
      requestAnimationFrame(() =>
        document.getElementById("media-system-analytics")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
  };
  const addFollowUp = (event: React.FormEvent) => {
    event.preventDefault();
    if (taskSubmit.current) return;
    if (!taskTitle.trim()) {
      toast.error("Give the task a title.");
      return;
    }
    taskSubmit.current = true;
    try {
      mutate((prev) => ({
        bizTasks: [
          ...prev.bizTasks,
          {
            id: uid(),
            text: taskTitle.trim(),
            priority: "Medium",
            due: taskDate || todayDate(),
            category: "Social Media",
            done: false,
          },
        ],
      }));
      setTaskTitle("");
      setTaskDate("");
      setTaskSaved(true);
    } catch {
      taskSubmit.current = false;
      toast.error("Could not save this task. Please try again.");
    }
  };
  const campaignRows = SAMPLE_CAMPAIGNS.filter((row) => selectedSource === "All" || row.source === selectedSource);
  const distribution =
    mode === "demo"
      ? [28, 42, 18, 8, 4]
      : MEDIA_CHANNELS.map((channel) => savedItems.filter((item) => item.channel === channel.name).length);
  const distributionNames =
    mode === "demo" ? ["18–24", "25–34", "35–44", "45–54", "55+"] : MEDIA_CHANNELS.map((channel) => channel.name);
  const revenueValues = [...revenues].sort((a, b) => a.date.localeCompare(b.date)).map((entry) => entry.amount);

  return (
    <main className="media-dashboard">
      <style>{MEDIA_DASHBOARD_CSS}</style>
      <div className="md-topline">
        <Link to="/business" search={{ section: "social-media" }}>
          <ArrowLeft size={13} /> Social Media
        </Link>
        <span>Business / Media System</span>
        <span className="flex items-center gap-4">
          <Link to="/business" search={{ section: "content-creator" }}>
            Content Creator
          </Link>
          <Link to="/business" search={plannerSearch} hash="media-planner">
            Open content planner <ArrowRight size={13} />
          </Link>
        </span>
      </div>
      <header className="md-command-header">
        <div className="md-brand">
          <h1>
            EVOLUTION OS<sup>™</sup>
          </h1>
          <p>MEDIA & MARKETING SYSTEM</p>
        </div>
        <nav aria-label="Media System sections" className="evo-surface md-nav">
          {DASH_TABS.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => selectTab(tab)}
              className={activeTab === tab ? "is-active" : ""}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
        <label className="evo-surface md-period">
          <Clock3 size={14} />
          <span className="sr-only">Reporting period</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="month">This month</option>
            <option value="30">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <CalendarDays size={14} />
        </label>
      </header>
      <div className="md-mode-bar">
        <div className="md-mode-switch" aria-label="Dashboard data source">
          <button
            type="button"
            aria-pressed={mode === "demo"}
            className={mode === "demo" ? "is-active" : ""}
            onClick={() => {
              setMode("demo");
              setSelectedSource("All");
            }}
          >
            Demo (sample data)
          </button>
          <button
            type="button"
            aria-pressed={mode === "saved"}
            className={mode === "saved" ? "is-active" : ""}
            onClick={() => {
              setMode("saved");
              setSelectedSource("All");
            }}
          >
            My workspace
          </button>
        </div>
        <p>
          {mode === "demo"
            ? "SAMPLE DATA · Illustrative metrics only. No accounts, agents, or automations connected."
            : "YOUR SAVED DATA · Manual records from your planner and business workspace. No live social analytics."}
        </p>
      </div>
      {mode === "saved" && <ContentWorkbench id="media-content-workbench" />}

      {activeTab !== "Overview" && activeTab !== "Analytics" && (
        <div ref={workbench} className="md-workbench evo-surface" role="region" aria-label={`${activeTab} workspace`}>
          <div className="md-workbench-title">
            <div>
              <span>
                {selectedWorkflow ? `${selectedWorkflow} / ` : ""}
                {activeTab}
              </span>
              <h2>
                {activeTab === "Content"
                  ? "Turn the next idea into a saved plan."
                  : activeTab === "Campaigns"
                    ? "Build campaigns with your projects."
                    : activeTab === "Sales"
                      ? "Your recorded business revenue."
                      : activeTab === "Automation"
                        ? "Design the workflow. Run it manually."
                        : activeTab === "Leads"
                          ? "Keep the next follow-up on your radar."
                          : "Plan your next service or appointment."}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("Overview");
                setSelectedWorkflow("");
              }}
              aria-label="Close workspace panel"
            >
              <X size={17} />
            </button>
          </div>
          <div className="md-workbench-body">
            {activeTab === "Content" && (
              <>
                <p>
                  {allItems.length} saved content items across your channels. Capture an idea, draft a caption, set a
                  planned date, or record a post as published.{" "}
                  {selectedWorkflow === "Posting" && "Publishing is manual; no post will be sent from this dashboard."}
                </p>
                <div className="md-workbench-actions">
                  <button
                    type="button"
                    className="md-action"
                    onClick={() => {
                      setMode("saved");
                      requestAnimationFrame(() =>
                        document.getElementById("media-content-workbench")?.scrollIntoView({ behavior: "smooth", block: "start" }),
                      );
                    }}
                  >
                    Open content workbench <Pencil size={14} />
                  </button>
                  <Link className="md-action" to="/business" search={plannerSearch} hash="media-planner">
                    Open saved content planner <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}
            {activeTab === "Campaigns" && (
              <>
                <p>
                  {realActiveProjects.length} active projects. Use your existing project manager for campaign goals,
                  deadlines, progress, and notes.
                </p>
                <Link className="md-action" to="/business" search={{}} hash="business-projects">
                  Manage projects <ArrowRight size={14} />
                </Link>
              </>
            )}
            {activeTab === "Sales" && (
              <>
                <p>
                  {fmt(realRevenue)} recorded in {revenues.length} revenue entries for this period. These are your
                  manual business records, independent of demo analytics.
                </p>
                <Link className="md-action" to="/business" search={{}} hash="business-revenue">
                  Open revenue manager <ArrowRight size={14} />
                </Link>
              </>
            )}
            {activeTab === "Automation" && (
              <>
                <p>
                  The workflow below is a planning map. Choose a step to open its tools. It does not run agents, buy
                  ads, send messages, or publish content.
                </p>
                <div className="md-workbench-actions">
                  <Link className="md-action" to="/business" search={plannerSearch} hash="media-planner">
                    Plan content <Pencil size={14} />
                  </Link>
                  <Link className="md-action" to="/business" search={{}} hash="business-tasks">
                    Manage workflow tasks <ListTodo size={14} />
                  </Link>
                </div>
              </>
            )}
            {(activeTab === "Leads" || activeTab === "Services") && (
              <>
                <p>
                  {activeTab === "Leads"
                    ? "Save a manual follow-up to your Business tasks. This does not contact anyone or create a CRM connection."
                    : "Save a service task or open your calendar to plan an appointment. No booking or message is sent automatically."}
                </p>
                <form className="md-task-form" onSubmit={addFollowUp}>
                  <label>
                    <span className="sr-only">Follow-up task title</span>
                    <input
                      value={taskTitle}
                      onChange={(event) => {
                        setTaskTitle(event.target.value);
                        taskSubmit.current = false;
                        setTaskSaved(false);
                      }}
                      placeholder={
                        activeTab === "Leads"
                          ? "e.g. Follow up on a campaign inquiry"
                          : "e.g. Prepare the next client session"
                      }
                      maxLength={200}
                    />
                  </label>
                  <label>
                    <span className="sr-only">Task due date</span>
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(event) => {
                        setTaskDate(event.target.value);
                        taskSubmit.current = false;
                      }}
                    />
                  </label>
                  <button className="md-action" type="submit">
                    <Plus size={14} /> Save task
                  </button>
                </form>
                {taskSaved && (
                  <p className="md-success" role="status">
                    Task saved to Business.
                  </p>
                )}
                <div className="md-workbench-actions">
                  <Link to="/business" search={{}} hash="business-tasks">
                    View business tasks <ArrowRight size={12} />
                  </Link>
                  {activeTab === "Services" && (
                    <Link to="/calendar">
                      Open calendar <CalendarDays size={12} />
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <section className="md-traffic-section" aria-labelledby="md-traffic-title">
        <div className="md-section-label">
          <h2 id="md-traffic-title">
            <Target size={12} />
            {mode === "demo" ? "Traffic sources" : "Content channels"}
          </h2>
          <button type="button" onClick={() => setSelectedSource("All")} aria-pressed={selectedSource === "All"}>
            {selectedSource === "All" ? "All channels" : `Clear ${selectedSource} filter`} <X size={10} />
          </button>
        </div>
        <div className="md-traffic-row">
          <div className="md-source-grid">
            {sources.map(({ name, icon: Icon, color, visits, change }, i) => (
              <button
                type="button"
                key={name}
                className={`evo-surface md-source ${selectedSource === name ? "is-selected" : ""}`}
                style={{ "--md-accent": color } as CSSProperties}
                aria-pressed={selectedSource === name}
                onClick={() => setSelectedSource(selectedSource === name ? "All" : name)}
              >
                <div className="md-source-name">
                  <Icon size={13} />
                  <span>{name}</span>
                </div>
                <div className="md-source-value">
                  <Icon size={32} />
                  <div>
                    <strong>
                      {mode === "demo"
                        ? Math.round(visits * factor).toLocaleString()
                        : String(allItems.filter((item) => item.channel === name && inPeriod(item.date)).length)}
                    </strong>
                    <small>{mode === "demo" ? `▲ ${change}% · demo` : "saved items"}</small>
                  </div>
                  <div className="md-mini-bars" aria-hidden="true">
                    {[12, 20, 29, 22, 37, 48, 60, 76].map((height, j) => (
                      <i
                        key={j}
                        style={{
                          height: `${mode === "demo" ? height - (i % 2) * 5 : Math.min(76, (visits + j) * (visits ? 7 : 0))}%`,
                          background: color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <DashPanel
            title={mode === "demo" ? "Total traffic" : "Saved content"}
            className="md-traffic-total"
            detail={mode === "demo" ? "DEMO" : "REAL"}
          >
            <div className="md-large-number">
              {mode === "demo" ? sampleTotal.toLocaleString() : savedItems.length}
              <span>{mode === "demo" ? "▲ 26%" : "items"}</span>
            </div>
            <DashGraph
              values={mode === "demo" ? demoTrend : stageCounts}
              bars
              label={mode === "demo" ? "Illustrative traffic trend" : "Saved content by stage"}
            />
          </DashPanel>
        </div>
      </section>

      <section className="md-system-grid" aria-label="Media system map">
        <div className="md-left-stack">
          <DashPanel title="AI agents" detail="UNCONNECTED">
            <div className="md-agents">
              {[
                { name: "ChatGPT", icon: Bot, color: "#6de1c1" },
                { name: "Claude", icon: BrainCircuit, color: "#e3b493" },
                { name: "Grok", icon: Zap, color: "#d7e9ff" },
                { name: "Custom agents", icon: Bot, color: "#6bafff" },
              ].map(({ name, icon: Icon, color }) => (
                <button type="button" key={name} onClick={() => selectTab("Automation")}>
                  <Icon size={20} style={{ color }} />
                  <span>{name}</span>
                  <small>Not connected</small>
                  <i />
                </button>
              ))}
            </div>
          </DashPanel>
          <DashPanel
            title={mode === "demo" ? "AI activity" : "Content activity"}
            detail={mode === "demo" ? "DEMO" : "SAVED"}
            className="md-activity"
          >
            <div className="md-activity-body">
              <DashDonut
                values={activityValues}
                colors={palette}
                total={String(totalActivity)}
                label={mode === "demo" ? "Sample tasks" : "Content items"}
              />
              <ul>
                {activityNames.map((name, i) => (
                  <li key={name}>
                    <i style={{ background: palette[i] }} />
                    <span>{name}</span>
                    <b>{activityValues[i]}</b>
                  </li>
                ))}
              </ul>
            </div>
          </DashPanel>
        </div>
        <div className="md-system-center">
          <svg className="md-circuit-lines" viewBox="0 0 800 430" preserveAspectRatio="none" aria-hidden="true">
            <path d="M132 78V178Q132 197 153 197H315Q345 197 345 240V285" stroke="#139bff" />
            <path d="M400 80V254" stroke="#18e1e5" />
            <path d="M668 80V182Q668 209 640 209H483Q451 209 451 241V285" stroke="#f4d38c" />
            <path d="M132 132H274M528 132H668" stroke="#27e5ce" />
            <path d="M400 379V409M400 409H65V425M400 409H735V425" stroke="#21d4ff" />
            <path d="M20 305H260M540 305H780" stroke="#1a80db" strokeDasharray="4 7" />
          </svg>
          <div className="md-database-row">
            <DatabaseNode
              label={mode === "demo" ? "ADS.DB" : "CONTENT.DB"}
              detail={mode === "demo" ? "AD DATA · DEMO" : "YOUR CONTENT PLAN"}
              color="#1caeff"
              icon={Database}
              onClick={() => selectTab(mode === "demo" ? "Campaigns" : "Content")}
            />
            <DatabaseNode
              label={mode === "demo" ? "LEADS.DB" : "PROJECTS.DB"}
              detail={mode === "demo" ? "LEAD DATA · DEMO" : "GOALS · PROGRESS"}
              color="#1ce4c9"
              icon={Users}
              onClick={() => selectTab(mode === "demo" ? "Leads" : "Campaigns")}
            />
            <DatabaseNode
              label={mode === "demo" ? "SALES.DB" : "TASKS.DB"}
              detail={mode === "demo" ? "SALES DATA · DEMO" : "YOUR NEXT ACTIONS"}
              color="#f2d18b"
              icon={ShoppingCart}
              onClick={() => selectTab(mode === "demo" ? "Sales" : "Services")}
            />
          </div>
          <Link
            to="/business"
            search={plannerSearch}
            hash="media-planner"
            className="md-orbital-core"
            aria-label="Open the saved content planner"
          >
            <div className="md-orbit-ring md-orbit-ring-one" />
            <div className="md-orbit-ring md-orbit-ring-two" />
            <div className="md-orbit-crosshair" />
            <img src={hologramSrc("bonsai")} alt="" />
            <div className="md-core-label">
              <strong>EVOLUTION AI</strong>
              <span>PLAN · CREATE · EXECUTE</span>
              <small>OPEN YOUR CONTENT PLANNER</small>
            </div>
          </Link>
          <div className="md-center-caption">
            <span>Connected workflow concept</span>
            <small>Plan the work. Keep the controls.</small>
          </div>
          <DashPanel title="System status" className="md-status">
            <ul>
              <li>
                <i />
                <span>Accounts connected</span>
                <b>0 / 6</b>
              </li>
              <li>
                <i />
                <span>Auto-posting</span>
                <b>Off</b>
              </li>
              <li>
                <i className="available" />
                <span>Content planner</span>
                <b>Available</b>
              </li>
              <li>
                <i />
                <span>Analytics source</span>
                <b>{mode === "demo" ? "Demo" : "Manual"}</b>
              </li>
            </ul>
          </DashPanel>
        </div>
        <DashPanel title="Key metrics" detail={mode === "demo" ? "DEMO" : "SAVED"} className="md-key-metrics">
          <div className="md-metrics-grid">
            {metrics.map(({ title, value, icon: Icon, color, detail }, i) => (
              <div key={title} className="md-metric" style={{ "--metric-color": color } as CSSProperties}>
                <div>
                  <Icon size={23} />
                  <span>
                    {title}
                    <strong>{value}</strong>
                  </span>
                </div>
                <small>{detail}</small>
                <DashGraph
                  values={mode === "demo" ? SAMPLE_TREND.slice(i, i + 14) : actualMetricSeries[i]}
                  color={color}
                  label={
                    mode === "demo"
                      ? `${title} illustrative trend`
                      : `${title}: saved record distribution, not live analytics`
                  }
                />
              </div>
            ))}
          </div>
        </DashPanel>
      </section>

      <section className="md-workflow-section" aria-labelledby="md-workflow-title">
        <div className="md-flow-heading">
          <span />
          <h2 id="md-workflow-title">{mode === "demo" ? "Marketing workflow" : "Your workflow"}</h2>
          <span />
        </div>
        <div className="md-workflow-grid">
          {DASH_WORKFLOW.map(({ name, icon: Icon, color, lines, count, tab, stage }, i) => {
            const actual =
              name === "Ads"
                ? realActiveProjects.length
                : name === "Leads" || name === "Follow-ups" || name === "Booking"
                  ? realOpenTasks.length
                  : name === "Sales"
                    ? revenues.length
                    : allItems.filter((item) => item.stage === stage).length;
            return (
              <button
                type="button"
                key={name}
                className={`evo-surface md-workflow-card ${selectedWorkflow === name ? "is-selected" : ""}`}
                style={{ "--md-accent": color } as CSSProperties}
                onClick={() => selectTab(tab, name)}
              >
                <span className="md-step-number">{String(i + 1).padStart(2, "0")}</span>
                <Icon size={31} />
                <h3>{name}</h3>
                <ul>
                  {lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="md-workflow-count">
                  {mode === "demo" ? `${count} sample tasks` : `${actual} saved records`}
                  <ChevronRight size={12} />
                </div>
                <div className="md-progress">
                  <span
                    style={{
                      width: mode === "demo" ? `${count}%` : actual ? "100%" : "0%",
                      background: color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <p className="md-workflow-note">
          Interactive planning steps. Agents, publishing, outreach, and bookings are not automated.
        </p>
      </section>

      <section id="media-system-analytics" className="md-analytics-grid" aria-label="Analytics panels">
        <DashPanel
          title={mode === "demo" ? "Revenue analytics" : "Business revenue"}
          detail={mode === "demo" ? "DEMO" : "MANUAL"}
        >
          <div className="md-chart-tabs">
            {["Revenue", "Orders", "AOV", "LTV"].map((view) => (
              <button
                type="button"
                key={view}
                className={chartView === view ? "is-active" : ""}
                aria-pressed={chartView === view}
                onClick={() => setChartView(view)}
              >
                {view}
              </button>
            ))}
          </div>
          <div className="md-chart-number">
            {mode === "demo"
              ? chartView === "Revenue"
                ? `$${Math.round(38755 * factor * portion).toLocaleString()}`
                : chartView === "Orders"
                  ? Math.round(826 * factor * portion).toLocaleString()
                  : chartView === "AOV"
                    ? "$46.92"
                    : "$168"
              : chartView === "Revenue"
                ? fmt(realRevenue)
                : "—"}
            <small>
              {mode === "demo"
                ? "▲ 41% · sample"
                : chartView === "Revenue"
                  ? `${revenues.length} entries`
                  : "Not tracked"}
            </small>
          </div>
          <DashGraph
            values={mode === "demo" ? demoTrend : chartView === "Revenue" ? revenueValues : [0, 0]}
            bars
            label={
              mode === "demo"
                ? `Sample ${chartView.toLowerCase()} chart`
                : chartView === "Revenue"
                  ? "Manually recorded revenue entries in date order"
                  : `${chartView} is not tracked`
            }
          />
          <div className="md-chart-axis">
            <span>{mode === "demo" ? "Start of sample period" : "Earlier entries"}</span>
            <span>{mode === "demo" ? "End of sample period" : "Latest entry"}</span>
          </div>
        </DashPanel>
        <DashPanel
          title={mode === "demo" ? "Lead analytics" : "Content pipeline"}
          detail={mode === "demo" ? "DEMO" : "SAVED"}
        >
          <div className="md-chart-number">
            {mode === "demo" ? Math.round(2856 * factor * portion).toLocaleString() : savedItems.length}
            <small>{mode === "demo" ? "▲ 34% · sample" : "content items"}</small>
          </div>
          <div className="md-line-legend">
            {(mode === "demo" ? ["Meta", "Instagram", "TikTok", "Other"] : [...MEDIA_STAGES]).map((name, i) => (
              <span key={name}>
                <i style={{ background: palette[i] }} />
                {name}
              </span>
            ))}
          </div>
          <div className="md-multi-chart">
            {mode === "demo" ? (
              [0, 1, 2, 3].map((i) => (
                <DashGraph
                  key={i}
                  values={SAMPLE_TREND.map(
                    (value, j) => (value * (1 - i * 0.15) + ((j * 7 + i * 11) % 21)) * factor * portion,
                  )}
                  color={palette[i]}
                  label={`${["Meta", "Instagram", "TikTok", "Other"][i]} sample lead trend`}
                />
              ))
            ) : (
              <DashGraph
                values={stageCounts}
                color="#2dd4bf"
                bars
                label="Saved content counts across Idea, Draft, Ready, Published"
              />
            )}
          </div>
          <div className="md-chart-axis">
            <span>{mode === "demo" ? "Sample period" : "Idea → Draft → Ready → Published"}</span>
            <Link to="/business" search={plannerSearch} hash="media-planner">
              Planner ↗
            </Link>
          </div>
        </DashPanel>
        <DashPanel
          title={mode === "demo" ? "Campaign performance" : "Project progress"}
          detail={mode === "demo" ? "DEMO" : "SAVED"}
          className="md-campaign-panel"
        >
          <div className="md-table-wrap">
            <table>
              <thead>
                <tr>
                  {(mode === "demo"
                    ? ["Campaign", "Spend", "Leads", "Sales", "ROAS"]
                    : ["Project", "Status", "Progress"]
                  ).map((title) => (
                    <th key={title}>{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mode === "demo"
                  ? campaignRows.map((row) => (
                      <tr key={row.name}>
                        <td>
                          <i style={{ background: row.color }} />
                          {row.name}
                        </td>
                        <td>${Math.round(row.spend * factor).toLocaleString()}</td>
                        <td>{Math.round(row.leads * factor)}</td>
                        <td>${Math.round(row.sales * factor).toLocaleString()}</td>
                        <td className="md-positive">{row.roas}</td>
                      </tr>
                    ))
                  : data.projects.slice(0, 5).map((project) => (
                      <tr key={project.id}>
                        <td>{project.name}</td>
                        <td>{project.status}</td>
                        <td>{project.progress}%</td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {mode === "demo" && !campaignRows.length && (
              <p className="md-empty">No sample campaigns for this source.</p>
            )}
            {mode === "saved" && !data.projects.length && (
              <p className="md-empty">No projects yet. Start one in Business.</p>
            )}
          </div>
          <Link className="md-panel-link" to="/business" search={{}} hash="business-projects">
            Open project manager <ArrowRight size={12} />
          </Link>
        </DashPanel>
        <DashPanel
          title={mode === "demo" ? "Audience & demographics" : "Channel distribution"}
          detail={mode === "demo" ? "DEMO" : "SAVED"}
        >
          <div className="md-audience">
            <DashDonut
              values={distribution}
              colors={palette}
              total={mode === "demo" ? Math.round(2856 * factor * portion).toLocaleString() : String(savedItems.length)}
              label={mode === "demo" ? "Sample leads" : "Content items"}
            />
            <ul>
              {distributionNames.map((name, i) => (
                <li key={name}>
                  <i style={{ background: palette[i % palette.length] }} />
                  <span>{name}</span>
                  <b>{mode === "demo" ? `${distribution[i]}%` : distribution[i]}</b>
                </li>
              ))}
            </ul>
          </div>
          <div className="md-chart-axis">
            <span>{mode === "demo" ? "Illustrative age distribution" : "Saved manual content only"}</span>
          </div>
        </DashPanel>
      </section>
      <footer className="md-footer">
        <span>EVOLUTION OS · MEDIA SYSTEM</span>
        <span>
          {mode === "demo"
            ? "Demo analytics never overwrite your saved data."
            : "Undated content is included. Projects and open tasks are current totals."}
        </span>
        <Link to="/business" search={plannerSearch} hash="media-planner">
          Create your next piece <ArrowRight size={12} />
        </Link>
      </footer>
    </main>
  );
}

const MEDIA_DASHBOARD_CSS = `
.media-dashboard{--md-cyan:#29caff;--md-text:#c5e4f3;width:100%;max-width:1800px;min-height:100vh;margin:0 auto;padding:14px 22px 18px;color:var(--md-text);background:radial-gradient(ellipse at 50% 35%,#06314c35,transparent 55%),linear-gradient(#1b73a20b 1px,transparent 1px),linear-gradient(90deg,#1b73a20b 1px,transparent 1px),#020914;background-size:auto,26px 26px,26px 26px,auto;font-family:Rajdhani,Arial,sans-serif;position:relative;isolation:isolate}
.media-dashboard *{box-sizing:border-box}.media-dashboard button,.media-dashboard a,.media-dashboard select{touch-action:manipulation}.media-dashboard button{cursor:pointer}.media-dashboard a{text-decoration:none}.media-dashboard button:focus-visible,.media-dashboard a:focus-visible,.media-dashboard input:focus-visible,.media-dashboard select:focus-visible{outline:2px solid #8de9ff;outline-offset:3px}.media-dashboard button:hover,.media-dashboard a:hover{color:#e6faff}.md-topline{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:10px;font-size:11px;color:#71a2bb}.md-topline a{display:inline-flex;gap:6px;align-items:center;color:#91cde5}.md-topline>span{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#608ba5}.md-command-header{display:grid;grid-template-columns:310px minmax(450px,1fr) 175px;gap:18px;align-items:center;padding:4px 0 12px;border-bottom:1px solid #21698d66}.md-brand h1{font-family:Orbitron,sans-serif;font-size:27px;letter-spacing:4px;color:#7adfff;margin:0;text-shadow:0 0 18px #1aaaff65;white-space:nowrap}.md-brand sup{font-size:7px;vertical-align:top;position:relative;top:2px;letter-spacing:0}.md-brand p{font-size:10px;letter-spacing:4px;color:#39accc;margin:5px 0 0 3px}.md-nav{display:flex;align-items:center;justify-content:space-around;gap:2px;min-height:43px;padding:4px 8px;border:1px solid #1c4e75;background:linear-gradient(180deg,#071b2b,#030b18);clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px)}.md-nav button{font-size:10px;text-transform:uppercase;color:#86aeca;padding:9px 10px;white-space:nowrap;border:1px solid transparent;background:transparent;border-radius:3px}.md-nav button.is-active{background:linear-gradient(180deg,#0b2b53,#0c3560);border-color:#229dff;color:#e1f6ff;box-shadow:inset 0 0 16px #179eff30,0 0 10px #168aff35}.md-period{display:flex;align-items:center;justify-content:space-between;gap:7px;border:1px solid #1d5278;background:#04101d;padding:11px 13px;color:#84c4e1;font-size:11px}.md-period select{color:inherit;background:#04101d;border:0;min-width:0;width:100%;outline-offset:4px;color-scheme:dark}.md-mode-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0}.md-mode-bar p{font-size:10px;letter-spacing:.5px;color:#8aabc1;margin:0;text-align:right}.md-mode-switch{display:flex;flex-shrink:0;border:1px solid #204767;border-radius:3px;padding:2px;gap:2px}.md-mode-switch button{font-size:10px;padding:4px 10px;border:0;border-radius:2px;background:transparent;color:#7ca9c7}.md-mode-switch .is-active{background:#0f4264;color:#b9f3ff}.md-section-label{display:flex;justify-content:space-between;align-items:center;margin:4px 2px 8px}.md-section-label h2{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;display:flex;align-items:center;gap:6px;color:#8ce6ff;margin:0}.md-section-label button{display:flex;align-items:center;gap:6px;font-size:10px;color:#70a9c8;background:transparent;border:0}.md-traffic-row{display:grid;grid-template-columns:minmax(0,1fr) 248px;gap:16px}.md-source-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.md-source,.md-panel,.md-workflow-card{position:relative;border:1px solid color-mix(in srgb,var(--md-accent,#31baf8) 50%,#071523);background:linear-gradient(135deg,#071827e6,#020a16f5);box-shadow:inset 0 0 22px #0a96e80a,0 0 13px #0d99fb0b;isolation:isolate;min-width:0}.md-source{padding:10px 12px 12px;text-align:left;clip-path:polygon(9px 0,calc(100% - 9px) 0,100% 9px,100% calc(100% - 9px),calc(100% - 9px) 100%,9px 100%,0 calc(100% - 9px),0 9px)}.md-source:hover,.md-source.is-selected,.md-workflow-card:hover,.md-workflow-card.is-selected{border-color:var(--md-accent,#31baf8);box-shadow:inset 0 0 22px #0a96e818,0 0 14px #0d99fb35}.md-source.is-selected{outline:2px solid #a1eeff!important;outline-offset:-4px}.md-source-name{display:flex;align-items:center;gap:8px;font-size:10px;text-transform:uppercase;color:#cae9f6;white-space:nowrap}.md-source-name svg{color:var(--md-accent)}.md-source-value{display:flex;gap:9px;align-items:center;margin-top:12px}.md-source-value>svg{color:var(--md-accent);filter:drop-shadow(0 0 6px color-mix(in srgb,var(--md-accent) 40%,transparent));flex-shrink:0}.md-source-value strong{font-family:Arial,sans-serif;font-size:17px;font-weight:600;color:#eef8ff;white-space:nowrap}.md-source-value small{display:block;color:#84e7a6;font-size:9px;white-space:nowrap;margin-top:5px}.md-mini-bars{display:flex;align-items:flex-end;justify-content:flex-end;gap:3px;margin-left:auto;width:45px;height:42px;flex-shrink:0;overflow:hidden}.md-mini-bars i{display:block;flex:1;min-width:2px;box-shadow:0 0 7px var(--md-accent);opacity:.85}.md-panel{padding:12px 14px}.md-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;min-height:14px}.md-panel-heading h2{font-size:12px;letter-spacing:.7px;font-weight:600;text-transform:uppercase;line-height:1.2;margin:0;color:#8fe7ff}.md-panel-heading>span{font-size:8px;letter-spacing:.8px;color:#74a5c2;border:1px solid #244763;padding:2px 4px;white-space:nowrap}.md-traffic-total{padding:9px 13px}.md-traffic-total .md-panel-heading{margin-bottom:4px}.md-large-number{display:flex;align-items:center;gap:12px;font-family:Arial,sans-serif;font-size:26px;font-weight:600;color:#effbff;white-space:nowrap}.md-large-number>span{font-family:Rajdhani,Arial,sans-serif;font-size:13px;color:#81eea9}.md-graph{display:block;width:100%;height:100px;overflow:visible}.md-traffic-total .md-graph{height:36px;margin-top:3px}.md-system-grid{display:grid;grid-template-columns:225px minmax(0,1fr) 248px;gap:16px;margin-top:27px}.md-left-stack{display:grid;grid-template-rows:auto 1fr;gap:14px}.md-agents{display:flex;flex-direction:column;gap:9px}.md-agents button{display:flex;align-items:center;gap:9px;background:transparent;border:0;color:#bcd8ea;text-align:left;padding:0;min-height:21px;font-size:12px}.md-agents small{font-size:8px;color:#638398;margin-left:auto;white-space:nowrap}.md-agents i{width:5px;height:5px;border-radius:50%;background:#486374;flex-shrink:0}.md-activity{display:flex;flex-direction:column;justify-content:space-between;padding-bottom:15px}.md-activity-body{display:flex;align-items:center;gap:10px;min-width:0}.md-donut{width:112px;height:112px;flex-shrink:0;position:relative}.md-donut svg{width:100%;height:100%;filter:drop-shadow(0 0 5px #14acff15)}.md-donut>div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.md-donut strong{font-family:Arial,sans-serif;font-size:24px;color:#eef8ff}.md-donut span{font-size:10px;color:#85a9c2}.md-activity ul,.md-audience ul{padding:0;margin:0;list-style:none;flex:1;min-width:0}.md-activity li,.md-audience li{display:flex;gap:7px;align-items:center;margin:9px 0;font-size:10px;white-space:nowrap}.md-activity li i,.md-audience li i,.md-line-legend i{width:6px;height:6px;border-radius:50%;display:inline-block;flex-shrink:0}.md-activity li b,.md-audience li b{margin-left:auto;font-weight:500;color:#d5ebf4}.md-activity li span{overflow:hidden;text-overflow:ellipsis}.md-system-center{position:relative;min-height:350px}.md-circuit-lines{position:absolute;width:100%;height:100%;inset:0;pointer-events:none;overflow:visible}.md-circuit-lines path{fill:none;stroke-width:1.8;filter:drop-shadow(0 0 5px #18b7ff);vector-effect:non-scaling-stroke}.md-database-row{display:flex;align-items:flex-start;justify-content:space-between;gap:3px;position:relative;z-index:1}.md-database{position:relative;background:transparent;border:0;padding:0;color:var(--node-color);width:31%;height:147px;filter:drop-shadow(0 0 9px color-mix(in srgb,var(--node-color) 22%,transparent));transition:filter .2s}.md-database:hover{filter:drop-shadow(0 0 14px color-mix(in srgb,var(--node-color) 42%,transparent))}.md-database>svg{position:absolute;inset:0;width:100%;height:100%;fill:none;stroke:var(--node-color);stroke-width:.8;overflow:visible}.md-database>div{position:absolute;inset:48px 0 28px;display:flex;align-items:center;justify-content:center;gap:9px}.md-database strong{display:block;text-align:left;font-size:15px;font-weight:700;letter-spacing:.6px;color:var(--node-color)}.md-database small{display:block;text-align:left;font-size:8px;margin-top:4px;color:#bddbe9;letter-spacing:.3px}.md-orbital-core{position:absolute;width:228px;height:228px;bottom:1px;left:50%;transform:translateX(-50%);border:1px solid #258bce;border-radius:50%;background:radial-gradient(circle,#05284265,#030f1dd9 60%,#032341);box-shadow:0 0 25px #058dff30,inset 0 0 30px #119ae52b;z-index:2;overflow:hidden}.md-orbital-core::before,.md-orbital-core::after{content:'';position:absolute;border-radius:50%;pointer-events:none;z-index:2}.md-orbital-core::before{inset:7px;border:1px solid #24bbff80}.md-orbital-core::after{inset:13px;border:1px dashed #28b2ef90}.md-orbit-ring{position:absolute;inset:2px;border-radius:50%;border:3px solid transparent;border-top-color:#5fe4ff;border-bottom-color:#166eff;filter:drop-shadow(0 0 4px #0badff);pointer-events:none;z-index:3}.md-orbit-ring-two{inset:16px;border-width:1px;transform:rotate(70deg)}.md-orbit-crosshair{position:absolute;inset:0;background:linear-gradient(transparent 49.8%,#1495e328 50%,transparent 50.2%),linear-gradient(90deg,transparent 49.8%,#1495e328 50%,transparent 50.2%);z-index:1}.md-orbital-core img{position:absolute;left:22%;top:12%;width:56%;height:59%;object-fit:contain;mix-blend-mode:screen;filter:drop-shadow(0 0 7px #137cff75);opacity:.98}.md-core-label{position:absolute;bottom:37px;left:0;right:0;text-align:center;z-index:3}.md-core-label strong{font-size:17px;letter-spacing:1.7px;color:#9aeaff;text-shadow:0 0 8px #169dff}.md-core-label span{display:block;font-size:7px;letter-spacing:1.2px;color:#69cdec;margin-top:3px}.md-core-label small{display:block;font-size:6px;letter-spacing:.7px;color:#71a6bd;margin-top:8px}.md-center-caption{position:absolute;bottom:67px;left:3%;max-width:145px;color:#5286a5;text-transform:uppercase;font-size:8px;letter-spacing:1px;line-height:1.8}.md-center-caption span{display:block;border-top:1px solid #1a567d;border-bottom:1px solid #1a567d;padding:5px 0;color:#7ebbd6}.md-center-caption small{font-size:8px;color:#5f93b0;display:block;margin-top:8px}.md-status{position:absolute;right:0;bottom:8px;width:188px;z-index:3;padding:11px 12px;background:#04101df2}.md-status .md-panel-heading h2{font-size:11px}.md-status ul{list-style:none;padding:0;margin:0}.md-status li{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:9px;white-space:nowrap}.md-status li i{width:5px;height:5px;border:1px solid #5e7c8f;border-radius:50%}.md-status li i.available{background:#41e6b0;border-color:#41e6b0;box-shadow:0 0 6px #41e6b060}.md-status li span{color:#9abdd3}.md-status li b{margin-left:auto;color:#b8dfec;font-size:9px;font-weight:500}.md-key-metrics{padding:12px}.md-metrics-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;height:calc(100% - 27px)}.md-metric{min-width:0;position:relative;padding:11px 8px 6px;border:1px solid color-mix(in srgb,var(--metric-color) 40%,#071523);background:linear-gradient(160deg,color-mix(in srgb,var(--metric-color) 5%,#030d19),#020915);clip-path:polygon(7px 0,calc(100% - 7px) 0,100% 7px,100% calc(100% - 7px),calc(100% - 7px) 100%,7px 100%,0 calc(100% - 7px),0 7px);overflow:hidden}.md-metric>div{display:flex;gap:7px;align-items:center}.md-metric>div svg{color:var(--metric-color);flex-shrink:0}.md-metric>div span{font-size:8px;text-transform:uppercase;color:#b3d3e6;min-width:0}.md-metric strong{display:block;font-family:Arial,sans-serif;font-size:18px;font-weight:500;color:#f0f8ff;margin-top:5px;white-space:nowrap}.md-metric small{display:block;font-size:8px;color:#80dcaa;margin-top:9px;text-align:center;line-height:1.3}.md-metric .md-graph{height:45px;margin-top:10px}.md-flow-heading{display:flex;align-items:center;justify-content:center;gap:15px;margin:15px 0 10px}.md-flow-heading span{height:1px;background:linear-gradient(90deg,transparent,#17b8ff);width:23%}.md-flow-heading span:last-child{transform:rotate(180deg)}.md-flow-heading h2{font-size:12px;font-weight:500;letter-spacing:3px;text-transform:uppercase;padding:6px 24px;margin:0;border:1px solid #238bc2;clip-path:polygon(8px 0,calc(100% - 8px) 0,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px),0 8px);background:#061829;white-space:nowrap;color:#b4e6f5}.md-workflow-grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:13px}.md-workflow-card{padding:12px 12px 10px;text-align:left;min-height:162px;clip-path:polygon(9px 0,calc(100% - 9px) 0,100% 9px,100% calc(100% - 9px),calc(100% - 9px) 100%,9px 100%,0 calc(100% - 9px),0 9px)}.md-step-number{position:absolute;top:12px;left:12px;font-size:12px;color:#8eb6ce}.md-workflow-card>svg{display:block;margin:0 auto 7px;color:var(--md-accent);filter:drop-shadow(0 0 6px color-mix(in srgb,var(--md-accent) 55%,transparent))}.md-workflow-card h3{margin:0 0 8px;text-align:center;text-transform:uppercase;font-size:12px;font-weight:600;color:#8fe6ff}.md-workflow-card ul{padding:0;margin:0;list-style:none}.md-workflow-card li{font-size:11px;line-height:1.65;color:#96bed5;white-space:nowrap}.md-workflow-card li::before{content:'–';margin-right:6px;color:#70c6ea}.md-workflow-count{display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#6197ba;margin-top:7px}.md-progress{height:4px;border:1px solid #124b75;margin-top:3px;background:#020a14;border-radius:2px;overflow:hidden}.md-progress span{display:block;height:100%;box-shadow:0 0 6px #1ba4ff}.md-workflow-note{font-size:9px;text-align:center;color:#648da8;margin:7px 0 10px}.md-analytics-grid{display:grid;grid-template-columns:1.05fr 1.05fr 1.15fr 1fr;gap:13px;scroll-margin-top:18px}.md-analytics-grid>.md-panel{min-height:197px;padding:12px 13px}.md-chart-tabs{display:flex;align-items:center;border:1px solid #173c59;border-radius:3px;width:fit-content;max-width:100%;overflow:auto;margin-bottom:9px}.md-chart-tabs button{font-size:9px;color:#83aeca;background:transparent;border:0;padding:4px 11px;white-space:nowrap}.md-chart-tabs button.is-active{color:#e0f4ff;background:#0c3e73;box-shadow:inset 0 0 10px #125fc640}.md-chart-number{display:flex;align-items:center;gap:12px;color:#f0f7ff;font-size:23px;font-family:Arial,sans-serif;font-weight:500;white-space:nowrap}.md-chart-number small{font-family:Rajdhani,Arial,sans-serif;font-size:10px;color:#86e7ac}.md-analytics-grid .md-graph{height:89px;margin-top:3px}.md-chart-axis{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:8px;color:#7dabc7;margin-top:2px}.md-chart-axis a{color:#85cce8}.md-line-legend{display:flex;align-items:center;gap:9px;margin:7px 0 3px;flex-wrap:wrap}.md-line-legend span{display:flex;align-items:center;gap:4px;font-size:8px;color:#83adca}.md-line-legend i{height:4px;width:4px}.md-multi-chart{position:relative;height:101px}.md-multi-chart .md-graph{position:absolute;inset:0;height:95px}.md-table-wrap{overflow-x:auto}.md-campaign-panel table{width:100%;border-collapse:collapse;font-size:9px;white-space:nowrap}.md-campaign-panel th{font-weight:500;color:#7baccb;text-align:right;padding:5px 5px 7px;border-bottom:1px solid #1d4864}.md-campaign-panel td{padding:8px 5px;border-bottom:1px solid #16405b55;text-align:right;color:#b8d6e9}.md-campaign-panel th:first-child,.md-campaign-panel td:first-child{text-align:left;padding-left:0;max-width:125px;overflow:hidden;text-overflow:ellipsis}.md-campaign-panel td i{display:inline-block;width:5px;height:5px;border-radius:50%;margin-right:5px}.md-campaign-panel .md-positive{color:#7be9b0}.md-panel-link{display:inline-flex;gap:5px;align-items:center;font-size:9px;color:#7dbcdc;margin-top:10px}.md-audience{display:flex;align-items:center;gap:15px;justify-content:center;margin-top:8px}.md-audience .md-donut{width:129px;height:129px}.md-audience li{font-size:11px;gap:8px;margin:10px 0}.md-audience li span{max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.md-footer{display:flex;justify-content:space-between;gap:15px;align-items:center;color:#4e7b99;font-size:9px;padding-top:14px}.md-footer>span:first-child{letter-spacing:2px}.md-footer a{display:flex;gap:5px;align-items:center;color:#79b8d8}.md-empty{font-size:11px;color:#7a9fba;margin:15px 0;line-height:1.6}.md-workbench{position:relative;border:1px solid #3c92b8;background:linear-gradient(100deg,#08253b,#061321);padding:18px 22px;margin:3px 0 15px;scroll-margin-top:16px}.md-workbench-title{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.md-workbench-title span{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#60cfee}.md-workbench-title h2{font-family:Rajdhani,Arial,sans-serif;font-size:23px;font-weight:500;color:#d0efff;margin:5px 0 0}.md-workbench-title>button{background:transparent;border:0;color:#8fc3dd;padding:3px}.md-workbench-body{display:flex;flex-direction:column;gap:12px;align-items:flex-start}.md-workbench-body p{font-size:13px;color:#94b7cf;line-height:1.6;max-width:900px;margin:9px 0 0}.md-action{display:inline-flex;align-items:center;gap:8px;border:1px solid #2995c6;background:#0b3855;color:#b9f2ff!important;padding:8px 12px;font-size:12px;border-radius:3px;min-height:34px}.md-workbench-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.md-workbench-actions>a{display:flex;align-items:center;gap:6px;font-size:12px;color:#7ec3e6}.md-task-form{display:flex;gap:10px;align-items:center;flex-wrap:wrap;width:100%;max-width:840px}.md-task-form label:first-child{flex:1;min-width:220px}.md-task-form input{width:100%;background:#020c18;color:#ccecff;border:1px solid #255b7b;border-radius:3px;padding:9px 11px;font-size:13px;min-height:36px;color-scheme:dark}.md-task-form input::placeholder{color:#658ca9}.md-workbench-body .md-success{color:#6fe6b1;margin:0;font-size:12px}.media-dashboard .evo-surface{--evo-cut:9px;--evo-corner-size:26px}.md-nav.evo-surface,.md-period.evo-surface{--evo-rail-width:8px}.md-panel.evo-surface,.md-workflow-card.evo-surface,.md-source.evo-surface{--evo-rail-width:11px}
@media(min-width:1600px){.media-dashboard{padding-left:28px;padding-right:28px}.md-system-grid{grid-template-columns:265px minmax(0,1fr) 270px}.md-traffic-row{grid-template-columns:minmax(0,1fr) 270px}.md-system-center{min-height:370px}.md-orbital-core{width:250px;height:250px}.md-database{height:155px}.md-core-label{bottom:42px}.md-status{width:210px}.md-center-caption{max-width:170px}.md-metric strong{font-size:21px}.md-activity-body{gap:16px}.md-activity li{font-size:11px}.md-workflow-card{min-height:178px;padding:14px 16px}.md-workflow-card li{font-size:12px}.md-audience{gap:20px}}
@media(max-width:1390px){.md-command-header{grid-template-columns:250px minmax(400px,1fr) 150px;gap:12px}.md-brand h1{font-size:22px;letter-spacing:3px}.md-brand p{font-size:8px;letter-spacing:3px}.md-nav button{font-size:9px;padding:9px 7px}.md-source{padding:10px}.md-source-value{gap:6px}.md-source-value>svg{width:25px}.md-source-value strong{font-size:15px}.md-mini-bars{width:30px;gap:2px}.md-source-name{gap:5px;font-size:9px}.md-system-grid{grid-template-columns:200px minmax(0,1fr) 220px;gap:12px}.md-traffic-row{grid-template-columns:minmax(0,1fr) 220px;gap:12px}.md-activity-body{flex-direction:column;gap:0}.md-activity .md-donut{width:95px;height:95px}.md-activity ul{display:grid;grid-template-columns:1fr 1fr;column-gap:9px;width:100%}.md-activity li{margin:3px 0;font-size:8px;gap:4px}.md-agents small{font-size:7px}.md-agents button{gap:6px;font-size:11px}.md-system-center{min-height:363px}.md-status{width:155px;padding:10px}.md-status li{font-size:8px;gap:4px}.md-status li b{font-size:8px}.md-status .md-panel-heading h2{font-size:10px}.md-orbital-core{width:213px;height:213px}.md-center-caption{max-width:115px;left:0;font-size:7px}.md-center-caption small{font-size:7px}.md-database strong{font-size:13px}.md-database small{font-size:7px}.md-database>div{gap:5px}.md-database>div svg{width:22px}.md-metric strong{font-size:16px}.md-metric>div{gap:4px}.md-metric>div>svg{width:19px}.md-workflow-grid{gap:9px}.md-workflow-card{padding:12px 10px;min-height:162px}.md-workflow-card li{font-size:10px}.md-workflow-card h3{font-size:11px}.md-step-number{font-size:10px;left:9px}.md-analytics-grid{gap:10px;grid-template-columns:1fr 1fr 1.15fr 1fr}.md-panel-heading h2{font-size:10px}.md-audience{gap:8px}.md-audience .md-donut{width:100px;height:100px}.md-audience .md-donut strong{font-size:20px}.md-audience li{font-size:9px}.md-campaign-panel table{font-size:8px}.md-chart-tabs button{padding:4px 8px}.md-analytics-grid>.md-panel{padding:12px 10px}.md-chart-number{font-size:21px;gap:7px}.md-chart-number small{font-size:8px}}
@media(max-width:1120px){.media-dashboard{padding:14px}.md-command-header{grid-template-columns:1fr 170px;gap:10px}.md-brand{grid-column:1}.md-nav{grid-column:1/-1;grid-row:2;justify-content:space-between}.md-nav button{font-size:10px;padding:9px 15px}.md-period{grid-column:2;grid-row:1}.md-mode-bar{align-items:flex-start}.md-mode-bar p{font-size:9px;max-width:440px}.md-source-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.md-source-value{margin-top:8px}.md-source-value strong{font-size:18px}.md-source-value>svg{width:29px}.md-mini-bars{width:55px}.md-traffic-total .md-graph{height:100px}.md-traffic-total .md-large-number{margin-top:15px}.md-source-name{font-size:10px}.md-system-grid{grid-template-columns:185px minmax(0,1fr) 205px;gap:10px;margin-top:20px}.md-center-caption{display:none}.md-status{width:140px;right:-2px;bottom:1px}.md-orbital-core{left:39%;bottom:8px;width:200px;height:200px}.md-database{height:130px}.md-database>div{inset:44px 0 24px;gap:4px;flex-direction:column}.md-database>div>svg{display:none}.md-database strong{text-align:center;font-size:12px}.md-database small{text-align:center;font-size:6px}.md-metrics-grid{gap:8px}.md-metric{padding:9px 5px}.md-metric>div>svg{display:none}.md-metric strong{font-size:16px}.md-workflow-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.md-workflow-card{padding:12px 16px;min-height:160px}.md-workflow-card li{font-size:11px}.md-workflow-card h3{font-size:12px}.md-analytics-grid{grid-template-columns:1fr 1fr}.md-analytics-grid>.md-panel{padding:14px;min-height:205px}.md-panel-heading h2{font-size:11px}.md-campaign-panel table{font-size:10px}.md-audience .md-donut{width:135px;height:135px}.md-audience{gap:30px}.md-audience li{font-size:11px}.md-chart-number{font-size:24px}}
@media(max-width:820px){.md-topline>span{display:none}.md-topline{font-size:10px}.md-system-grid{grid-template-columns:1fr 1fr}.md-system-center{grid-column:1/-1;grid-row:1;min-height:390px}.md-orbital-core{left:50%;width:235px;height:235px;bottom:0}.md-database{height:150px}.md-database>div{flex-direction:row;inset:46px 0 26px;gap:8px}.md-database>div>svg{display:block}.md-database strong{font-size:14px}.md-database small{font-size:8px}.md-status{width:180px;right:0;bottom:14px}.md-status li{font-size:9px}.md-left-stack{grid-column:1;grid-row:2;grid-template-columns:1fr;gap:10px}.md-key-metrics{grid-column:2;grid-row:2}.md-activity-body{flex-direction:row;gap:15px}.md-activity ul{display:block}.md-activity li{font-size:10px;margin:7px 0}.md-activity .md-donut{width:105px;height:105px}.md-agents small{font-size:9px}.md-metric>div>svg{display:block}.md-metric strong{font-size:21px}.md-metric{padding:12px 9px}.md-metric .md-graph{height:65px}.md-nav button{padding:8px;font-size:9px}.md-traffic-row{grid-template-columns:1fr}.md-traffic-total{display:none}.md-mode-bar{flex-direction:column;gap:7px}.md-mode-bar p{text-align:left;max-width:none}.md-footer{flex-wrap:wrap;font-size:9px}.md-flow-heading h2{font-size:11px;letter-spacing:2px}.md-center-caption{display:block;max-width:145px;left:0}.md-workbench-title h2{font-size:20px}}
@media(max-width:600px){.media-dashboard{padding:10px}.md-command-header{grid-template-columns:1fr 128px}.md-brand h1{font-size:17px;letter-spacing:2px}.md-brand p{font-size:6px;letter-spacing:2px}.md-period{font-size:10px;padding:9px}.md-nav{overflow-x:auto;justify-content:flex-start;clip-path:none!important;padding:5px;gap:4px}.md-nav button{font-size:9px;padding:7px 10px}.md-topline a:last-child{font-size:9px}.md-source-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.md-source-value strong{font-size:17px}.md-source-value>svg{width:26px}.md-system-center{min-height:350px}.md-database{height:125px}.md-database>div>svg{display:none}.md-database strong{font-size:12px}.md-database small{font-size:6px}.md-status{display:none}.md-center-caption{display:none}.md-orbital-core{width:220px;height:220px}.md-left-stack{gap:9px}.md-left-stack .md-panel{padding:10px}.md-agents button{font-size:10px;gap:5px}.md-agents svg{width:17px}.md-agents small{font-size:7px}.md-agents i{display:none}.md-activity-body{flex-direction:column;gap:0}.md-activity ul{display:grid;grid-template-columns:1fr 1fr;column-gap:7px}.md-activity li{font-size:8px;margin:3px 0;gap:3px}.md-panel-heading h2{font-size:10px}.md-panel-heading>span{font-size:6px}.md-metrics-grid{gap:7px}.md-metric{padding:9px 5px}.md-metric>div>svg{display:none}.md-metric strong{font-size:15px}.md-metric small{font-size:7px}.md-metric .md-graph{height:50px}.md-workflow-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.md-workflow-card{min-height:162px;padding:13px 16px}.md-workflow-card li{font-size:11px}.md-analytics-grid{grid-template-columns:1fr}.md-analytics-grid>.md-panel{min-height:210px}.md-audience{justify-content:space-around}.md-audience ul{max-width:160px}.md-footer>span:nth-child(2){order:3;width:100%;font-size:8px}.md-task-form label:first-child{min-width:100%;width:100%}.md-task-form label:nth-child(2){flex:1;min-width:120px}.md-workbench{padding:14px}.md-workbench-body p{font-size:12px}}
@media(prefers-reduced-motion:reduce){.media-dashboard *{scroll-behavior:auto!important;transition:none!important}}
`;
