import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, CheckSquare, Home, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hologramSrc } from "@/lib/holograms";

const NAV_ITEMS = [
  { label: "Home", to: "/" as const, icon: Home },
  { label: "Stats", to: "/reports" as const, icon: BarChart3 },
  { label: "Tasks", to: "/notes" as const, icon: CheckSquare },
  { label: "Profile", to: "/settings" as const, icon: UserRound },
];

export function MobileBottomNav({ fixed = false, onCenter }: { fixed?: boolean; onCenter?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navClassName = fixed ? "code-bottom-nav code-bottom-nav--fixed md:hidden" : "code-bottom-nav";

  if (fixed && (pathname === "/" || pathname === "/auth")) return null;

  const navLink = ({ label, to, icon: Icon }: (typeof NAV_ITEMS)[number]) => {
    const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
    return (
      <Link key={label} to={to} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {fixed && <div className="mobile-bottom-nav-spacer md:hidden" aria-hidden="true" />}
      <nav className={navClassName} aria-label="Mobile navigation">
        {NAV_ITEMS.slice(0, 2).map(navLink)}
        {onCenter ? (
          <Button type="button" variant="ghost" className="code-bottom-bonsai" onClick={onCenter} aria-label="Home hub">
            <img src={hologramSrc("bonsai")} alt="" draggable={false} />
          </Button>
        ) : (
          <Link to="/" className="code-bottom-bonsai" aria-label="Home hub">
            <img src={hologramSrc("bonsai")} alt="" draggable={false} />
          </Link>
        )}
        {NAV_ITEMS.slice(2).map(navLink)}
      </nav>
    </>
  );
}