import { describe, it, expect, beforeEach, vi } from "vitest";

// ---- minimal browser globals ----
const mem: Record<string, string> = {};
const ls = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = String(v); }, removeItem: (k: string) => { delete mem[k]; } };
const et = new EventTarget();
(globalThis as any).localStorage = ls;
(globalThis as any).__EVO_NO_AUTO_CLOUD__ = true;
(globalThis as any).window = Object.assign(et, { localStorage: ls, addEventListener: et.addEventListener.bind(et), dispatchEvent: et.dispatchEvent.bind(et), removeEventListener: et.removeEventListener.bind(et) });
(globalThis as any).document = { addEventListener() {}, visibilityState: "visible" };

// ---- mock cloud: per-user rows, scriptable failures ----
const cloud: Record<string, any> = {};
let failReads = 0, failWrites = 0, readDelay: Promise<void> | null = null;
const uploads: { uid: string; data: any }[] = [];
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
    from: () => ({
      select: () => ({ eq: (_c: string, uid: string) => ({ maybeSingle: async () => {
        if (readDelay) await readDelay;
        if (failReads > 0) { failReads--; return { data: null, error: { message: "boom" } }; }
        return { data: cloud[uid] ? { data: JSON.parse(JSON.stringify(cloud[uid])) } : null, error: null };
      } }) }),
      upsert: async ({ user_id, data }: any) => {
        if (failWrites > 0) { failWrites--; return { error: { message: "offline" } }; }
        cloud[user_id] = data; uploads.push({ uid: user_id, data }); return { error: null };
      },
    }),
  },
}));
const mod = await import("./evolution-data");
const { __cloudTest, loadEvolutionData, saveEvolutionData, defaultData } = mod;
const KEY = "evolution:data:v2";
const task = (id: string, text: string) => ({ id, text, category: "Notes", priority: "Low", due: "2026-10-02", status: "Not Started" });
const local = () => loadEvolutionData();
const edit = (patch: any) => saveEvolutionData({ ...local(), ...patch });
const tick = (ms = 900) => new Promise((r) => setTimeout(r, ms));

beforeEach(() => {
  __cloudTest.deactivateCloud();
  for (const k in mem) delete mem[k];
  for (const k in cloud) delete cloud[k];
  uploads.length = 0; failReads = 0; failWrites = 0; readDelay = null;
});

describe("hydrate", () => {
  it("supplements survive an actual reload (load → save → load from storage)", () => {
    edit({ supplementList: [{ id: "s1", name: "Zinc", time: "AM", dose: "15mg" }], supplementDone: { "2026-10-02": ["s1"] } });
    const raw = mem[KEY];
    for (const k in mem) delete mem[k];
    mem[KEY] = raw; // simulate a fresh page load reading only storage
    const d = local();
    expect(d.supplementList?.[0].name).toBe("Zinc");
    expect(d.supplementDone?.["2026-10-02"]).toEqual(["s1"]);
  });
});

describe("cloud sync", () => {
  it("failed read never uploads and never wipes; edits during failure + retries are merged later", async () => {
    mem["evolution:data:owner"] = "U";
    cloud.U = { ...defaultData, evoTasks: [task("r1", "remote")], _version: 6 };
    mem["evolution:data:synced:U"] = JSON.stringify({ ...defaultData, evoTasks: [task("r1", "remote")], _version: 6 });
    failReads = 2;
    await __cloudTest.activateCloudForUser("U");
    expect(uploads.length).toBe(0);
    edit({ evoTasks: [...local().evoTasks, task("l1", "edit during failure 1")] });
    await __cloudTest.activateCloudForUser("U", 1); // retry fails again
    edit({ evoTasks: [...local().evoTasks, task("l2", "edit during failure 2")] });
    // meanwhile another device adds a record remotely
    cloud.U.evoTasks.push(task("r2", "other device"));
    await __cloudTest.activateCloudForUser("U", 2); // succeeds
    const ids = local().evoTasks.map((t) => t.id).sort();
    expect(ids).toEqual(["l1", "l2", "r1", "r2"]);
    await tick();
    expect(cloud.U.evoTasks.map((t: any) => t.id).sort()).toEqual(["l1", "l2", "r1", "r2"]);
  });

  it("late read: edits made while the read is in flight don't replace unrelated remote data", async () => {
    mem["evolution:data:owner"] = "U";
    edit({ evoTasks: [task("r1", "remote")], goals: [] });
    mem["evolution:data:synced:U"] = mem[KEY];
    cloud.U = { ...local(), evoTasks: [task("r1", "remote"), task("r9", "remote new")], goals: [{ id: "g1", title: "remote goal" }], _version: 6 };
    let release!: () => void; readDelay = new Promise((r) => (release = r));
    const p = __cloudTest.activateCloudForUser("U");
    edit({ evoTasks: [task("r1", "renamed locally")] });
    release(); await p;
    const d = local();
    expect(d.evoTasks.map((t) => [t.id, t.text])).toEqual([["r1", "renamed locally"], ["r9", "remote new"]]);
    expect((d.goals as any)[0].title).toBe("remote goal");
  });

  it("switching accounts: A's local data is archived, never shown to or uploaded for B (even when B's read fails)", async () => {
    mem["evolution:data:owner"] = "A";
    edit({ evoTasks: [task("a1", "A private")] });
    failReads = 1;
    await __cloudTest.activateCloudForUser("B");
    expect(local().evoTasks.find((t) => t.id === "a1")).toBeUndefined();
    expect(mem["evolution:data:backup:A"]).toContain("A private");
    edit({ evoTasks: [task("b1", "B offline")] });
    await tick();
    expect(uploads.length).toBe(0);
    await __cloudTest.activateCloudForUser("B", 1); // B read now succeeds (empty account → seeded)
    expect(uploads.every((u) => u.uid === "B" && !JSON.stringify(u.data).includes("A private"))).toBe(true);
    expect(cloud.B.evoTasks.map((t: any) => t.id)).toEqual(["b1"]);
    // A comes back: their device copy is restored
    __cloudTest.deactivateCloud();
    cloud.A = { ...defaultData, evoTasks: [task("a1", "A private")], _version: 6 };
    await __cloudTest.activateCloudForUser("A");
    expect(local().evoTasks.map((t) => t.id)).toEqual(["a1"]);
  });

  it("failed save keeps changes dirty and retries; a reload merges them up", async () => {
    mem["evolution:data:owner"] = "U";
    cloud.U = { ...defaultData, evoTasks: [], _version: 6 };
    await __cloudTest.activateCloudForUser("U");
    failWrites = 1;
    edit({ evoTasks: [task("x1", "offline edit")] });
    await tick();
    expect(mod.getCloudStatus()).toBe("error");
    expect(cloud.U.evoTasks).toEqual([]);
    // simulate reload before the retry fires
    __cloudTest.deactivateCloud();
    await __cloudTest.activateCloudForUser("U");
    await tick();
    expect(cloud.U.evoTasks.map((t: any) => t.id)).toEqual(["x1"]);
  });
});
