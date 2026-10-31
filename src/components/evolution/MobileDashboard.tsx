import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Dumbbell,
  Home,
  LineChart,
  ListChecks,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Salad,
  Target,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/evolution/BrandMark";
import { useEvolutionData } from "@/lib/evolution-data";
import { hologramSrc } from "@/lib/holograms";
import { formatMmSs, useFocusTimer } from "@/lib/use-focus-timer";

type ModuleNode = {
  label: string;
  to: "/wealth" | "/fitness" | "/nutrition" | "/focus" | "/investing" | "/business" | "/journal";
  icon: LucideIcon;
  /** Position on the radial layout, in % of the stage. */
  x: number;
  y: number;
};

// Same radial arrangement as the original phone Home artwork, now live and themeable.
const MODULES: ModuleNode[] = [
  { label: "Focus", to: "/focus", icon: Target, x: 50, y: 12 },
  { label: "Nutrition", to: "/nutrition", icon: Salad, x: 22, y: 20 },
  { label: "Wealth", to: "/wealth", icon: Wallet, x: 78, y: 20 },
  { label: "Fitness", to: "/fitness", icon: Dumbbell, x: 12, y: 46 },
  { label: "Investing", to: "/investing", icon: LineChart, x: 88, y: 46 },
  { label: "Journal", to: "/journal", icon: NotebookPen, x: 22, y: 74 },
  { label: "Business", to: "/business", icon: Briefcase, x: 78, y: 74 },
];

const BOTTOM_LINKS = [
  { label: "Home", to: "/" as const, icon: Home },
  { label: "Stats", to: "/reports" as const, icon: BarChart3 },
  { label: "Tasks", to: "/notes" as const, icon: ListChecks },
  { label: "Profile", to: "/settings" as const, icon: User },
];

function LiveDateTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return <div className="live-hud-date" aria-hidden="true" />;
  return (
    <div className="live-hud-date" aria-label={now.toLocaleString()}>
      <CalendarDays aria-hidden="true" />
      <div>
        <b>{now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase()}</b>
        <strong>
          {now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
        </strong>
        <span>{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

function FocusPanel() {
  const timer = useFocusTimer();
  return (
    <section className="live-hud-focus hud-card" aria-label="Focus timer">
      <Link to="/focus" className="live-hud-focus__title">
        Focus session
      </Link>
      <output className="live-hud-focus__time" aria-live="polite">
        {formatMmSs(timer.remainingMs)}
      </output>
      <div className="live-hud-focus__controls">
        <button type="button" onClick={timer.pause} aria-label="Pause focus timer">
          <Pause aria-hidden="true" />
        </button>
        <button type="button" className="is-main" onClick={timer.start} aria-label="Start focus timer">
          <Play aria-hidden="true" />
        </button>
        <button type="button" onClick={timer.reset} aria-label="Restart focus timer">
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export function MobileDashboard() {
  const { data } = useEvolutionData();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="live-hud-screen md:hidden">
      <header className="live-hud-header">
        <Link to="/" aria-label="Evolution OS home" className="live-hud-brand">
          <BrandMark compact />
        </Link>
        <LiveDateTime />
      </header>

      <main className="live-hud-stage">
        <div className="live-hud-rings" aria-hidden="true">
          <span />
          <span />
        </div>
        <button type="button" className="live-hud-core" onClick={scrollToTop} aria-label="Return to top">
          <img src={hologramSrc(data.profile?.hologram)} alt="" draggable={false} />
        </button>
        {MODULES.map((m, i) => (
          <Link
            key={m.label}
            to={m.to}
            className="live-hud-node"
            style={{ left: `${m.x}%`, top: `${m.y}%`, animationDelay: `${i * -1.4}s` }}
          >
            <span className="live-hud-node__ring" aria-hidden="true" />
            <m.icon aria-hidden="true" />
            <span className="live-hud-node__label">{m.label}</span>
          </Link>
        ))}
      </main>

      <FocusPanel />

      <nav className="live-hud-nav" aria-label="Main">
        {BOTTOM_LINKS.slice(0, 2).map((item) => (
          <Link key={item.label} to={item.to}>
            <item.icon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ))}
        <button type="button" className="live-hud-nav__core" onClick={scrollToTop} aria-label="Return to home dashboard">
          <img src={hologramSrc(data.profile?.hologram)} alt="" draggable={false} />
        </button>
        {BOTTOM_LINKS.slice(2).map((item) => (
          <Link key={item.label} to={item.to}>
            <item.icon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
