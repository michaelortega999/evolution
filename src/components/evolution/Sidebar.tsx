import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Home, Wallet, Apple, Dumbbell, FileText, NotebookPen,
  TrendingUp, Briefcase, Star, Calendar, Target, BarChart3, Settings, Zap,
} from "lucide-react";
import bonsaiImg from "@/assets/bonsai.png";

const mainNav = [
  { icon: Home, label: "Dashboard", num: "", to: "/" as const },
  { icon: Wallet, label: "Wealth", num: "1", to: "/wealth" as const },
  { icon: Apple, label: "Nutrition", num: "2", to: "/nutrition" as const },
  { icon: Dumbbell, label: "Fitness", num: "3", to: "/fitness" as const },
  { icon: FileText, label: "Journal", num: "4", to: "/journal" as const },
  { icon: NotebookPen, label: "Notes", num: "5", to: "/notes" as const },
  { icon: TrendingUp, label: "Investing", num: "6", to: "/investing" as const },
  { icon: Briefcase, label: "Business", num: "7", to: "/business" as const },
  { icon: Star, label: "Hobby", num: "8", to: "/hobby" as const },
];

const secondaryNav = [
  { icon: Calendar, label: "Calendar", to: "/calendar" as const },
  { icon: Target, label: "Goals", to: "/goals" as const },
  { icon: Zap, label: "Focus", to: "/focus" as const },
  { icon: BarChart3, label: "Reports", to: "/reports" as const },
  { icon: Settings, label: "Settings", to: "/settings" as const },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hud-card p-4 flex flex-col gap-1 w-full h-full">
      <div className="mb-4 pb-4 border-b border-border flex flex-col items-center text-center gap-3">
        <div>
          <div className="hud-label text-primary hud-glow text-sm">Evolution</div>
          <div className="hud-label text-[8px] text-muted-foreground">Growing today, building forever</div>
        </div>
        <div className="rounded-full border border-primary/50 bg-primary/5 flex items-center justify-center" style={{ width: 96, height: 96 }}>
          <img
            src={bonsaiImg}
            alt="Bonsai"
            width={512}
            height={512}
            className="object-contain"
            style={{ width: 88, height: 88, filter: "drop-shadow(0 0 6px oklch(0.78 0.22 240 / 0.85))" }}
          />
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {mainNav.map((item) => {
          const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all hud-label text-xs border",
                isActive
                  ? "bg-primary/10 border-primary/40 text-primary hud-glow"
                  : "border-transparent text-foreground/70 hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.num && <span className="text-[10px] opacity-60 w-3">{item.num}</span>}
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="h-px bg-border my-3" />

        {secondaryNav.map((item) => {
          const isActive = pathname.startsWith(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all hud-label text-xs border",
                isActive
                  ? "bg-primary/10 border-primary/40 text-primary hud-glow"
                  : "border-transparent text-foreground/70 hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center text-primary hud-label text-xs">M</div>
        <div className="flex-1 min-w-0">
          <div className="hud-label text-xs text-foreground truncate">Michael</div>
          <div className="hud-label text-[9px] text-muted-foreground">Premium Member</div>
        </div>
      </div>
    </aside>
  );
}
