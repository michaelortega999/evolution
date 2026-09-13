import { Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  Dumbbell,
  Hourglass,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileBottomNav } from "./MobileBottomNav";
import { hologramSrc } from "@/lib/holograms";
import { formatMmSs, useFocusTimer } from "@/lib/use-focus-timer";
import { MONTH_LABELS, useSelectedMonth } from "@/lib/use-selected-month";

type ModuleNode = {
  label: string;
  system: string;
  to: "/wealth" | "/fitness" | "/nutrition" | "/focus" | "/investing" | "/business" | "/journal";
  icon: LucideIcon;
  x: number;
  y: number;
};

const MODULES: ModuleNode[] = [
  { label: "Focus", system: "SYS-04", to: "/focus", icon: Hourglass, x: 50, y: 11 },
  { label: "Nutrition", system: "SYS-03", to: "/nutrition", icon: Leaf, x: 25.5, y: 28 },
  { label: "Wealth", system: "SYS-02", to: "/wealth", icon: Coins, x: 74.5, y: 28 },
  { label: "Fitness", system: "SYS-01", to: "/fitness", icon: Dumbbell, x: 14.8, y: 52 },
  { label: "Investing", system: "SYS-05", to: "/investing", icon: TrendingUp, x: 85.2, y: 52 },
  { label: "Journal", system: "SYS-07", to: "/journal", icon: BookOpen, x: 23.3, y: 76 },
  { label: "Business", system: "SYS-06", to: "/business", icon: BriefcaseBusiness, x: 76.7, y: 76 },
];

function LiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return (
    <div className="code-hud-date" aria-label={now.toLocaleString()}>
      <CalendarDays aria-hidden="true" />
      <div>
        <b>{now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase()}</b>
        <strong>{now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</strong>
        <span>{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

function CircuitLayer() {
  return (
    <svg className="code-hud-circuits" viewBox="0 0 886 1824" preserveAspectRatio="none" aria-hidden="true">
      <g className="code-hud-trace">
        <path d="M22 72V204M864 72V204M42 322H142L188 366M844 322H744L698 366" />
        <path d="M25 410V860L78 914H260L314 968H372" />
        <path d="M861 410V860L808 914H626L572 968H514" />
        <path d="M443 292V785M443 402H384L344 442V590L305 629H226" />
        <path d="M443 402H502L542 442V590L581 629H660" />
        <path d="M443 540H374L338 576V748L294 792H194" />
        <path d="M443 540H512L548 576V748L592 792H692" />
        <path d="M443 642H406V842M443 642H480V842" />
        <path d="M37 1120V1480M849 1120V1480M443 1064V1518" />
      </g>
      <g className="code-hud-nodes">
        {[292, 402, 540, 642, 785, 842, 968, 1064, 1518].map((y, index) => <circle key={`node-${index}-${y}`} cx="443" cy={y} r="4" />)}
        <circle cx="226" cy="629" r="3" /><circle cx="660" cy="629" r="3" />
        <circle cx="194" cy="792" r="3" /><circle cx="692" cy="792" r="3" />
      </g>
    </svg>
  );
}

function MonthRail() {
  const selected = useSelectedMonth();
  const now = new Date();
  return (
    <nav className="code-hud-months" aria-label="Select month">
      <span className="code-hud-chevron">‹</span>
      {MONTH_LABELS.map((month, index) => {
        const isCurrent = selected.year === now.getFullYear() && index === now.getMonth();
        const isPast = index < now.getMonth();
        return (
          <Button
            key={month}
            type="button"
            variant="ghost"
            className={isCurrent ? "is-current" : isPast ? "is-past" : ""}
            onClick={() => selected.setMonth(index, now.getFullYear())}
            aria-current={isCurrent ? "date" : undefined}
          >
            {month}
          </Button>
        );
      })}
      <span className="code-hud-chevron">›</span>
    </nav>
  );
}

function ModuleOrb({ node, index }: { node: ModuleNode; index: number }) {
  const Icon = node.icon;
  return (
    <Link
      to={node.to}
      aria-label={`Open ${node.label}`}
      className="code-hud-module"
      style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${index * -1.3}s` }}
    >
      <span className="code-hud-orbit code-hud-orbit--outer" />
      <span className="code-hud-orbit code-hud-orbit--tilt" />
      <span className="code-hud-orbit code-hud-orbit--inner" />
      <span className="code-hud-module-icon"><Icon aria-hidden="true" /></span>
      <span className="code-hud-module-copy"><b>{node.label}</b><small>{node.system}</small></span>
    </Link>
  );
}

function CenterBonsai({ onActivate }: { onActivate: () => void }) {
  return (
    <Button type="button" variant="ghost" className="code-hud-bonsai" onClick={onActivate} aria-label="Return to top">
      <span className="code-hud-bonsai-rings" />
      <img src={hologramSrc("bonsai")} alt="" draggable={false} />
    </Button>
  );
}

function FocusPanel() {
  const timer = useFocusTimer();
  return (
    <section className="code-focus-panel" aria-label="Focus timer">
      <header><Hourglass aria-hidden="true" /><span>Focus</span><i>•••</i></header>
      <Link to="/focus" className="code-focus-display" aria-label="Open Focus page">
        <span className="code-focus-orbit"><Hourglass aria-hidden="true" /></span>
        <output aria-live="polite">{formatMmSs(timer.remainingMs)}</output>
        <small>Deep Work</small>
      </Link>
      <div className="code-focus-actions">
        <div><Button type="button" variant="ghost" size="icon" onClick={timer.reset} aria-label="Restart focus timer"><RotateCcw /></Button><span>Restart</span></div>
        <div><Button type="button" variant="ghost" size="icon" onClick={timer.start} aria-label="Start focus timer"><Play /></Button><span>Start</span></div>
        <div><Button type="button" variant="ghost" size="icon" onClick={timer.pause} aria-label="Pause focus timer"><Pause /></Button><span>Pause</span></div>
      </div>
    </section>
  );
}

export function MobileDashboard() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <div className="code-mobile-screen md:hidden">
      <main className="code-mobile-stage">
        <div className="code-hud-grid" aria-hidden="true" />
        <CircuitLayer />
        <header className="code-hud-header">
          <div className="code-hud-brand"><strong>Evolution <span>OS</span></strong><small>Higher standards. Brighter days.</small></div>
          <LiveDateTime />
          <Bell className="code-hud-bell" aria-label="Notifications" />
        </header>
        <MonthRail />
        <section className="code-module-field" aria-label="Evolution modules">
          {MODULES.map((node, index) => <ModuleOrb key={node.label} node={node} index={index} />)}
          <CenterBonsai onActivate={scrollToTop} />
        </section>
        <FocusPanel />
        <MobileBottomNav onCenter={scrollToTop} />
      </main>
    </div>
  );
}