import { useState } from "react";
import { Link, useLocation, useRouterState } from "@tanstack/react-router";
import { Menu, Zap } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { mainNav, secondaryNav } from "./Sidebar";

function sectionLabel(pathname: string, search: Record<string, unknown>): string {
  if (pathname === "/") return search.section === "evo" ? "Evo Assistant" : "Dashboard";
  const all = [...mainNav, ...secondaryNav];
  const hit = all.find((n) => n.to !== "/" && pathname.startsWith(n.to));
  if (!hit) return "";
  if (hit.to === "/business") {
    const s = search.section;
    if (s === "content-creator") return "Business · Content Creator";
    if (s === "media-system" || s === "marketing-system") return "Business · Media System";
    if (s === "social-media") return "Business · Social Media";
    if (s === "projects") return "Business · Projects";
  }
  return hit.label;
}

/** Shared top brand header for every desktop/tablet page (incl. Settings and Evo Assistant). */
export function AppBrandBar() {
  const { pathname } = useLocation();
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const [open, setOpen] = useState(false);
  const label = sectionLabel(pathname, search);

  return (
    <header className="hud-card px-4 py-3 sm:px-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <Link to="/" aria-label="Evolution OS home" className="min-w-0 justify-self-start">
        <BrandMark />
      </Link>
      <div className="flex items-center gap-3 shrink-0">
        {label && (
          <span aria-current="page" className="hud-label text-[10px] sm:text-xs text-primary border border-primary/40 bg-primary/10 rounded-md px-3 py-1.5 max-w-[46vw] truncate">
            {label}
          </span>
        )}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open navigation"
              className="lg:hidden h-10 w-10 rounded-md border border-border flex items-center justify-center text-primary hover:bg-primary/10"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <BrandMark compact />
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1" aria-label="Main">
              <a href="/?section=evo" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hud-label text-xs border border-primary/40 bg-primary/10 text-primary">
                <Zap className="h-4 w-4" /> Evo Assistant
              </a>
              {[...mainNav, ...secondaryNav].map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md hud-label text-xs border",
                      active ? "bg-primary/10 border-primary/40 text-primary" : "border-transparent text-foreground/80 hover:bg-primary/5",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
