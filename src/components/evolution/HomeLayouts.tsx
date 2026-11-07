import { useState } from "react";
import { Check, Layers } from "lucide-react";
import { getHomeLayout, homeLayouts, layoutFilters } from "@/lib/home-layouts";
import { useCloudStatus, useEvolutionData } from "@/lib/evolution-data";
import previews from "@/assets/layout-previews.webp";

export function HomeLayouts() {
  const { data, mutate } = useEvolutionData();
  const loading = useCloudStatus() === "loading";
  const selected = getHomeLayout(data.settings.homeLayout);
  const [filter, setFilter] = useState<(typeof layoutFilters)[number]>("All");
  return <section className="home-layouts eo-panel" aria-labelledby="layout-title">
    <style>{styles}</style>
    <header>
      <h3 id="layout-title"><Layers size={22} />Home Layouts</h3>
      <span>Choose your main dashboard design.</span>
      <nav aria-label="Filter home layouts">{layoutFilters.map(value =>
        <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
          {value === "All" ? `All (${homeLayouts.length})` : value}
        </button>)}</nav>
    </header>
    <div className="layout-gallery">{homeLayouts.map((layout, index) =>
      (filter === "All" || layout.category === filter) && <button className="layout-option" key={layout.id}
        disabled={loading} aria-pressed={selected.id === layout.id}
        onClick={() => mutate(current => ({settings: {...current.settings, homeLayout: layout.id}}))}>
        <span className="layout-name"><small>{String(index + 1).padStart(2, "0")}</small>{layout.name}
          <i>{selected.id === layout.id && <Check size={14}/>}</i></span>
        <span aria-hidden="true" className="layout-picture" style={{backgroundImage: `url(${previews})`,
          backgroundPosition: `${(index % 4) * 100 / 3}% ${Math.floor(index / 4) * 100 / 3}%`}}/>
        <span className="layout-tags">{layout.tags}</span>
      </button>)}</div>
  </section>;
}

const styles = `
.home-layouts{container-type:inline-size;width:100%;min-width:0}
.home-layouts header,.layout-name,.home-layouts nav{display:flex;align-items:center;gap:8px}
.home-layouts header{flex-wrap:wrap;padding-bottom:10px;border-bottom:1px solid #194158;margin-bottom:10px}
.home-layouts header h3{margin:0;display:flex;gap:8px;align-items:center}
.home-layouts header>span,.layout-tags{font-size:12px;color:#b6cddc}
.home-layouts nav{margin-left:auto;flex-wrap:wrap;gap:5px}
.home-layouts nav button,.layout-option{color:#e3f4ff;border:1px solid #315b73;background:linear-gradient(160deg,#071824,#01060b);border-radius:8px}
.home-layouts nav button{padding:5px 10px;font-size:12px}
.layout-gallery{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(6px,0.8vw,12px)}
.layout-option{display:grid;min-width:0;gap:5px;padding:7px 9px;cursor:pointer;text-align:left;border-radius:12px}
.layout-name{font-size:clamp(12px,1vw,16px);font-weight:600;line-height:1.2}
.layout-name small{border:1px solid #2886a4;border-radius:5px;color:#b2f2ff;padding:1px 5px}
.layout-name i{margin-left:auto;flex:none;width:17px;height:17px;border:1px solid #9ebac7;border-radius:50%;display:grid;place-items:center}
.layout-option[aria-pressed=true] i{background:#24dfff;color:#012030;border-color:transparent}
.home-layouts button[aria-pressed=true]{border-color:#6be5ff;box-shadow:inset 0 0 9px #0782ad88,0 0 7px #09acdc99}
.home-layouts button:focus-visible{outline:2px solid white;outline-offset:2px}
.layout-picture{display:block;width:94%;margin:auto;aspect-ratio:240/94;background-size:400% 400%;border-radius:4px}
.layout-tags{text-align:center;line-height:1.3}
@container(max-width:760px){.layout-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}.home-layouts nav{margin-left:0}}
@container(max-width:360px){.layout-gallery{grid-template-columns:1fr}}
`;
