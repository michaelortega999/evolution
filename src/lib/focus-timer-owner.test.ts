import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createFocusTimerStore, freshTimer, timerKey, LEGACY_TIMER_KEY, LEGACY_TIMER_BACKUP_KEY } from "./focus-timer-store";

// Execute the real hook with deterministic React scheduling, including deliberately deferred effects.
// No DOM renderer, live auth, network, or user storage is used.
const hooks = vi.hoisted(() => {
  let active: any;
  const equal = (a: any[], b: any[]) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  return {
    useState(initial: any) {
      const r = active, i = r.cursor++;
      if (!(i in r.slots)) r.slots[i] = typeof initial === "function" ? initial() : initial;
      return [r.slots[i], (v: any) => { r.slots[i] = typeof v === "function" ? v(r.slots[i]) : v; r.dirty = true; }];
    },
    useRef(initial: any) {
      const r = active, i = r.cursor++;
      if (!(i in r.slots)) r.slots[i] = { current: initial };
      return r.slots[i];
    },
    useCallback(fn: any, deps: any[]) {
      const r = active, i = r.cursor++;
      if (!r.slots[i] || !equal(r.slots[i].deps, deps)) r.slots[i] = { fn, deps };
      return r.slots[i].fn;
    },
    useEffect(fn: any, deps: any[]) {
      const r = active, i = r.cursor++;
      if (!r.slots[i] || !equal(r.slots[i].deps, deps)) {
        const cleanup = r.slots[i]?.cleanup;
        r.slots[i] = { deps, cleanup };
        r.pending.set(i, fn);
      }
    },
    runner(hook: () => any) {
      const r: any = { slots: [], cursor: 0, dirty: false, pending: new Map(), value: null };
      r.render = (effects = true) => {
        let turns = 0;
        do {
          if (++turns > 30) throw Error("Hook did not settle");
          r.dirty = false; r.cursor = 0; active = r;
          try { r.value = hook(); } finally { active = null; }
          if (effects) r.flushEffects();
        } while (effects && r.dirty);
        return r.value;
      };
      r.flushEffects = () => {
        const pending = [...r.pending.entries()]; r.pending.clear();
        for (const [i, fn] of pending) { r.slots[i]?.cleanup?.(); r.slots[i].cleanup = fn(); }
      };
      r.unmount = () => r.slots.forEach((s: any) => s?.cleanup?.());
      return r;
    },
  };
});
vi.mock("react", () => hooks);
const model = vi.hoisted(() => ({ rows: {} as Record<string, any>, beforeMutate: null as null | (() => void) }));
const settings = { focusMin: 1, shortMin: 1, longMin: 2, longEvery: 4 };
const OWNER_KEY = "evolution:data:owner";
vi.mock("./evolution-data", () => ({
  OWNER_KEY: "evolution:data:owner",
  getLocalOwner: () => localStorage.getItem("evolution:data:owner"),
  useEvolutionData: () => ({
    data: model.rows[localStorage.getItem("evolution:data:owner") ?? "guest"],
    mutate: (fn: any) => {
      model.beforeMutate?.(); model.beforeMutate = null;
      const owner = localStorage.getItem("evolution:data:owner") ?? "guest";
      const prev = model.rows[owner];
      model.rows[owner] = { ...prev, ...(typeof fn === "function" ? fn(prev) : fn) };
    },
  }),
}));
vi.mock("./utils", () => ({ localISO: (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` }));

function storage() {
  const values = new Map<string, string>();
  return { values, getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => { values.set(k, String(v)); }, removeItem: (k: string) => { values.delete(k); },
    clear: () => values.clear(), key: (i: number) => [...values.keys()][i] ?? null, get length() { return values.size; } };
}
let mem: ReturnType<typeof storage>;
let runners: any[];
async function hookRunner() {
  const { useFocusTimer } = await import("./use-focus-timer");
  const r = hooks.runner(useFocusTimer); runners.push(r); r.render(); return r;
}
function changeOwner(next: string) {
  window.dispatchEvent(new CustomEvent("evolution:owner-changing"));
  localStorage.setItem(OWNER_KEY, next);
  window.dispatchEvent(new CustomEvent("evolution:data-updated"));
  window.dispatchEvent(new CustomEvent("evolution:owner-changed"));
}
beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-05T00:00:00Z"));
  mem = storage(); mem.setItem(OWNER_KEY, "A"); runners = [];
  vi.stubGlobal("localStorage", mem);
  vi.stubGlobal("window", new EventTarget());
  model.beforeMutate = null;
  model.rows = Object.fromEntries(["A", "B", "guest"].map((owner) => [owner, {
    focusSettings: { ...settings }, focusSessions: [{ id: `history-${owner}` }], timeLogs: [],
  }]));
});
afterEach(() => { runners.forEach((r) => r.unmount()); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("owner-scoped timer persistence", () => {
  it("backs up legacy global state verbatim without assigning it to any owner", () => {
    const raw = '{"task":"unowned private task","tag":"Guitar","running":true}';
    mem.setItem(LEGACY_TIMER_KEY, raw);
    const store = createFocusTimerStore(mem, () => mem.getItem(OWNER_KEY));
    expect(mem.getItem(LEGACY_TIMER_BACKUP_KEY)).toBe(raw);
    expect(mem.getItem(LEGACY_TIMER_KEY)).toBe(raw);
    for (const owner of ["A", "B", "guest"]) {
      mem.setItem(OWNER_KEY, owner); store.finishOwnerChange();
      expect(store.read(settings).timer.task).toBe("");
      expect(mem.getItem(timerKey(owner))).toBeNull();
    }
  });
  it("pauses and masks synchronously, preserves A/B/guest separately, rejects stale generations", () => {
    const store = createFocusTimerStore(mem, () => mem.getItem(OWNER_KEY));
    const old = store.read(settings);
    store.save(old.lease, { ...old.timer, task: "A private", tag: "Guitar", running: true, startedAt: Date.now() });
    vi.setSystemTime(Date.now() + 10_000);
    store.beginOwnerChange();
    expect(store.read(settings).timer.task).toBe("");
    expect(store.isCurrent(old.lease)).toBe(false);
    expect(JSON.parse(mem.getItem(timerKey("A"))!)).toMatchObject({ task: "A private", running: false, remainingMs: 50_000 });
    for (const owner of ["B", "guest"]) {
      mem.setItem(OWNER_KEY, owner); store.finishOwnerChange();
      const snap = store.read(settings);
      expect(snap.timer.task).toBe("");
      store.save(snap.lease, { ...snap.timer, task: `${owner} task` }); store.beginOwnerChange();
    }
    mem.setItem(OWNER_KEY, "A"); store.finishOwnerChange();
    expect(store.read(settings).timer).toMatchObject({ task: "A private", tag: "Guitar", running: false, remainingMs: 50_000 });
    expect(store.save(old.lease, freshTimer(settings))).toBe(false);
    expect(JSON.parse(mem.getItem(timerKey("B"))!).task).toBe("B task");
    expect(JSON.parse(mem.getItem(timerKey("guest"))!).task).toBe("guest task");
  });
});

describe("actual useFocusTimer lifecycle", () => {
  it("running sign-out masks task/tag, pauses the old timer, and preserves history on return", async () => {
    const r = await hookRunner();
    r.value.setTask("A work"); r.value.setTag("Guitar"); r.value.start(); r.render();
    const stale = r.value;
    vi.advanceTimersByTime(10_000);
    changeOwner("guest");
    expect(r.render()).toMatchObject({ task: "", tag: null, running: false, notification: null });
    stale.logSession(); stale.start(); stale.setTask("should not write"); stale.updateSettings({ focusMin: 90 });
    expect(model.rows.guest.focusSessions).toHaveLength(1);
    expect(model.rows.guest.focusSettings.focusMin).toBe(1);
    expect(mem.getItem(timerKey("guest"))).toBeNull();
    changeOwner("A");
    expect(r.render()).toMatchObject({ task: "A work", tag: "Guitar", running: false, remainingMs: 50_000 });
    expect(model.rows.A.focusSessions).toEqual([{ id: "history-A" }]);
    stale.setTag("Wealth");
    expect(r.render().tag).toBe("Guitar");
  });
  it("a queued completion effect from A cannot log into B", async () => {
    const r = await hookRunner(); r.value.setTask("A finished"); r.value.start(); r.render();
    vi.advanceTimersByTime(60_001); r.render(false); // capture the actual expired-timer effect without committing it
    changeOwner("B"); r.flushEffects(); r.render();
    expect(model.rows.B.focusSessions).toEqual([{ id: "history-B" }]);
    expect(model.rows.B.timeLogs).toEqual([]);
    expect(model.rows.A.focusSessions).toEqual([{ id: "history-A" }]);
    expect(r.value).toMatchObject({ task: "", tag: null, running: false, notification: null });
  });
  it("checks the owner again inside a deferred data mutation", async () => {
    const r = await hookRunner(); r.value.setTask("A manual"); r.render();
    model.beforeMutate = () => changeOwner("B");
    r.value.logSession();
    expect(model.rows.B.focusSessions).toEqual([{ id: "history-B" }]);
    expect(model.rows.B.timeLogs).toEqual([]);
  });
  it("normal completion still logs once and only for its owner across mounted timers", async () => {
    const a = await hookRunner(), b = await hookRunner();
    a.value.setTask("A completed"); a.value.start(); a.render(); b.render();
    vi.advanceTimersByTime(60_001); a.render(false); b.render(false);
    a.flushEffects(); b.flushEffects(); a.render(); b.render();
    expect(model.rows.A.focusSessions).toHaveLength(2);
    expect(model.rows.A.focusSessions[1].task).toBe("A completed");
    expect(model.rows.A.timeLogs).toHaveLength(1);
    expect(model.rows.B.focusSessions).toHaveLength(1);
    expect(a.value).toMatchObject({ mode: "short", running: false });
  });
  it("raw other-tab owner changes block stale callbacks even before the storage event", async () => {
    const r = await hookRunner(); r.value.setTask("A secret"); r.value.start(); r.render();
    const stale = r.value; mem.setItem(OWNER_KEY, "B");
    stale.logSession(); stale.setTask("A leak");
    const event = new Event("storage"); Object.defineProperty(event, "key", { value: OWNER_KEY });
    window.dispatchEvent(event);
    expect(r.render()).toMatchObject({ task: "", tag: null, running: false });
    expect(model.rows.B.focusSessions).toHaveLength(1);
    expect(mem.getItem(timerKey("B"))).toBeNull();
    expect(JSON.parse(mem.getItem(timerKey("A"))!).running).toBe(false);
  });
  it("legacy global state never appears through the actual hook", async () => {
    const raw = JSON.stringify({ ...freshTimer(settings), task: "legacy", tag: "Wealth" });
    mem.setItem(LEGACY_TIMER_KEY, raw);
    const r = await hookRunner();
    expect(r.value).toMatchObject({ task: "", tag: null, running: false });
    expect(mem.getItem(LEGACY_TIMER_BACKUP_KEY)).toBe(raw);
  });
});
