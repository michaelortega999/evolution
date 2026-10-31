// Pure helpers for the Business content workflow (phoneStore.data.biz.mediaItems).
// Records are never deleted here: archive/restore only toggles `archivedAt`, and every
// unknown/legacy field (and any raw entry we cannot parse) is carried through writes.

export const CONTENT_STAGES = ["Idea", "Draft", "Ready", "Published"] as const;
export type ContentStage = (typeof CONTENT_STAGES)[number];

export type ContentRecord = Record<string, unknown> & {
  id: string;
  title: string;
  channel: string;
  stage: ContentStage;
  date: string;
  notes?: string;
  projectId?: string;
  archivedAt?: string;
};

const rec = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export function isParsable(value: unknown): boolean {
  const r = rec(value);
  return typeof r.id === "string" && typeof r.title === "string";
}

/** Normalised view of one raw record; unknown fields are kept as-is. */
export function parseContent(value: unknown): ContentRecord | null {
  if (!isParsable(value)) return null;
  const r = rec(value);
  return {
    ...r,
    id: r.id as string,
    title: r.title as string,
    channel: typeof r.channel === "string" ? r.channel : "Other",
    stage: CONTENT_STAGES.includes(r.stage as ContentStage) ? (r.stage as ContentStage) : "Idea",
    date: typeof r.date === "string" ? r.date : "",
    notes: typeof r.notes === "string" ? r.notes : "",
    ...(typeof r.projectId === "string" && r.projectId ? { projectId: r.projectId } : {}),
    ...(typeof r.archivedAt === "string" && r.archivedAt ? { archivedAt: r.archivedAt } : {}),
  };
}

export const isArchived = (item: { archivedAt?: unknown }) => typeof item.archivedAt === "string" && !!item.archivedAt;

/**
 * Apply an update to the parsed records and write back. Raw entries that can't be parsed
 * are re-appended untouched, so a write can never drop data it doesn't understand.
 */
export function applyContentUpdate(
  raw: unknown,
  update: (items: ContentRecord[]) => ContentRecord[],
): unknown[] {
  const list = Array.isArray(raw) ? raw : [];
  const parsed = list.flatMap((v) => {
    const p = parseContent(v);
    return p ? [p] : [];
  });
  const unparsable = list.filter((v) => !isParsable(v));
  return [...update(parsed), ...unparsable];
}

export function archiveContent(items: ContentRecord[], id: string, now: string): ContentRecord[] {
  return items.map((i) => (i.id === id && !isArchived(i) ? { ...i, archivedAt: now } : i));
}

export function restoreContent(items: ContentRecord[], id: string): ContentRecord[] {
  return items.map((i) => {
    if (i.id !== id) return i;
    const { archivedAt: _drop, ...rest } = i;
    return rest as ContentRecord;
  });
}

/** Real calendar date check: "" is allowed (unscheduled); 2026-02-30 is not. */
export function isValidPlannedDate(value: string): boolean {
  if (value === "") return true;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1900 || y > 2200 || mo < 1 || mo > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

/** Returns an id not already used by any record (archived or not). */
export function uniqueContentId(existing: { id: string }[], make: () => string): string {
  const used = new Set(existing.map((i) => i.id));
  let id = make();
  for (let n = 0; used.has(id) && n < 20; n++) id = make();
  while (used.has(id)) id = `${id}-${used.size}`;
  return id;
}

export type ContentFilter = {
  view: "active" | "archived";
  stage: ContentStage | "All";
  channel: string; // "All" or channel name
  projectId: string; // "All" | "none" | project id
  query: string;
};

export function filterContent(items: ContentRecord[], f: ContentFilter): ContentRecord[] {
  const q = f.query.trim().toLowerCase();
  return items
    .filter((i) => (f.view === "archived" ? isArchived(i) : !isArchived(i)))
    .filter((i) => f.stage === "All" || i.stage === f.stage)
    .filter((i) => f.channel === "All" || i.channel === f.channel)
    .filter((i) => f.projectId === "All" || (f.projectId === "none" ? !i.projectId : i.projectId === f.projectId))
    .filter((i) => !q || `${i.title} ${i.notes ?? ""} ${i.channel}`.toLowerCase().includes(q))
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || a.title.localeCompare(b.title));
}

/** Active, not-yet-published items ordered by date (undated last). */
export function nextUp(items: ContentRecord[], limit = 5): ContentRecord[] {
  return filterContent(items, { view: "active", stage: "All", channel: "All", projectId: "All", query: "" })
    .filter((i) => i.stage !== "Published")
    .slice(0, limit);
}

export function contentCounts(items: ContentRecord[], today: string) {
  const active = items.filter((i) => !isArchived(i));
  return {
    active: active.length,
    archived: items.length - active.length,
    due: active.filter((i) => i.stage !== "Published" && i.date && i.date <= today).length,
    ready: active.filter((i) => i.stage === "Ready").length,
    published: active.filter((i) => i.stage === "Published").length,
  };
}

/** Plain-text brief for the clipboard. */
export function contentBrief(i: ContentRecord, projectName?: string): string {
  return [
    i.title,
    `Platform: ${i.channel} · Stage: ${i.stage}${i.date ? ` · Planned: ${i.date}` : ""}`,
    projectName ? `Project: ${projectName}` : "",
    "",
    i.notes ?? "",
  ]
    .filter((l, idx) => l !== "" || idx === 3)
    .join("\n")
    .trim();
}

/** JSON export (format "evolution-content/v1"): the exact saved records, nothing external. */
export function contentExport(items: ContentRecord[], exportedAt: string): string {
  return JSON.stringify({ format: "evolution-content/v1", exportedAt, count: items.length, items }, null, 2);
}

export type TargetState = "active" | "archived" | "missing";
export function targetState(items: { id: string; archivedAt?: unknown }[], id: string): TargetState {
  const t = items.find((i) => i.id === id);
  return !t ? "missing" : isArchived(t) ? "archived" : "active";
}

/** Stage change only for active targets; returns the state found so callers never claim a stale success. */
export function setContentStage(items: ContentRecord[], id: string, stage: ContentStage) {
  const state = targetState(items, id);
  return { state, items: state === "active" ? items.map((i) => (i.id === id ? { ...i, stage } : i)) : items };
}

export const STALE_MESSAGE: Record<Exclude<TargetState, "active">, string> = {
  missing: "That content no longer exists — it was removed on another device.",
  archived: "That content is archived. Restore it from the Archived view first.",
};
