import { localISO } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { FileText, Trash2 } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEvolutionData, todayDate, uid, type Mood } from "@/lib/evolution-data";
import { useSelectedMonth } from "@/lib/use-selected-month";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — Evolution" }, { name: "description", content: "Daily reflections, mood tracking, and prompts." }] }),
  component: JournalPage,
});

const MOODS: Mood[] = ["Great", "Good", "Neutral", "Struggling", "Difficult"];
const MOOD_VALUE: Record<Mood, number> = { Great: 5, Good: 4, Neutral: 3, Struggling: 2, Difficult: 1 };

const PROMPTS = [
  ["What did you win at today?", "What was hard today?", "What did you learn?"],
  ["Where did you focus best?", "What drained your energy?", "What would you do differently?"],
  ["What surprised you today?", "What needs your attention?", "What are you grateful for?"],
  ["Who did you serve today?", "Where did you fall short?", "What's the next move?"],
  ["What did you build today?", "What did you avoid?", "What did this teach you?"],
  ["What was your biggest win?", "What weighed on you?", "What's one lesson?"],
  ["What did you create?", "What slowed you down?", "What's tomorrow's priority?"],
];

function JournalPage() {
  const { data, mutate } = useEvolutionData();
  const { key: monthKey } = useSelectedMonth();
  const filteredEntries = useMemo(
    () => data.journalEntries.filter((e) => e.date.startsWith(monthKey)),
    [data.journalEntries, monthKey]
  );
  const [readId, setReadId] = useState<string | null>(null);

  // Write
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood>("Good");
  const [tagsRaw, setTagsRaw] = useState("");

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const save = () => {
    if (!text.trim()) return;
    mutate((prev) => ({
      journalEntries: [...prev.journalEntries, {
        id: uid(), date: todayDate(),
        title: title.trim() || "Untitled",
        text: text.trim(), mood,
        tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      }],
    }));
    setTitle(""); setText(""); setTagsRaw(""); setMood("Good");
  };

  const remove = (id: string) =>
    mutate((prev) => ({ journalEntries: prev.journalEntries.filter((e) => e.id !== id) }));

  // Reflection
  const todayReflection = data.reflections.find((r) => r.date === todayDate());
  const dayIdx = new Date().getDay();
  const prompts = PROMPTS[dayIdx];
  const [refDraft, setRefDraft] = useState({
    wins: todayReflection?.wins ?? "",
    challenges: todayReflection?.challenges ?? "",
    lessons: todayReflection?.lessons ?? "",
  });
  const saveReflection = () => {
    mutate((prev) => {
      const today = todayDate();
      const exists = prev.reflections.find((r) => r.date === today);
      const entry = { id: exists?.id ?? uid(), date: today, ...refDraft };
      return {
        reflections: exists
          ? prev.reflections.map((r) => r.date === today ? entry : r)
          : [...prev.reflections, entry],
      };
    });
  };

  // Mood chart — last 7 days
  const moodSeries = useMemo(() => {
    const out: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const date = localISO(d);
      const entries = data.journalEntries.filter((e) => e.date === date);
      const avg = entries.length
        ? entries.reduce((a, e) => a + MOOD_VALUE[e.mood], 0) / entries.length
        : 0;
      out.push(avg);
    }
    return out;
  }, [data.journalEntries]);

  const reading = readId ? data.journalEntries.find((e) => e.id === readId) : null;

  return (
    <ModuleLayout number="04" title="Journal" subtitle="Reflection · Growth · Signal" icon={FileText}>
      <Tabs defaultValue="write">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="entries">Entries</TabsTrigger>
          <TabsTrigger value="reflection">Reflection</TabsTrigger>
          <TabsTrigger value="mood">Mood Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          <Panel title="New Entry">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" />
              <span className="hud-label text-[10px] text-muted-foreground self-center">{todayDate()}</span>
            </div>
            <div className="mb-3">
              <span className="hud-label text-[10px] text-muted-foreground">Mood</span>
              <div className="grid grid-cols-5 gap-2 mt-1">
                {MOODS.map((m) => (
                  <button key={m} type="button" onClick={() => setMood(m)}
                    className={`hud-label text-[10px] py-2 rounded border ${mood === m ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <Input placeholder="Tags (comma separated)" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} className="h-9 text-xs mb-3" />
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12}
              placeholder="What's on your mind?"
              className="w-full bg-transparent border border-border rounded p-3 text-sm resize-none focus:outline-none focus:border-primary/50 leading-relaxed" />
            <div className="flex items-center justify-between mt-3">
              <div className="hud-label text-[10px] text-muted-foreground">{wordCount} words</div>
              <Button onClick={save} className="hud-label text-[10px]">Save Entry</Button>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="entries">
          <Panel title={`Entries (${filteredEntries.length}) · ${monthKey}`}>
            <ul className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {[...filteredEntries].reverse().map((e) => (
                <li key={e.id} className="border border-border rounded p-4 group cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => setReadId(e.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="hud-label text-xs text-foreground">{e.title}</div>
                      <div className="hud-label text-[10px] text-muted-foreground mt-0.5">{e.date} · {e.mood}</div>
                    </div>
                    <button onClick={(ev) => { ev.stopPropagation(); remove(e.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground/70 line-clamp-2">{e.text}</p>
                  {e.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {e.tags.map((t, i) => <span key={i} className="hud-label text-[9px] px-2 py-0.5 rounded border border-border text-primary/80">#{t}</span>)}
                    </div>
                  )}
                </li>
              ))}
              {!filteredEntries.length && <li className="text-xs text-muted-foreground py-6 text-center">No entries in this month.</li>}
            </ul>
          </Panel>

          {reading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80" onClick={() => setReadId(null)}>
              <div className="hud-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="hud-label text-[10px] text-muted-foreground">{reading.date} · {reading.mood}</div>
                <h2 className="hud-label text-xl text-primary hud-glow mt-1">{reading.title}</h2>
                <p className="text-sm text-foreground/90 leading-relaxed mt-4 whitespace-pre-wrap">{reading.text}</p>
                <Button onClick={() => setReadId(null)} className="mt-6 hud-label text-[10px]">Close</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reflection">
          <Panel title={`Daily Reflection — ${todayDate()}`}>
            <div className="space-y-4">
              {(["wins", "challenges", "lessons"] as const).map((key, i) => (
                <label key={key} className="block">
                  <span className="hud-label text-[10px] text-muted-foreground">{prompts[i]}</span>
                  <textarea value={refDraft[key]} onChange={(e) => setRefDraft((d) => ({ ...d, [key]: e.target.value }))}
                    rows={3} className="w-full mt-1 bg-transparent border border-border rounded p-2 text-sm resize-none focus:outline-none focus:border-primary/50" />
                </label>
              ))}
              <Button onClick={saveReflection} className="hud-label text-[10px]">Save Reflection</Button>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="mood">
          <Panel title="Mood — Last 7 Days">
            <Sparkline data={moodSeries.length ? moodSeries : [0]} height={200} />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {MOODS.map((m) => (
                <div key={m} className="text-center hud-label text-[10px] text-muted-foreground">
                  {m} <span className="text-primary">({MOOD_VALUE[m]})</span>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </ModuleLayout>
  );
}
