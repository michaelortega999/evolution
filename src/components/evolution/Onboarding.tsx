import { Button } from "@/components/ui/button";
import { useEvolutionData } from "@/lib/evolution-data";
import { HologramEmblem } from "./HologramEmblem";

export function Onboarding() {
  const { updateProfile } = useEvolutionData();

  const begin = () => {
    updateProfile({ hologram: "bonsai", onboarded: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="hud-card hud-scan p-10 max-w-3xl w-full">
        <div className="hud-label text-[10px] text-muted-foreground mb-6 tracking-[0.4em] text-center">
          INITIALIZE
        </div>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative">
            <HologramEmblem kind="bonsai" size={260} />
          </div>

          <h1 className="hud-label text-3xl text-primary hud-glow">Evolution</h1>
          <p className="text-foreground/90 text-lg max-w-md leading-relaxed italic">
            "You are the sum of your decisions.<br />
            Today, you stop drifting. Today, you evolve."
          </p>

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
