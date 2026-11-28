import { cn } from "@/lib/utils";

export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("evolution-master-logo", compact && "evolution-master-logo--compact", className)}
      aria-label="Evolution OS — Higher standards. Brighter days." role="img">
      <span className="evolution-master-logo__name">EVOLUTION<span className="evolution-master-logo__os">OS</span></span>
      <span className="evolution-master-logo__tag">HIGHER STANDARDS. BRIGHTER DAYS.</span>
    </div>
  );
}
