import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Button } from "@/components/ui/button";
import { useEvolutionData, type Hobby } from "@/lib/evolution-data";

export const Route = createFileRoute("/hobby")({
  head: () => ({
    meta: [
      { title: "Hobby — Evolution" },
      { name: "description", content: "Time invested in hobbies and crafts." },
    ],
  }),
  component: HobbyPage,
});

function HobbyPage() {
  const { data, mutate } = useEvolutionData();
  const hobbies: Hobby[] = ["Cars", "Guitar", "Travel"];

  return (
    <ModuleLayout number="08" title="Hobby" subtitle="Craft · Time · Mastery" icon={Star}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Current Focus">
          <div className="hud-label text-3xl text-primary hud-glow">{data.hobby.current}</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-4">Switch focus</div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {hobbies.map((h) => (
              <button key={h} onClick={() => mutate({ hobby: { ...data.hobby, current: h } })}
                className={`hud-label text-[10px] py-2 rounded border ${data.hobby.current === h ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                {h}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Time Invested">
          <div className="hud-label text-4xl text-primary hud-glow">{data.hobby.hours.toFixed(1)} hrs</div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, data.hobby.hours * 5)}%`, boxShadow: "0 0 8px var(--primary)" }} />
          </div>
          <div className="hud-label text-[10px] text-muted-foreground mt-2">Progress to 20 hrs</div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => mutate({ hobby: { ...data.hobby, hours: data.hobby.hours + 0.5 } })} size="sm" className="flex-1 hud-label text-[10px]">+ 30 min</Button>
            <Button onClick={() => mutate({ hobby: { ...data.hobby, hours: data.hobby.hours + 1 } })} size="sm" variant="outline" className="flex-1 hud-label text-[10px]">+ 1 hr</Button>
            <Button onClick={() => mutate({ hobby: { ...data.hobby, hours: Math.max(0, data.hobby.hours - 0.5) } })} size="sm" variant="outline" className="flex-1 hud-label text-[10px]">− 30 min</Button>
          </div>
        </Panel>
      </div>

      <Panel title="Philosophy">
        <p className="text-sm text-foreground/80 leading-relaxed italic">
          "You do not rise to the level of your goals. You fall to the level of your systems."
        </p>
        <p className="hud-label text-[10px] text-muted-foreground mt-3">
          Consistency compounds. 30 minutes a day is 182 hours a year.
        </p>
      </Panel>
    </ModuleLayout>
  );
}
