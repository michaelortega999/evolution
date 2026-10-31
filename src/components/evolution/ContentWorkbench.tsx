import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Copy, Download, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { todayDate, uid, useCloudStatus, useEvolutionData, type CloudStatus, type EvolutionData } from "@/lib/evolution-data";
import {
  CONTENT_STAGES,
  applyContentUpdate,
  archiveContent,
  contentBrief,
  contentCounts,
  contentExport,
  filterContent,
  isArchived,
  isValidPlannedDate,
  nextUp,
  parseContent,
  restoreContent,
  uniqueContentId,
  type ContentFilter,
  type ContentRecord,
  type ContentStage,
} from "@/lib/media-content";

export const CONTENT_CHANNELS = ["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "Other"];

const rec = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export function readAllContent(data: EvolutionData): ContentRecord[] {
  const raw = rec(data.phoneStore?.data?.biz).mediaItems;
  return (Array.isArray(raw) ? raw : []).flatMap((v) => {
    const p = parseContent(v);
    return p ? [p] : [];
  });
}

export function contentPatch(data: EvolutionData, update: (items: ContentRecord[]) => ContentRecord[]): Partial<EvolutionData> {
  const phoneData = data.phoneStore?.data ?? {};
  const biz = rec(phoneData.biz);
  return {
    phoneStore: {
      v: data.phoneStore?.v ?? 1,
      data: { ...phoneData, biz: { ...biz, mediaItems: applyContentUpdate(biz.mediaItems, update) } },
    },
  };
}

const CLOUD_TEXT: Record<CloudStatus, string> = {
  "signed-out": "Saved on this device only — sign in to sync to other devices.",
  loading: "Saved on this device · checking cloud connection…",
  saving: "Saved on this device · uploading to cloud…",
  error: "Saved on this device · cloud sync failed, it will retry automatically.",
  synced: "Saved on this device · cloud copy up to date.",
};

export function useSaveStatus() {
  const status = useCloudStatus();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [sawUpload, setSawUpload] = useState(false);
  useEffect(() => {
    if (savedAt && (status === "saving" || status === "error")) setSawUpload(true);
  }, [status, savedAt]);
  const markSaved = () => {
    setSavedAt(Date.now());
    setSawUpload(false);
  };
  let text: string;
  if (!savedAt) text = status === "signed-out" ? "Signed out · changes stay on this device." : `Cloud: ${status === "synced" ? "connected" : status}.`;
  else if (status === "synced" && !sawUpload) text = "Saved on this device · cloud upload queued.";
  else text = CLOUD_TEXT[status];
  return { status, text, markSaved };
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function copyText(text: string) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  } catch {
    toast.error("Couldn't copy — your browser blocked clipboard access. Select the text in the editor and copy it manually.");
  }
}

const field = "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground";

