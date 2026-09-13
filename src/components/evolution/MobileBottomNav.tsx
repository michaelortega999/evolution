import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, CheckSquare, Home, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Home", to: "/" as const, icon: Home },
  { label: "Stats", to: "/reports" as const, icon: BarChart3 },
  { label: "Tasks", to: "/notes" as const, icon: CheckSquare },
  { label: "Profile", to: "/settings" as const, icon: UserRound },
];

function BonsaiMark() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M56 84c-1-18 8-25 5-38M60 66c-11-2-17-9-20-18M60 57c10-4 16-11 19-20M56 76c-8 2-14 7-18 13M62 68c8 2 14 7 18 14" strokeWidth="4" />
        <path d="M20 43c5-13 17-17 29-11 1-12 12-20 24-15 9 3 12 10 12 17 13-1 22 7 21 18-1 10-10 16-21 15-3 10-13 15-23 10-8 8-22 5-26-5-13 2-23-5-22-16 0-6 3-10 6-13Z" strokeWidth="3" />
        <path d="M35 93h51l-7 13H43Z" strokeWidth="3" />
        <path d="M30 108h61" strokeWidth="3" />
      </g>
    </svg>
  );
}

export function MobileBottomNav({ fixed = false, onCenter }: { fixed?: boolean; onCenter?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navClassName = fixed ? "code-bottom-nav code-bottom-nav--fixed md:hidden" : "code-bottom-nav";

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
    <nav className={navClassName} aria-label="Mobile navigation">
      {NAV_ITEMS.slice(0, 2).map(navLink)}
      {onCenter ? (
        <Button type="button" variant="ghost" className="code-bottom-bonsai" onClick={onCenter} aria-label="Home hub">
          <BonsaiMark />
        </Button>
      ) : (
        <Link to="/" className="code-bottom-bonsai" aria-label="Home hub">
          <BonsaiMark />
        </Link>
      )}
      {NAV_ITEMS.slice(2).map(navLink)}
    </nav>
  );
}