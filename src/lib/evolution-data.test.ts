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
let holdWrites = false, reads = 0;
const held: { resolve: (fail?: boolean) => void }[] = [];
const uploads: { uid: string; data: any }[] = [];
let stamp = 0;
const ts: Record<string, string> = {};
async function heldGate(): Promise<boolean> {
  if (holdWrites) { const fail = await new Promise<boolean | undefined>((r) => held.push({ resolve: r })); if (fail) return true; }
  if (failWrites > 0) { failWrites--; return true; }
  return false;
}
function commit(uid: string, data: any) { cloud[uid] = data; ts[uid] = `t${++stamp}`; uploads.push({ uid, data }); }
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
    from: () => ({
      select: () => ({ eq: (_c: string, uid: string) => ({ maybeSingle: async () => {
        reads++;
        if (readDelay) await readDelay;
        if (failReads > 0) { failReads--; return { data: null, error: { message: "boom" } }; }
        if (cloud[uid] && !ts[uid]) ts[uid] = `t${++stamp}`;
        return { data: cloud[uid] ? { data: JSON.parse(JSON.stringify(cloud[uid])), updated_at: ts[uid] } : null, error: null };
      } }) }),
      update: ({ data }: any) => ({ eq: (_c: string, uid: string) => ({ eq: (_c2: string, at: string) => ({ select: async () => {
        if (await heldGate()) return { data: null, error: { message: "offline" } };
        if (!cloud[uid] || ts[uid] !== at) return { data: [], error: null }; // lost the race
        commit(uid, data); return { data: [{ updated_at: ts[uid] }], error: null };
      } }) }) }),
      insert: async ({ user_id, data }: any) => {
        if (await heldGate()) return { error: { message: "offline" } };
        if (cloud[user_id]) return { error: { code: "23505", message: "dup" } };
        commit(user_id, data); return { error: null };
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
  uploads.length = 0; for (const k in ts) delete ts[k]; failReads = 0; failWrites = 0; readDelay = null; holdWrites = false; held.length = 0; reads = 0;
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
    mem[KEY] = mem["evolution:data:synced:U"]; // device was in sync before going offline
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
describe("single-flight saves + reconnect recovery", () => {
  const note = (t: string) => ({ evoTasks: [task("n1", t)] });
  const flushMicro = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
  async function signedIn(uid = "U") {
    mem["evolution:data:owner"] = uid;
    cloud[uid] = { ...defaultData, evoTasks: [], _version: 6 };
    await __cloudTest.activateCloudForUser(uid);
  }

  it("overlapping saves never run concurrently; reversed completion can't leave older data in the cloud", async () => {
    await signedIn();
    holdWrites = true;
    edit(note("first edit"));
    const p1 = __cloudTest.flushSave();
    await flushMicro();
    edit(note("newer edit"));
    const p2 = __cloudTest.flushSave();
    await flushMicro();
    expect(held.length).toBe(1); // second write is coalesced, not concurrent
    held[0].resolve(); await p1; await p2; await flushMicro();
    expect(mod.getCloudStatus()).toBe("saving");
    expect(held.length).toBe(2);
    held[1].resolve(); await __cloudTest.idle();
    expect(cloud.U.evoTasks[0].text).toBe("newer edit");
    expect(JSON.parse(mem["evolution:data:synced:U"]).evoTasks[0].text).toBe("newer edit");
    expect(mod.getCloudStatus()).toBe("synced");
  });

  it("many edits during one in-flight save coalesce into one follow-up with the latest data", async () => {
    await signedIn();
    holdWrites = true;
    edit(note("a")); void __cloudTest.flushSave(); await flushMicro();
    for (const t of ["b", "c", "d"]) { edit(note(t)); void __cloudTest.flushSave(); }
    await flushMicro();
    held[0].resolve(); await flushMicro();
    expect(held.length).toBe(2);
    expect(mod.getCloudStatus()).toBe("saving"); // still dirty until latest acknowledged
    held[1].resolve(); await __cloudTest.idle();
    expect(uploads.map((u) => u.data.evoTasks[0].text)).toEqual(["a", "d"]);
    expect(mod.getCloudStatus()).toBe("synced");
  });

  it("an edit made during a save (without a new flush) is still uploaded afterwards", async () => {
    await signedIn();
    holdWrites = true;
    edit(note("one")); void __cloudTest.flushSave(); await flushMicro();
    edit(note("two")); __cloudTest.flushSave(); // debounced save turned into a queued push
    held[0].resolve(); await flushMicro(); held[1]?.resolve(); await __cloudTest.idle();
    expect(cloud.U.evoTasks[0].text).toBe("two");
  });

  it("failed in-flight write: stays error/dirty, base not advanced, merge base untouched", async () => {
    await signedIn();
    const before = mem["evolution:data:synced:U"];
    holdWrites = true;
    edit(note("x")); const p = __cloudTest.flushSave(); await flushMicro();
    held[0].resolve(true); await p;
    expect(mod.getCloudStatus()).toBe("error");
    expect(mem["evolution:data:synced:U"]).toBe(before);
    __cloudTest.deactivateCloud();
  });

  it("stale write completion after account switch doesn't touch the new session", async () => {
    await signedIn("A");
    holdWrites = true;
    edit(note("A data")); const p = __cloudTest.flushSave(); await flushMicro();
    cloud.B = { ...defaultData, evoTasks: [], _version: 6 };
    __cloudTest.deactivateCloud();
    holdWrites = false;
    await __cloudTest.activateCloudForUser("B");
    held[0].resolve(); await p;
    expect(mod.getCloudStatus()).toBe("synced");
    expect(mem["evolution:data:synced:B"]).not.toContain("A data");
    expect(JSON.stringify(cloud.B)).not.toContain("A data");
  });

  it("reads exhausted then reconnect: resumes read, merges offline local + remote edits, then uploads", async () => {
    mem["evolution:data:owner"] = "U";
    const synced = { ...defaultData, evoTasks: [task("r1", "remote")], _version: 6 };
    cloud.U = JSON.parse(JSON.stringify(synced));
    mem["evolution:data:synced:U"] = JSON.stringify(synced); mem[KEY] = JSON.stringify(synced);
    failReads = 5;
    for (let a = 0; a < 5; a++) {
      await __cloudTest.activateCloudForUser("U", a);
      edit({ evoTasks: [...local().evoTasks, task("l" + a, "offline " + a)] });
    }
    expect(reads).toBe(5);
    expect(uploads.length).toBe(0);
    expect(mod.getCloudStatus()).toBe("error");
    cloud.U.evoTasks.push(task("r2", "other device"));
    __cloudTest.resumeCloudRead();
    __cloudTest.resumeCloudRead(); // duplicate online events don't double-activate
    await tick(50);
    expect(reads).toBe(6);
    const ids = local().evoTasks.map((t) => t.id).sort();
    expect(ids).toEqual(["l0", "l1", "l2", "l3", "l4", "r1", "r2"]);
    await tick();
    expect(cloud.U.evoTasks.map((t: any) => t.id).sort()).toEqual(ids);
    expect(mod.getCloudStatus()).toBe("synced");
  });

  it("sign-out or switch during a recovery read: late result is dropped, nothing uploaded", async () => {
    mem["evolution:data:owner"] = "U";
    cloud.U = { ...defaultData, evoTasks: [task("r1", "U remote")], _version: 6 };
    failReads = 5;
    for (let a = 0; a < 5; a++) await __cloudTest.activateCloudForUser("U", a);
    let release!: () => void; readDelay = new Promise((r) => (release = r));
    __cloudTest.resumeCloudRead();
    __cloudTest.deactivateCloud();
    release(); await tick(50);
    expect(mod.getCloudStatus()).toBe("signed-out");
    expect(local().evoTasks.find((t) => t.id === "r1")).toBeUndefined();
    __cloudTest.resumeCloudRead(); // no account → no read
    await tick(20);
    expect(reads).toBe(6);
    expect(uploads.length).toBe(0);
  });
});
describe("clear all", () => {
  it("empties phone tasks/events and bridge base (archived) so they can't sync back", () => {
    mem["evolution05:userdata:v4"] = JSON.stringify({ seedv: 3, tk: { tasks: [{ id: 1, title: "t" }], events: [{ id: 2, title: "e" }] }, fit: { x: 1 } });
    mem["evolution:mobile-bridge:base:v1"] = JSON.stringify({ tasks: { m1: {} }, events: {} });
    mod.clearPhoneTasksForReset();
    const s = JSON.parse(mem["evolution05:userdata:v4"]);
    expect(s.tk.tasks).toEqual([]); expect(s.tk.events).toEqual([]); expect(s.fit).toEqual({ x: 1 });
    expect(mem["evolution:mobile-bridge:base:v1"]).toBeUndefined();
    expect(mem["evolution05:userdata:v4:cleared:local"]).toContain('"title":"t"');
  });
});
