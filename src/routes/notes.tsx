import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckSquare, Plus, X, ListTodo } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { useEvolutionData } from "@/lib/evolution-data";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — To-Do List" },
      { name: "description", content: "Toggleable to-do list. Capture, check off, and clear tasks." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { data, mutate } = useEvolutionData();
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    mutate((prev) => ({
      notes: [...prev.notes, { id: `n${Date.now()}`, text: t, done: false }],
    }));
    setText("");
  };

  const toggle = (id: string) =>
    mutate((prev) => ({
      notes: prev.notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n)),
    }));

  const remove = (id: string) =>
    mutate((prev) => ({ notes: prev.notes.filter((n) => n.id !== id) }));

  const clearDone = () =>
    mutate((prev) => ({ notes: prev.notes.filter((n) => !n.done) }));

  const visible = useMemo(() => {
    if (filter === "active") return data.notes.filter((n) => !n.done);
    if (filter === "done") return data.notes.filter((n) => n.done);
    return data.notes;
  }, [data.notes, filter]);

  const total = data.notes.length;
  const doneCount = data.notes.filter((n) => n.done).length;

  return (
    <ModuleLayout number="05" title="Notes" subtitle="Capture · Check · Clear" icon={ListTodo}>
      <Panel title={`To-Do (${doneCount}/${total})`}>
        <div className="flex gap-2 mb-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a task…"
            className="h-10"
          />
          <button
            onClick={add}
            className="h-10 w-10 rounded-md border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10"
            aria-label="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "active", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`hud-label text-[10px] px-3 py-1 rounded border ${
                filter === f
                  ? "border-primary/60 text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {visible.map((n) => (
            <li
              key={n.id}
              className="flex items-center gap-3 group border border-border rounded p-3 hover:border-primary/40 transition-colors"
            >
              <button
                onClick={() => toggle(n.id)}
                className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  n.done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-primary/50 hover:border-primary hover:bg-primary/10"
                }`}
                aria-label={n.done ? "Mark as not done" : "Mark as done"}
              >
                {n.done && <CheckSquare className="h-3 w-3" />}
              </button>
              <span
                onClick={() => toggle(n.id)}
                className={`flex-1 text-sm cursor-pointer select-none ${
                  n.done ? "line-through text-muted-foreground" : "text-foreground/90"
                }`}
              >
                {n.text}
              </span>
              <button
                onClick={() => remove(n.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                aria-label="Delete task"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
          {!visible.length && (
            <li className="text-xs text-muted-foreground py-6 text-center">
              {filter === "done"
                ? "No completed tasks yet."
                : filter === "active"
                ? "All tasks done. Nice work."
                : "No tasks. Add your first above."}
            </li>
          )}
        </ul>

        {doneCount > 0 && (
          <button
            onClick={clearDone}
            className="mt-4 hud-label text-[10px] text-muted-foreground hover:text-destructive"
          >
            Clear completed ({doneCount})
          </button>
        )}
      </Panel>
    </ModuleLayout>
  );
}
