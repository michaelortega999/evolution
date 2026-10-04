import { describe, it, expect, beforeEach, vi } from "vitest";
const mem: Record<string,string> = {};
(globalThis as any).localStorage = { getItem:(k:string)=>mem[k]??null, setItem:(k:string,v:string)=>{mem[k]=v}, removeItem:(k:string)=>{delete mem[k]} };
(globalThis as any).window = undefined;
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
let desk: any = { evoTasks: [], calendar: [] };
vi.mock("./evolution-data", () => ({ loadEvolutionData: () => JSON.parse(JSON.stringify(desk)), saveEvolutionData: (d:any) => { desk = d; } }));
import { syncMobileBridge } from "./mobile-bridge";
const phone = () => JSON.parse(mem["evolution05:userdata:v4"]).tk;
const setPhone = (tk:any) => { const s = JSON.parse(mem["evolution05:userdata:v4"] ?? '{"seedv":3}'); s.tk = { ...(s.tk??{}), ...tk }; mem["evolution05:userdata:v4"] = JSON.stringify(s); };
beforeEach(() => { for (const k in mem) delete mem[k]; desk = { evoTasks: [], calendar: [] }; });
describe("bridge", () => {
  it("keeps unsynced phone tasks at startup", () => {
    setPhone({ tasks: [{ id: 1, title: "phone only", done: false, date: "2026-10-02" }], events: [] });
    desk.evoTasks = [{ id: "d1", text: "desk", category: "Business", priority: "High", due: "2026-10-02", status: "In Progress" }];
    syncMobileBridge(true);
    expect(phone().tasks.map((t:any)=>t.title).sort()).toEqual(["desk","phone only"]);
    expect(desk.evoTasks.length).toBe(2);
  });
  it("phone edit keeps desktop fields; phone delete propagates, no resurrection", () => {
    desk.evoTasks = [{ id: "d1", text: "desk", category: "Business", priority: "High", due: "2026-10-02", status: "In Progress" }];
    syncMobileBridge(true);
    setPhone({ tasks: [{ ...phone().tasks[0], title: "renamed", done: true }] });
    syncMobileBridge(false);
    expect(desk.evoTasks[0]).toMatchObject({ text: "renamed", status: "Done", priority: "High", category: "Business" });
    setPhone({ tasks: [] }); syncMobileBridge(false);
    expect(desk.evoTasks.length).toBe(0);
    syncMobileBridge(true); expect(phone().tasks.length).toBe(0);
  });
  it("desktop delete propagates to phone at next startup", () => {
    desk.evoTasks = [{ id: "d1", text: "a", category: "Notes", priority: "Low", due: "2026-10-02", status: "Not Started" }];
    desk.calendar = [{ id: "c1", title: "mtg", date: "2026-10-03", time: "09:00", endTime: "10:30" }];
    syncMobileBridge(true);
    expect(phone().events[0].dur).toBe(90);
    desk.evoTasks = []; desk.calendar = [];
    syncMobileBridge(false); expect(desk.evoTasks.length).toBe(0);
    syncMobileBridge(true); expect(phone().tasks.length + phone().events.length).toBe(0);
  });
  it("phone events create/edit go to desktop with endTime", () => {
    syncMobileBridge(true);
    setPhone({ events: [{ id: 5, title: "gym", date: "2026-10-04", time: "18:00", dur: 45, cat: "HEALTH" }] });
    syncMobileBridge(false);
    expect(desk.calendar[0]).toMatchObject({ id: "m5", title: "gym", time: "18:00", endTime: "18:45" });
  });
});
describe("bridge: running phone + accounts", () => {
  const T = (id: string, text: string, status = "Not Started") => ({ id, text, category: "Business", priority: "High", due: "2026-10-02", status });
  it("desktop edit survives two polls against a stale running phone", () => {
    desk.evoTasks = [T("d1", "orig")];
    syncMobileBridge(true);
    desk.evoTasks = [T("d1", "desk edit")];
    syncMobileBridge(false); syncMobileBridge(false);
    expect(desk.evoTasks[0].text).toBe("desk edit");
    syncMobileBridge(true); expect(phone().tasks[0].title).toBe("desk edit");
  });
  it("desktop delete survives two polls against a stale running phone", () => {
    desk.evoTasks = [T("d1", "a"), T("d2", "b")];
    syncMobileBridge(true);
    desk.evoTasks = [T("d2", "b")];
    syncMobileBridge(false); syncMobileBridge(false);
    expect(desk.evoTasks.map((t: any) => t.id)).toEqual(["d2"]);
    syncMobileBridge(true); expect(phone().tasks.map((t: any) => t.extId)).toEqual(["d2"]);
  });
  it("account A phone items never reach account B; A's are restored for A", () => {
    mem["evolution:data:owner"] = "A";
    setPhone({ tasks: [{ id: 1, title: "A secret", done: false, date: "2026-10-02" }], events: [] });
    syncMobileBridge(true);
    expect(desk.evoTasks.map((t: any) => t.text)).toEqual(["A secret"]);
    const deskA = desk;
    // B signs in (desktop data swapped by evolution-data; B read may even fail → B local is empty)
    mem["evolution:data:owner"] = "B"; desk = { evoTasks: [], calendar: [] };
    syncMobileBridge(false); // stale poll before alignment must be refused
    expect(desk.evoTasks).toEqual([]);
    syncMobileBridge(true);
    expect(desk.evoTasks).toEqual([]);
    expect(phone().tasks ?? []).toEqual([]);
    expect(mem["evolution05:userdata:v4:owner:A"]).toContain("A secret");
    // back to A
    mem["evolution:data:owner"] = "A"; desk = deskA;
    syncMobileBridge(true);
    expect(phone().tasks.map((t: any) => t.title)).toEqual(["A secret"]);
  });
});

