import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Plus, X } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { useEvolutionData } from "@/lib/evolution-data";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Evolution" },
      { name: "description", content: "Quick capture notes and task list." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { data, mutate } = useEvolutionData();
  const [text, setText] = useState("");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    mutate((prev) => ({ notes: [...prev.notes, t] }));
    setText("");
  };
  const remove = (i: number) => mutate((prev) => ({ notes: prev.notes.filter((_, idx) => idx !== i) }));
  const clear = () => mutate({ notes: [] });

  return (
    <ModuleLayout number="05" title="Notes" subtitle="Capture · Act · Clear" icon={NotebookPen}>
      <Panel title={`Notes (${data.notes.length})`}>
        <div className="flex gap-2 mb-4">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Capture a thought…" className="h-10" />
          <button onClick={add} className="h-10 w-10 rounded-md border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <ul className="space-y-2">
          {data.notes.map((n, i) => (
            <li key={i} className="flex items-start gap-3 group border border-border rounded p-3 hover:border-primary/40">
              <span className="text-primary mt-0.5">▸</span>
              <span className="flex-1 text-sm text-foreground/90">{n}</span>
              <button onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
          {!data.notes.length && <li className="text-xs text-muted-foreground py-6 text-center">No notes. Capture your first thought above.</li>}
        </ul>

        {data.notes.length > 0 && (
          <button onClick={clear} className="mt-4 hud-label text-[10px] text-muted-foreground hover:text-destructive">Clear all</button>
        )}
      </Panel>
    </ModuleLayout>
  );
}
