import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvolutionData } from "@/lib/evolution-data";
import { HOLOGRAMS, type HologramKey } from "@/lib/holograms";
import { HologramEmblem } from "./HologramEmblem";
import { cn } from "@/lib/utils";

export function Onboarding() {
  const { data, updateProfile } = useEvolutionData();
  const [selected, setSelected] = useState<HologramKey>(data.profile.hologram ?? "bonsai");

  const begin = () => {
    updateProfile({ hologram: selected, onboarded: true });
  };

  const tagline = HOLOGRAMS.find((h) => h.key === selected)?.tagline;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="hud-card hud-scan p-10 max-w-3xl w-full">
        <div className="hud-label text-[10px] text-muted-foreground mb-6 tracking-[0.4em] text-center">
          INITIALIZE
        </div>

        <div className="flex flex-col items-center text-center gap-6">
          {/* Large center hologram of the selected option */}
          <div className="relative">
            <HologramEmblem kind={selected} size={240} />
          </div>

          <h1 className="hud-label text-3xl text-primary hud-glow">Evolution</h1>
          <p className="text-foreground/90 text-lg max-w-md leading-relaxed italic">
            "You are the sum of your decisions.<br />
            Today, you stop drifting. Today, you evolve."
          </p>

          {tagline && (
            <p className="hud-label text-[11px] text-primary tracking-[0.3em]">
              {tagline}
            </p>
          )}

          {/* Three selectable hologram options */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
            {HOLOGRAMS.map((h) => {
              const active = h.key === selected;
              return (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => setSelected(h.key)}
                  className={cn("holo-option", active && "holo-option--active")}
                  aria-label={`Select ${h.label}`}
                  aria-pressed={active}
                >
                  {active && (
                    <span className="holo-option-indicator" aria-hidden>
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <HologramEmblem kind={h.key} size={88} />
                  <span className="hud-label text-[10px] text-primary tracking-[0.2em]">
                    {h.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hud-label text-[10px] text-muted-foreground tracking-[0.4em] mt-2">
            DISCIPLINE · FOCUS · CONSISTENCY · FREEDOM
          </div>

          <Button onClick={begin} className="mt-2 hud-label px-8" size="lg">
            Begin
          </Button>
        </div>
      </div>
    </div>
  );
}
