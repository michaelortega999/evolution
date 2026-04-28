import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { RingProgress } from "@/components/evolution/RingProgress";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Business — Evolution" },
      { name: "description", content: "Projects, revenue, and business operations." },
    ],
  }),
  component: BusinessPage,
});

const projects = [
  { name: "Evolution Platform", status: "Active", progress: 72, rev: "$18.2K" },
  { name: "HUD Design System", status: "Active", progress: 55, rev: "$8.4K" },
  { name: "Client — Aurora", status: "Active", progress: 90, rev: "$12.0K" },
  { name: "Course Launch", status: "Planning", progress: 20, rev: "$0" },
  { name: "SaaS Prototype", status: "Active", progress: 40, rev: "$4.2K" },
  { name: "Consulting — R&D", status: "Active", progress: 66, rev: "$0" },
  { name: "Newsletter", status: "Active", progress: 85, rev: "$0" },
];

function BusinessPage() {
  return (
    <ModuleLayout number="07" title="Business" subtitle="Projects · Revenue · Execution" icon={Briefcase}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel title="Active Projects"><div className="hud-label text-3xl text-primary hud-glow">{projects.filter(p => p.status === "Active").length}</div></Panel>
        <Panel title="Quarter Revenue"><div className="hud-label text-3xl text-primary hud-glow">$42.8K</div></Panel>
        <Panel title="On-Track Rate">
          <div className="flex items-center gap-4">
            <RingProgress value={80} size={80} label="80%" />
            <div className="hud-label text-[10px] text-muted-foreground">All projects trending to milestones</div>
          </div>
        </Panel>
      </div>

      <Panel title="Projects">
        <ul className="divide-y divide-border">
          {projects.map((p) => (
            <li key={p.name} className="py-3 grid grid-cols-[1fr_auto_120px_auto] items-center gap-4">
              <div>
                <div className="hud-label text-xs text-foreground/90">{p.name}</div>
                <div className="hud-label text-[10px] text-muted-foreground mt-0.5">{p.status}</div>
              </div>
              <span className="hud-label text-xs text-primary">{p.rev}</span>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%`, boxShadow: "0 0 6px var(--primary)" }} />
              </div>
              <span className="hud-label text-[10px] text-primary w-8 text-right">{p.progress}%</span>
            </li>
          ))}
        </ul>
      </Panel>
    </ModuleLayout>
  );
}
