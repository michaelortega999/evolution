import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface HudCardProps {
  icon?: LucideIcon;
  number?: string;
  title: string;
  children: React.ReactNode;
  footer?: string;
  className?: string;
}

export function HudCard({ icon: Icon, number, title, children, footer = "View details", className }: HudCardProps) {
  return (
    <div className={cn("hud-card hud-scan p-5 flex flex-col", className)}>
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center bg-primary/5">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        {number && <span className="hud-label text-primary text-lg hud-glow">{number}</span>}
        <h3 className="hud-label text-sm text-foreground/90">{title}</h3>
      </div>
      <div className="flex-1">{children}</div>
      <button className="mt-4 flex items-center gap-1 text-[10px] hud-label text-primary/80 hover:text-primary transition-colors">
        {footer} <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
