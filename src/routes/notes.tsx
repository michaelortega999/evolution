import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ListTodo, Trash2, Plus, Search } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEvolutionData, todayDate, uid, NOTE_CATEGORIES, type NoteCategory } from "@/lib/evolution-data";

export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Notes — Evolution" }, { name: "description", content: "Capture, categorize, and search notes." }] }),
  component: NotesPage,
});

function NotesPage() {
  const { data, mutate } = useEvolutionData();
  const [quick, setQuick] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<NoteCategory | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Editor modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eBody, setEBody] = useState("");
  const [eCat, setECat] = useState<NoteCategory>("General");

  const addQuick = () => {
    const t = quick.trim();
    if (!t) return;
    mutate((prev) => ({
      richNotes: [...prev.richNotes, { id: uid(), date: todayDate(), title: t, body: "", category: "General" }],
    }));
    setQuick("");
  };

  const openNew = () => { setEditId(null); setETitle(""); setEBody(""); setECat("General"); setEditorOpen(true); };
  const openEdit = (id: string) => {
    const n = data.richNotes.find((x) => x.id === id); if (!n) return;
    setEditId(id); setETitle(n.title); setEBody(n.body); setECat(n.category); setEditorOpen(true);
  };
  const saveNote = () => {
    if (!eTitle.trim()) return;
    mutate((prev) => ({
      richNotes: editId
        ? prev.richNotes.map((n) => n.id === editId ? { ...n, title: eTitle.trim(), body: eBody, category: eCat } : n)
        : [...prev.richNotes, { id: uid(), date: todayDate(), title: eTitle.trim(), body: eBody, category: eCat }],
    }));
    setEditorOpen(false);
  };

  const remove = (id: string) => mutate((prev) => ({ richNotes: prev.richNotes.filter((n) => n.id !== id) }));

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return data.richNotes.filter((n) => {
      if (filterCat !== "All" && n.category !== filterCat) return false;
      if (q && !(`${n.title} ${n.body}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [data.richNotes, search, filterCat]);

  return (
    <ModuleLayout number="05" title="Notes" subtitle="Capture · Categorize · Search" icon={ListTodo}>
      <Panel title="Quick Capture">
        <div className="flex gap-2">
          <Input value={quick} onChange={(e) => setQuick(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addQuick()}
            placeholder="Capture a thought…" className="h-10" />
          <Button onClick={addQuick} className="hud-label text-[10px]">
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={openNew} variant="outline" className="hud-label text-[10px]">+ New Note</Button>
        </div>
      </Panel>

      <Panel title="Filter & Search">
        <div className="flex gap-3 items-center mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" className="h-9 text-xs" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...NOTE_CATEGORIES] as const).map((c) => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`hud-label text-[10px] px-3 py-1.5 rounded border ${filterCat === c ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={`Notes (${visible.length})`}>
        <ul className="space-y-2">
          {visible.map((n) => {
            const expanded = expandedId === n.id;
            return (
              <li key={n.id} className="border border-border rounded p-3 group hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expanded ? null : n.id)} className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <span className="hud-label text-xs text-foreground">{n.title}</span>
                      <span className="hud-label text-[9px] px-2 py-0.5 rounded border border-border text-primary/80">{n.category}</span>
                      <span className="hud-label text-[10px] text-muted-foreground ml-auto">{n.date}</span>
                    </div>
                    {!expanded && n.body && <div className="text-[11px] text-foreground/60 mt-1 line-clamp-1">{n.body}</div>}
                  </button>
                  <button onClick={() => openEdit(n.id)} className="hud-label text-[10px] text-muted-foreground hover:text-primary">Edit</button>
                  <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {expanded && n.body && <p className="text-sm text-foreground/85 mt-3 whitespace-pre-wrap leading-relaxed">{n.body}</p>}
              </li>
            );
          })}
          {!visible.length && <li className="text-xs text-muted-foreground py-6 text-center">No notes match.</li>}
        </ul>
      </Panel>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="hud-card border-primary/40 max-w-2xl">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">{editId ? "Edit Note" : "New Note"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={eTitle} onChange={(e) => setETitle(e.target.value)} className="h-10" />
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Category</span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {NOTE_CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => setECat(c)}
                    className={`hud-label text-[10px] py-2 rounded border ${eCat === c ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={eBody} onChange={(e) => setEBody(e.target.value)} rows={10} placeholder="Note body…"
              className="w-full bg-transparent border border-border rounded p-3 text-sm resize-none focus:outline-none focus:border-primary/50" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={saveNote} className="hud-label text-[10px]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
