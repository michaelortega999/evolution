import { Sparkline } from "./Sparkline";
import { useEvolutionData } from "@/lib/evolution-data";
import { CoreMindset } from "./CoreMindset";
import { Calendar } from "lucide-react";

const markets = [
  { name: "S&P 500", change: "+0.85%", data: [10, 12, 11, 14, 13, 16, 17, 19] },
  { name: "NASDAQ", change: "+1.21%", data: [8, 10, 9, 13, 15, 14, 18, 20] },
  { name: "DOW", change: "+0.64%", data: [12, 11, 13, 12, 14, 15, 14, 16] },
  { name: "GOLD", change: "+0.35%", data: [20, 19, 21, 20, 22, 21, 23, 24] },
  { name: "BTC/USD", change: "+2.46%", data: [15, 18, 16, 20, 22, 21, 26, 30] },
];

export function BottomBar() {
  const { data } = useEvolutionData();
  void data;
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

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

      <CoreMindset />

      <div className="hud-card p-5 flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="hud-label text-[10px] text-primary tracking-[0.3em]">DATE</span>
        </div>
        <div className="hud-label text-[9px] text-muted-foreground">{dayName}</div>
        <div className="hud-label text-sm text-foreground">{dateStr}</div>
        <div className="hud-label text-lg text-primary hud-glow">{timeStr}</div>
      </div>
    </section>
  );
}
