import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HOLOGRAMS, type HologramKey } from "@/lib/holograms";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: HologramKey;
  onSelect: (key: HologramKey) => void;
}

export function HologramPicker({ open, onOpenChange, value, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="hud-card max-w-md border-primary/40">
        <DialogHeader>
          <DialogTitle className="hud-label text-primary hud-glow text-center tracking-[0.3em] text-sm">
            CHOOSE YOUR FOCUS
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-2">
          {HOLOGRAMS.map((h) => {
            const active = h.key === value;
            return (
              <button
                key={h.key}
                type="button"
                onClick={() => {
                  onSelect(h.key);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-md border transition-all",
                  active
                    ? "border-primary bg-primary/10 hud-glow"
                    : "border-border hover:border-primary/60 hover:bg-primary/5"
                )}
              >
                <img
                  src={h.src}
                  alt={h.label}
                  width={512}
                  height={512}
                  loading="lazy"
                  className="h-16 w-16 object-contain"
                  style={{ filter: "drop-shadow(0 0 6px oklch(0.78 0.22 240 / 0.85))" }}
                />
                <span className="hud-label text-[10px] text-primary tracking-[0.2em]">
                  {h.label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground italic mt-2">
          {HOLOGRAMS.find((h) => h.key === value)?.tagline}
        </p>
      </DialogContent>
    </Dialog>
  );
}
