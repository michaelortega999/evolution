import { Sparkline } from "./Sparkline";

export function CoreMindset() {
  return (
    <div className="hud-card p-5 flex flex-col gap-4 h-full">
      <span className="hud-label text-[10px] text-primary tracking-[0.3em]">CORE MINDSET</span>
      <p className="italic text-foreground/90 text-sm leading-relaxed">
        “You are the sum of your decisions. Today, you stop drifting. Today, you evolve.”
      </p>
      <div className="hud-label text-[10px] text-muted-foreground tracking-[0.3em]">
        DISCIPLINE · FOCUS · FREEDOM
      </div>
      <div className="mt-auto">
        <Sparkline data={[12, 18, 15, 22, 28, 24, 31, 29, 36, 34, 42, 48]} height={56} />
      </div>
    </div>
  );
}
