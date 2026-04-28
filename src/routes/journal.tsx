import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Button } from "@/components/ui/button";
import { useEvolutionData, todayDate } from "@/lib/evolution-data";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Evolution" },
      { name: "description", content: "Daily reflections and long-form entries." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const { data, mutate } = useEvolutionData();
  const [text, setText] = useState("");
  const entries = [...data.journal].reverse();

  const save = () => {
    const t = text.trim();
    if (!t) return;
    mutate((prev) => ({ journal: [...prev.journal, { date: todayDate(), text: t }] }));
    setText("");
  };
  const remove = (idx: number) => {
    const realIdx = data.journal.length - 1 - idx;
    mutate((prev) => ({ journal: prev.journal.filter((_, i) => i !== realIdx) }));
  };

  return (
    <ModuleLayout number="04" title="Journal" subtitle="Reflection · Growth · Signal" icon={FileText}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-6">
        <Panel title={`Entries (${entries.length})`}>
          <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {entries.map((e, i) => (
              <li key={i} className="border border-border rounded p-4 group relative">
                <div className="hud-label text-[10px] text-muted-foreground mb-2">{e.date}</div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{e.text}</p>
                <button onClick={() => remove(i)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {!entries.length && <li className="text-xs text-muted-foreground text-center py-8">No entries yet.</li>}
          </ul>
        </Panel>

        <Panel title="New Entry">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What are you learning? What matters today?"
            rows={14}
            className="w-full bg-transparent border border-border rounded p-3 text-sm resize-none focus:outline-none focus:border-primary/50 leading-relaxed"
          />
          <Button onClick={save} className="w-full mt-3 hud-label text-[10px]">Save Entry</Button>
        </Panel>
      </div>
    </ModuleLayout>
  );
}
