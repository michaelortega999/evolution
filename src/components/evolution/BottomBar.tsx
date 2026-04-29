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
  const { data } = useEvolutionData();
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

      <CoreMindset />

      <SystemStatus />
    </section>
  );
}
