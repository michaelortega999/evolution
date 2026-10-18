import { Link } from "@tanstack/react-router";
import dashboardAsset from "@/assets/media-system-dashboard.png.asset.json";

/**
 * Marketing System overview. For now this embeds the supplied design image;
 * every figure in it is DEMO SAMPLE data (no real ad-platform, CRM, or sales
 * integrations exist), so it is captioned accordingly.
 */
export function MediaSystemDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="hud-label text-[9px] tracking-[.3em] text-cyan-300/70">Evolution / Media System</div>
          <h2 className="hud-label text-xl text-cyan-100">Automated Marketing System</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="hud-label text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/50 text-yellow-400 tracking-widest">
            DEMO
          </span>
          <Link to="/business" search={{ section: "social-media" }} className="hud-label text-[10px] text-primary hover:underline">
            Media Planner →
          </Link>
        </div>
      </div>
      <figure className="hud-card hud-scan p-2">
        <img
          src={dashboardAsset.url}
          alt="Automated marketing system dashboard concept showing traffic sources, AI agents, key metrics, automated workflow, and campaign analytics"
          className="w-full h-auto rounded"
          loading="lazy"
        />
        <figcaption className="hud-label text-[9px] text-muted-foreground px-2 py-2">
          Design concept — all figures shown are sample data, not live metrics.
        </figcaption>
      </figure>
    </div>
  );
}
