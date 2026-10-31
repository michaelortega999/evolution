import { describe, expect, it } from "vitest";
import {
  applyContentUpdate,
  archiveContent,
  contentCounts,
  contentExport,
  filterContent,
  isValidPlannedDate,
  nextUp,
  restoreContent,
  uniqueContentId,
  type ContentFilter,
} from "./media-content";

const raw = [
  { id: "a", title: "Reel", channel: "Instagram", stage: "Idea", date: "2026-11-02", notes: "old caption", legacyX: 7 },
  { id: "b", title: "Short", channel: "TikTok", stage: "Ready", date: "2026-10-01", projectId: "p1" },
  { weird: true }, // unparsable legacy entry
];
const all: ContentFilter = { view: "active", stage: "All", channel: "All", projectId: "All", query: "" };

describe("content data preservation", () => {
  it("writes keep unparsable entries and unknown fields", () => {
    const out = applyContentUpdate(raw, (items) => items.map((i) => ({ ...i, title: i.title + "!" }))) as any[];
    expect(out).toHaveLength(3);
    expect(out[0].legacyX).toBe(7);
    expect(out[0].notes).toBe("old caption");
    expect(out[2]).toEqual({ weird: true });
  });
  it("archive keeps the row, restore removes only archivedAt", () => {
    const archived = applyContentUpdate(raw, (i) => archiveContent(i, "a", "2026-10-31T00:00:00Z")) as any[];
    expect(archived).toHaveLength(3);
    expect(archived[0].archivedAt).toBe("2026-10-31T00:00:00Z");
    const restored = applyContentUpdate(archived, (i) => restoreContent(i, "a")) as any[];
    expect(restored[0].archivedAt).toBeUndefined();
    expect(restored[0].legacyX).toBe(7);
  });
  it("an update through the full list retains archived rows", () => {
    const archived = applyContentUpdate(raw, (i) => archiveContent(i, "b", "t"));
    const edited = applyContentUpdate(archived, (i) => i.map((x) => (x.id === "a" ? { ...x, stage: "Draft" as const } : x))) as any[];
    expect(edited.find((x) => x.id === "b")?.archivedAt).toBe("t");
  });
});

describe("filters and counts", () => {
  const items = archiveContent(applyContentUpdate(raw, (i) => i).slice(0, 2) as any, "a", "t");
  it("active view hides archived, archived view shows only archived", () => {
    expect(filterContent(items, all).map((i) => i.id)).toEqual(["b"]);
    expect(filterContent(items, { ...all, view: "archived" }).map((i) => i.id)).toEqual(["a"]);
  });
  it("project filter: 'none' and specific id", () => {
    const active = restoreContent(items, "a");
    expect(filterContent(active, { ...all, projectId: "none" }).map((i) => i.id)).toEqual(["a"]);
    expect(filterContent(active, { ...all, projectId: "p1" }).map((i) => i.id)).toEqual(["b"]);
  });
  it("counts exclude archived; due = unpublished on/before today", () => {
    expect(contentCounts(items, "2026-10-31")).toEqual({ active: 1, archived: 1, due: 1, ready: 1, published: 0 });
    expect(nextUp(items).map((i) => i.id)).toEqual(["b"]);
  });
  it("export contains exactly the given records", () => {
    const parsed = JSON.parse(contentExport(items, "x"));
    expect(parsed.format).toBe("evolution-content/v1");
    expect(parsed.count).toBe(2);
  });
});

describe("validation and ids", () => {
  it("real calendar dates only", () => {
    expect(isValidPlannedDate("")).toBe(true);
    expect(isValidPlannedDate("2028-02-29")).toBe(true);
    expect(isValidPlannedDate("2026-02-29")).toBe(false);
    expect(isValidPlannedDate("2026-04-31")).toBe(false);
    expect(isValidPlannedDate("2026-13-01")).toBe(false);
    expect(isValidPlannedDate("26-1-1")).toBe(false);
  });
  it("unique id never collides with existing (including archived) ids", () => {
    const ids = ["a", "a", "a"];
    let n = 0;
    expect(uniqueContentId([{ id: "a" }], () => ids[n++] ?? "a")).not.toBe("a");
  });
});

import { setContentStage, targetState } from "./media-content";
describe("stale / blocked actions", () => {
  const items = applyContentUpdate(raw, (i) => archiveContent(i, "b", "t")) as any[];
  const parsed = items.slice(0, 2);
  it("stage change on an archived target is refused and changes nothing", () => {
    const r = setContentStage(parsed, "b", "Published");
    expect(r.state).toBe("archived");
    expect(r.items).toBe(parsed);
  });
  it("stage change on a missing target is refused", () => {
    expect(setContentStage(parsed, "zzz", "Draft").state).toBe("missing");
  });
  it("active target updates and keeps unknown fields", () => {
    const r = setContentStage(parsed, "a", "Draft");
    expect(r.state).toBe("active");
    expect(r.items[0]).toMatchObject({ stage: "Draft", legacyX: 7 });
  });
  it("targetState reflects archive/restore in the raw structure, unparsable kept", () => {
    expect(targetState(parsed, "b")).toBe("archived");
    const restored = applyContentUpdate(items, (i) => restoreContent(i, "b")) as any[];
    expect(targetState(restored.slice(0, 2), "b")).toBe("active");
    expect(restored[2]).toEqual({ weird: true });
  });
  it("legacy phone screen archives instead of deleting and hides archived rows", async () => {
    const { readFileSync } = await import("node:fs");
    const html = readFileSync("public/evolution-mobile/index.html", "utf8");
    expect(html).not.toContain("mediaItems: (s.biz.mediaItems || []).filter(i => i.id !== x.id)");
    expect(html).toContain("archivedAt: new Date().toISOString()");
    expect(html).toContain(".filter(x => x && !x.archivedAt)");
  });
});
