import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Zap } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { mainNav, secondaryNav } from "./Sidebar";
export function AppBrandBar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <div className="self-end lg:hidden" data-compact-navigation>
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
            <a
              href="/?section=evo"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hud-label text-xs border border-primary/40 bg-primary/10 text-primary"
            >
              <Zap className="h-4 w-4" /> Evo Assistant
            </a>
            {[...mainNav, ...secondaryNav].map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : void 0}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md hud-label text-xs border",
                    active
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-transparent text-foreground/80 hover:bg-primary/5",
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
  );
}
