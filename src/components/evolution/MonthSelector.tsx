import { MONTH_LABELS, useSelectedMonth } from "@/lib/use-selected-month";

export function MonthSelector() {
  const { month, setMonth } = useSelectedMonth();

  return (
    <div
      className="w-full rounded-md border border-border bg-background/80 backdrop-blur px-3 py-2.5 md:py-3.5 relative overflow-hidden"
      style={{
        boxShadow: "inset 0 0 18px color-mix(in oklab, var(--primary) 8%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2.5 relative">
        {MONTH_LABELS.map((label, i) => {
          const active = i === month;
          return (
            <button
              key={label}
              onClick={() => setMonth(i)}
              className="flex-1 flex flex-col items-center group relative"
              aria-pressed={active}
            >
              {/* Triangle indicator above active month */}
              <div className="h-2.5 mb-0.5 flex items-center justify-center">
                {active && (
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "4.5px solid transparent",
                      borderRight: "4.5px solid transparent",
                      borderTop: "6px solid var(--primary)",
                      filter: "drop-shadow(0 0 4px var(--primary))",
                    }}
                  />
                )}
              </div>
              <span
                className={`hud-label font-mono tracking-widest transition-all ${
                  active
                    ? "text-primary hud-glow text-[10px] md:text-sm font-bold"
                    : "text-primary/40 text-[9px] md:text-xs hover:text-primary/70"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
