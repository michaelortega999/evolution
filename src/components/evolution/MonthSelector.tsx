import { MONTH_LABELS, useSelectedMonth } from "@/lib/use-selected-month";

export function MonthSelector() {
  const { month, setMonth } = useSelectedMonth();

  return (
    <div
      className="w-full rounded-md border border-border bg-background/80 backdrop-blur px-4 py-4 md:py-5 relative overflow-hidden"
      style={{
        boxShadow: "inset 0 0 24px color-mix(in oklab, var(--primary) 8%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4 relative">
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
              <div className="h-3 mb-1 flex items-center justify-center">
                {active && (
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "8px solid var(--primary)",
                      filter: "drop-shadow(0 0 6px var(--primary))",
                    }}
                  />
                )}
              </div>
              <span
                className={`hud-label font-mono tracking-widest transition-all ${
                  active
                    ? "text-primary hud-glow text-sm md:text-base font-bold"
                    : "text-primary/40 text-xs md:text-sm hover:text-primary/70"
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