export function ContentWorkbench({ id = "content-workbench" }: { id?: string }) {
  const { data, mutate } = useEvolutionData();
  const save = useSaveStatus();
  const all = readAllContent(data);
  const today = todayDate();
  const projects = data.projects;
  const projectName = (pid?: string) => (pid ? projects.find((p) => p.id === pid)?.name : undefined);
  const [filter, setFilter] = useState<ContentFilter>({ view: "active", stage: "All", channel: "All", projectId: "All", query: "" });
  const visible = useMemo(() => filterContent(all, filter), [all, filter]);
  const counts = contentCounts(all, today);
  const upcoming = nextUp(all, 5);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", channel: "Instagram", stage: "Idea" as ContentStage, date: "", notes: "", projectId: "" });
  const [error, setError] = useState("");
  const busy = useRef(false);
  const newId = useRef<string | null>(null);

  const openEditor = (item?: ContentRecord, stage: ContentStage = "Idea") => {
    busy.current = false;
    setError("");
    setEditingId(item?.id ?? null);
    newId.current = item ? null : uniqueContentId(all, uid);
    setForm({
      title: item?.title ?? "",
      channel: item?.channel ?? (filter.channel !== "All" ? filter.channel : "Instagram"),
      stage: item?.stage ?? stage,
      date: item?.date ?? "",
      notes: item?.notes ?? "",
      projectId: item?.projectId ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (busy.current) return;
    const title = form.title.trim();
    if (!title) return setError("Give this content a title.");
    if (!isValidPlannedDate(form.date)) return setError("Choose a real calendar date, or leave the date empty.");
    busy.current = true;
    let problem = "";
    try {
      mutate((prev) => {
        const current = readAllContent(prev);
        if (editingId) {
          const target = current.find((i) => i.id === editingId);
          if (!target) { problem = "This content was removed on another device. Your text is still here — copy it before closing."; return {}; }
          if (isArchived(target)) { problem = "This content was archived elsewhere. Restore it from the Archived view, then save again."; return {}; }
        }
        return contentPatch(prev, (items) => {
          const patch = { title, channel: form.channel, stage: form.stage, date: form.date, notes: form.notes.trim() };
          if (editingId)
            return items.map((i) => {
              if (i.id !== editingId) return i;
              const next: ContentRecord = { ...i, ...patch };
              if (form.projectId) next.projectId = form.projectId; else delete next.projectId;
              return next;
            });
          const id = items.some((i) => i.id === newId.current) ? uniqueContentId(items, uid) : (newId.current ?? uniqueContentId(items, uid));
          if (items.some((i) => i.id === id)) return items;
          return [...items, { id, ...patch, ...(form.projectId ? { projectId: form.projectId } : {}) }];
        });
      });
    } catch {
      problem = "Couldn't save right now. Your changes are still in the editor — try again.";
    }
    if (problem) {
      busy.current = false;
      setError(problem);
      return;
    }
    save.markSaved();
    setOpen(false);
  };

  const setStage = (itemId: string, stage: ContentStage) => {
    mutate((prev) => contentPatch(prev, (items) => items.map((i) => (i.id === itemId && !isArchived(i) ? { ...i, stage } : i))));
    save.markSaved();
  };
  const archive = (item: ContentRecord) => {
    mutate((prev) => contentPatch(prev, (items) => archiveContent(items, item.id, new Date().toISOString())));
    save.markSaved();
    toast(`Archived “${item.title}”.`, { action: { label: "Undo", onClick: () => restore(item) } });
  };
  const restore = (item: ContentRecord) => {
    mutate((prev) => contentPatch(prev, (items) => restoreContent(items, item.id)));
    save.markSaved();
  };
  const exportJson = () => {
    if (!visible.length) return toast.error("Nothing to export in this view.");
    downloadText(contentExport(visible, new Date().toISOString()), `evolution-content-${today}.json`);
  };

  const orphan = (pid?: string) => !!pid && !projectName(pid);

  return (
    <section id={id} className="evo-surface hud-card min-w-0 space-y-4 rounded-xl p-4 sm:p-5" aria-labelledby={`${id}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-lg font-semibold">Content workbench</h2>
          <p className="text-xs text-muted-foreground">Plan, write and track posts. Publishing happens on the platform — “Published” is a manual log.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4" /> New content</Button>
          <Button size="sm" variant="outline" onClick={exportJson} aria-label="Export current view as JSON"><Download className="h-4 w-4" /> Export JSON</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground" role="status" aria-live="polite">{save.text}</p>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {([["Active", counts.active], ["Due / overdue", counts.due], ["Ready", counts.ready], ["Published (logged)", counts.published], ["Archived", counts.archived]] as const).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border/60 p-2">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="text-xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Next up</h3>
          <ul className="space-y-1.5">
            {upcoming.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border/50 px-2 py-1.5 text-sm">
                <span className="min-w-0 flex-1 truncate">{i.title}</span>
                <span className={`text-xs ${i.date && i.date < today ? "text-destructive" : "text-muted-foreground"}`}>
                  {i.date ? (i.date < today ? `Overdue · ${i.date}` : i.date === today ? "Today" : i.date) : "No date"}
                </span>
                <select aria-label={`Stage for ${i.title}`} className={`${field} h-7 w-auto`} value={i.stage} onChange={(e) => setStage(i.id, e.target.value as ContentStage)}>
                  {CONTENT_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Button size="sm" variant="ghost" onClick={() => openEditor(i)} aria-label={`Edit ${i.title}`}><Pencil className="h-3.5 w-3.5" /></Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <label className="min-w-0 lg:col-span-2"><span className="sr-only">Search content</span>
          <Input placeholder="Search title, caption, platform" value={filter.query} onChange={(e) => setFilter({ ...filter, query: e.target.value })} />
        </label>
        <label className="min-w-0"><span className="sr-only">Filter by stage</span>
          <select className={field} value={filter.stage} onChange={(e) => setFilter({ ...filter, stage: e.target.value as ContentFilter["stage"] })}>
            <option value="All">All stages</option>{CONTENT_STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="min-w-0"><span className="sr-only">Filter by platform</span>
          <select className={field} value={filter.channel} onChange={(e) => setFilter({ ...filter, channel: e.target.value })}>
            <option value="All">All platforms</option>{CONTENT_CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="min-w-0"><span className="sr-only">Filter by project</span>
          <select className={field} value={filter.projectId} onChange={(e) => setFilter({ ...filter, projectId: e.target.value })}>
            <option value="All">All projects</option><option value="none">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>
      <div role="group" aria-label="Show" className="flex gap-2">
        {(["active", "archived"] as const).map((v) => (
          <Button key={v} size="sm" variant={filter.view === v ? "default" : "outline"} aria-pressed={filter.view === v} onClick={() => setFilter({ ...filter, view: v })}>
            {v === "active" ? "Active" : `Archived (${counts.archived})`}
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {all.length === 0
            ? <>No content saved yet. <button type="button" className="underline" onClick={() => openEditor()}>Capture your first idea</button>.</>
            : filter.view === "archived" ? "Nothing archived." : "No content matches these filters."}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((i) => (
            <li key={i.id} className="min-w-0 rounded-lg border border-border/60 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.channel} · {i.stage}{i.stage === "Published" ? " (logged manually)" : ""} · {i.date || "No date"}
                    {i.projectId && ` · ${projectName(i.projectId) ?? "Project no longer exists"}`}
                  </p>
                  {i.notes && <p className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">{i.notes}</p>}
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" onClick={() => copyText(contentBrief(i, projectName(i.projectId)))} aria-label={`Copy brief for ${i.title}`}><Copy className="h-3.5 w-3.5" /></Button>
                  {isArchived(i) ? (
                    <Button size="sm" variant="outline" onClick={() => restore(i)}><ArchiveRestore className="h-3.5 w-3.5" /> Restore</Button>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => openEditor(i)} aria-label={`Edit ${i.title}`}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => archive(i)} aria-label={`Archive ${i.title}`}><Archive className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit content" : "New content"}</DialogTitle>
            <DialogDescription>Saved to your workspace. Nothing is posted to any platform.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <label className="block text-sm">Title
              <Input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">Platform
                <select className={field} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                  {[...new Set([...CONTENT_CHANNELS, form.channel])].map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block text-sm">Stage
                <select className={field} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as ContentStage })}>
                  {CONTENT_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="block text-sm">Planned date
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </label>
              <label className="block text-sm">Project (optional)
                <select className={field} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">No project</option>
                  {orphan(form.projectId) && <option value={form.projectId}>Deleted project (keep link)</option>}
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
            </div>
            {form.stage === "Published" && <p className="text-xs text-muted-foreground">“Published” only records that you posted it yourself. This app never posts for you.</p>}
            <label className="block text-sm">Caption / notes
              <Textarea rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => copyText(`${form.title}\n\n${form.notes}`.trim())}><Copy className="h-4 w-4" /> Copy caption</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