describe("phone-only sections", () => {
  it("phoneOnlySections strips tasks/events and keeps unknown fields (pure helper)", async () => {
    const { phoneOnlySections } = await import("./mobile-bridge");
    const store = { seedv: 3, jr: { entries: [{ id: 9, title: "mine" }] }, fit: { sessions: [{ id: 1, date: "2026-10-04" }] }, futureField: 1, tk: { tasks: [{ id: 1 }], events: [{ id: 2 }], goals: [{ id: 3 }] } };
    const out = phoneOnlySections(store) as any;
    expect(out.jr.entries[0].title).toBe("mine");
    expect(out.futureField).toBe(1);
    expect(out.tk.tasks).toBeUndefined();
    expect(out.tk.events).toBeUndefined();
    expect(out.tk.goals).toEqual([{ id: 3 }]);
  });
});

const store = () => JSON.parse(mem["evolution05:userdata:v4"]);
const setStore = (x: any) => { mem["evolution05:userdata:v4"] = JSON.stringify(x); };
const ids = (a: any[]) => a.map((x) => x.id).sort();
describe("phone-only data: real bridge restore + three-way merge", () => {
  it("fresh device: restores the account copy with zero tasks/events, keeping unknown fields", () => {
    desk.phoneStore = { v: 1, data: { seedv: 3, tk: { goals: [], habits: [] }, jr: { entries: [{ id: "j1", title: "cloud only" }] }, nut: { logs: [] }, unknownFuture: { keep: "safe" } } };
    expect(syncMobileBridge(true)).toBe(true);
    const s = store();
    expect(s.jr.entries).toEqual([{ id: "j1", title: "cloud only" }]);
    expect(s.unknownFuture).toEqual({ keep: "safe" });
    expect(s.tk.tasks).toEqual([]); expect(s.tk.events).toEqual([]);
    expect(desk.phoneStore.data.jr.entries.map((e: any) => e.id)).toEqual(["j1"]);
  });
  it("stale running phone (repeated polls) never discards a remote addition", () => {
    setStore({ seedv: 3, jr: { entries: [{ id: "j1", title: "a" }] }, tk: { tasks: [], events: [] } });
    syncMobileBridge(true);
    desk.phoneStore.data.jr.entries.push({ id: "j2", title: "other device" });
    for (let i = 0; i < 3; i++) syncMobileBridge(false);
    expect(ids(desk.phoneStore.data.jr.entries)).toEqual(["j1", "j2"]);
    syncMobileBridge(true); // next frame start shows it
    expect(ids(store().jr.entries)).toEqual(["j1", "j2"]);
  });
  it("running phone edit + remote add + remote delete all survive; no writes when unchanged", () => {
    setStore({ seedv: 3, jr: { entries: [{ id: "j1", title: "a" }, { id: "j3", title: "c" }] }, nut: { logs: [] }, tk: { tasks: [], events: [] } });
    syncMobileBridge(true);
    desk.phoneStore = { v: 1, data: { ...desk.phoneStore.data, jr: { entries: [{ id: "j1", title: "a" }, { id: "j2", title: "remote" }] } } }; // remote deleted j3, added j2
    const s = store(); s.nut.logs.push({ id: "m1", kcal: 300 }); s.tk.tab = "WEEK"; setStore(s); // pending local edit + UI tick
    syncMobileBridge(false);
    expect(ids(desk.phoneStore.data.jr.entries)).toEqual(["j1", "j2"]);
    expect(desk.phoneStore.data.nut.logs.map((l: any) => l.id)).toEqual(["m1"]);
    const snap = JSON.stringify(desk);
    const s2 = store(); s2.tk.tab = "MONTH"; setStore(s2);
    expect(syncMobileBridge(false)).toBe(false); // transient UI tick: no write
    expect(JSON.stringify(desk)).toBe(snap);
    expect(desk.phoneStore.data.tk.tab).toBeUndefined();
  });
  it("phone deletes propagate; id collision between clients keeps both records", () => {
    setStore({ seedv: 3, jr: { entries: [{ id: 1, title: "x" }] }, tk: { tasks: [], events: [] } });
    syncMobileBridge(true);
    const s = store(); s.jr.entries = [{ id: 2, title: "phone new" }]; setStore(s); // delete 1, add 2
    desk.phoneStore = { v: 1, data: { ...desk.phoneStore.data, jr: { entries: [{ id: 1, title: "x" }, { id: 2, title: "other client" }] } } };
    syncMobileBridge(false);
    const titles = desk.phoneStore.data.jr.entries.map((e: any) => e.title).sort();
    expect(titles).toEqual(["other client", "phone new"]);
    expect(new Set(desk.phoneStore.data.jr.entries.map((e: any) => e.id)).size).toBe(2);
  });
  it("owner switch: A's phone data never reaches B; unowned legacy store is backed up, not assigned", () => {
    mem["evolution:data:owner"] = "A";
    setStore({ seedv: 3, jr: { entries: [{ id: "legacy" }] }, tk: { tasks: [], events: [] } });
    syncMobileBridge(true);
    expect(mem["evolution05:userdata:v4:unowned"]).toContain("legacy");
    expect(JSON.stringify(desk.phoneStore ?? null)).not.toContain("legacy");
    const s = store(); s.jr = { entries: [{ id: "a1", title: "A private" }] }; setStore(s);
    syncMobileBridge(false);
    const deskA = desk;
    mem["evolution:data:owner"] = "B"; desk = { evoTasks: [], calendar: [] };
    expect(syncMobileBridge(false)).toBe(false);
    syncMobileBridge(true);
    expect(JSON.stringify(desk)).not.toContain("A private");
    expect(JSON.stringify(store())).not.toContain("A private");
    mem["evolution:data:owner"] = "A"; desk = deskA;
    syncMobileBridge(true);
    expect(store().jr.entries[0].title).toBe("A private");
  });
});
