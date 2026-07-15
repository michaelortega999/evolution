import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Home, Wallet, Apple, Dumbbell, FileText, CheckSquare,
  TrendingUp, Briefcase, Star, Calendar, Target, BarChart3, Settings, Zap, LogOut, LogIn,
} from "lucide-react";
import { useEvolutionData } from "@/lib/evolution-data";
import { HologramPicker } from "./HologramPicker";
import { HologramEmblem } from "./HologramEmblem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mainNav = [
  { icon: Home, label: "Dashboard", num: "", to: "/" as const },
  { icon: CheckSquare, label: "Tasks", num: "1", to: "/notes" as const },
  { icon: Zap, label: "Focus", num: "2", to: "/focus" as const },
  { icon: Wallet, label: "Wealth", num: "3", to: "/wealth" as const },
  { icon: Apple, label: "Nutrition", num: "4", to: "/nutrition" as const },
  { icon: Dumbbell, label: "Fitness", num: "5", to: "/fitness" as const },
  { icon: TrendingUp, label: "Investing", num: "6", to: "/investing" as const },
  { icon: Briefcase, label: "Business", num: "7", to: "/business" as const },
  { icon: Star, label: "Hobby", num: "8", to: "/hobby" as const },
];

const secondaryNav = [
  { icon: Calendar, label: "Calendar", to: "/calendar" as const },
  { icon: Target, label: "Goals", to: "/goals" as const },
  { icon: FileText, label: "Journal", to: "/journal" as const },
  { icon: BarChart3, label: "Reports", to: "/reports" as const },
  { icon: Settings, label: "Settings", to: "/settings" as const },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data, updateProfile } = useEvolutionData();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <aside className="hud-card p-4 flex flex-col gap-1 w-full h-full">
      <div className="mb-4 pb-4 border-b border-border flex flex-col items-center text-center gap-3">
        <div>
          <div className="hud-label text-primary hud-glow text-sm">Evolution</div>
          <div className="hud-label text-[8px] text-muted-foreground">Growing today, building forever</div>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-label="Change hologram"
          className="rounded-full border border-primary/50 bg-primary/5 flex items-center justify-center transition-all hover:bg-primary/10 hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{ width: 96, height: 96 }}
        >
          <HologramEmblem kind={data.profile.hologram} size={84} />
        </button>
        <HologramPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          value={data.profile.hologram}
          onSelect={(h) => updateProfile({ hologram: h })}
        />
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
              <item.icon className="h-4 w-4 shrink-0" style={{ color: "oklch(0.85 0.28 145)", filter: "drop-shadow(0 0 4px oklch(0.85 0.28 145 / 0.8))" }} />
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
              <item.icon className="h-4 w-4" style={{ color: "oklch(0.85 0.28 145)", filter: "drop-shadow(0 0 4px oklch(0.85 0.28 145 / 0.8))" }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center text-primary hud-label text-xs">
          {(userEmail?.[0] ?? data.profile.name?.[0] ?? "M").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="hud-label text-xs text-foreground truncate">{data.profile.name || "Operator"}</div>
          <div className="hud-label text-[9px] text-muted-foreground truncate">
            {userEmail ?? "Not signed in"}
          </div>
        </div>
        {userEmail ? (
          <button
            onClick={signOut}
            title="Sign out"
            className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-primary hover:bg-primary/10"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            to="/auth"
            title="Sign in"
            className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-primary hover:bg-primary/10"
          >
            <LogIn className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </aside>
  );
}
