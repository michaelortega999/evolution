import { cn } from "@/lib/utils";

/** EVOLUTION OS wordmark: spaced ink EVOLUTION + accent OS, angled accent, tagline, short dash. */
export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={cn("relative inline-flex flex-col select-none", className)}
      aria-label="Evolution OS — Higher standards. Brighter days."
      role="img"
    >
      <div className={cn("relative flex items-baseline", compact ? "pr-6" : "pr-10")}>
        <span
          className={cn(
            "evo-brand__word font-light text-brand-ink uppercase leading-none",
            compact ? "text-[13px]" : "text-xl sm:text-2xl",
          )}
          style={{ fontFamily: "'Orbitron', 'Rajdhani', ui-sans-serif, system-ui" }}
        >
          Evolution
        </span>
        <span
          className={cn(
            "evo-brand__word evo-brand__glow font-light text-primary uppercase leading-none",
            compact ? "text-[13px]" : "text-xl sm:text-2xl",
          )}
          style={{
            fontFamily: "'Orbitron', 'Rajdhani', ui-sans-serif, system-ui",
            letterSpacing: "0.12em",
          }}
        >
          OS
        </span>
        <svg
          aria-hidden
          viewBox="0 0 60 30"
          className={cn(
            "evo-brand__glow absolute right-0 text-primary",
            compact ? "-top-2 h-4 w-7" : "-top-3 h-7 w-12",
          )}
        >
          <path d="M2 28 L58 2 L40 14 Z" fill="currentColor" opacity="0.9" />
          <path d="M2 28 L58 2" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      </div>
      <span
        className={cn(
          "evo-brand__tag text-primary uppercase font-medium mt-1.5",
          compact ? "text-[8px]" : "text-[9px] sm:text-[10px]",
        )}
      >
        Higher standards. Brighter days.
      </span>
      <span aria-hidden className={cn("evo-brand__glow mt-2 h-[2px] rounded bg-primary", compact ? "w-8" : "w-12")} />
    </div>
  );
}
