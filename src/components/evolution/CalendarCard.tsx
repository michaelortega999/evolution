import { useState } from "react";
import { Calendar as CalIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEvolutionData } from "@/lib/evolution-data";

export function CalendarCard() {
  const { data, mutate } = useEvolutionData();
  const [evt, setEvt] = useState("");

  const addEvent = () => {
    const text = evt.trim();
    if (!text) return;
    const date = new Date().toISOString().slice(0, 10);
    mutate((prev) => ({ events: [...prev.events, { date, text }] }));
    setEvt("");
  };

  return (
    <div className="hud-card p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <CalIcon className="h-4 w-4 text-primary" />
        <div className="hud-label text-sm">Calendar</div>
      </div>
      <div className="flex-1 space-y-1.5 mb-3 overflow-y-auto max-h-24">
        {data.events.length === 0 ? (
          <div className="text-sm text-muted-foreground">No events today</div>
        ) : (
          data.events.slice(-4).map((e, i) => (
            <div key={i} className="text-xs text-foreground/90 flex gap-2">
              <span className="text-primary">▸</span>
              <span className="truncate">{e.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={evt}
          onChange={(e) => setEvt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEvent()}
          placeholder="Add event…"
          className="h-8 text-xs"
        />
        <button
          onClick={addEvent}
          className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-primary hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
