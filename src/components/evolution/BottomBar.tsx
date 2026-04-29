import { Sparkline } from "./Sparkline";
import { useEvolutionData } from "@/lib/evolution-data";
import { SystemStatus } from "./SystemStatus";
import { CoreMindset } from "./CoreMindset";

const markets = [
  { name: "S&P 500", change: "+0.85%", data: [10, 12, 11, 14, 13, 16, 17, 19] },
  { name: "NASDAQ", change: "+1.21%", data: [8, 10, 9, 13, 15, 14, 18, 20] },
  { name: "DOW", change: "+0.64%", data: [12, 11, 13, 12, 14, 15, 14, 16] },
  { name: "GOLD", change: "+0.35%", data: [20, 19, 21, 20, 22, 21, 23, 24] },
  { name: "BTC/USD", change: "+2.46%", data: [15, 18, 16, 20, 22, 21, 26, 30] },
];

export function BottomBar() {
  const { data, mutate } = useEvolutionData();
  const [evt, setEvt] = useState("");
  

  const addEvent = () => {
    const text = evt.trim();
    if (!text) return;
    const date = new Date().toISOString().slice(0, 10);
    mutate((prev) => ({ events: [...prev.events, { date, text }] }));
    setEvt("");
  };

  void data;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hud-card p-5 lg:col-span-2">
        <div className="hud-label text-sm text-foreground/90 mb-4">Market Overview</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {markets.map((m) => (
            <div key={m.name} className="border border-border rounded-md p-2.5 bg-primary/5">
              <div className="hud-label text-[9px] text-muted-foreground">{m.name}</div>
              <div className="hud-label text-xs text-primary hud-glow my-1">{m.change}</div>
              <Sparkline data={m.data} height={24} fill={false} />
            </div>
          ))}
        </div>
      </div>

      <div className="hud-card p-5 flex flex-col">
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
          <Input value={evt} onChange={(e) => setEvt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEvent()} placeholder="Add event…" className="h-8 text-xs" />
          <button onClick={addEvent} className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-primary hover:bg-primary/10">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <SystemStatus />
    </section>
  );
}
