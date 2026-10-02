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
