import { describe, it, expect, vi } from "vitest";
import { createPhoneSignOutHandler } from "./mobile-auth";

function fixture(signOut = vi.fn(async () => ({ error: null as unknown }))) {
  const source = { postMessage: vi.fn() } as unknown as Window;
  let frame: Window | null = source;
  let owner: string | null = "A";
  const flush = vi.fn();
  const handle = createPhoneSignOutHandler({ origin: "https://demo.invalid", getFrame: () => frame, getOwner: () => owner, flush, signOut });
  const event = (patch: Partial<MessageEvent> = {}) => ({ source, origin: "https://demo.invalid", data: { type: "evo:sign-out-request", requestId: "so_1" }, ...patch }) as MessageEvent;
  return { source, signOut, flush, handle, event, setFrame: (v: Window | null) => { frame = v; }, setOwner: (v: string) => { owner = v; } };
}

describe("phone sign-out bridge", () => {
  it("flushes edits then invokes real auth and acknowledges success", async () => {
    const f = fixture(); await f.handle(f.event());
    expect(f.flush).toHaveBeenCalledOnce(); expect(f.signOut).toHaveBeenCalledOnce();
    expect(f.flush.mock.invocationCallOrder[0]).toBeLessThan(f.signOut.mock.invocationCallOrder[0]);
    expect(f.source.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "evo:sign-out-result", requestId: "so_1", ok: true }), "https://demo.invalid");
  });
  it("rejects other origins, other frames and malformed requests", async () => {
    const f = fixture();
    for (const e of [f.event({ origin: "https://other.invalid" }), f.event({ source: {} as Window }), f.event({ data: { type: "evo:sign-out-request", requestId: "" } }), f.event({ data: { type: "evo:bank", requestId: "so_1" } })]) await f.handle(e);
    expect(f.signOut).not.toHaveBeenCalled(); expect(f.flush).not.toHaveBeenCalled();
  });
  it("coalesces duplicate clicks while auth is pending", async () => {
    let finish!: (v: { error: unknown }) => void;
    const f = fixture(vi.fn(() => new Promise((r) => { finish = r; })));
    const p = f.handle(f.event()); await f.handle(f.event()); expect(f.signOut).toHaveBeenCalledOnce();
    finish({ error: null }); await p;
  });
  it("reports failure without claiming sign-out, and permits retry", async () => {
    const f = fixture(vi.fn(async () => ({ error: new Error("failure") })));
    await f.handle(f.event()); await f.handle(f.event());
    expect(f.signOut).toHaveBeenCalledTimes(2);
    expect(f.source.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ ok: false }), "https://demo.invalid");
  });
  it("does not deliver a stale result to a changed owner/frame", async () => {
    let finish!: (v: { error: unknown }) => void;
    const f = fixture(vi.fn(() => new Promise((r) => { finish = r; })));
    const p = f.handle(f.event()); f.setOwner("B"); f.setFrame({ postMessage: vi.fn() } as unknown as Window);
    finish({ error: null }); await p; expect(f.source.postMessage).not.toHaveBeenCalled();
  });
  it("does not sign out when preserving local edits fails", async () => {
    const f = fixture(); f.flush.mockImplementation(() => { throw new Error("storage failure"); });
    await f.handle(f.event()); expect(f.signOut).not.toHaveBeenCalled();
    expect(f.source.postMessage).toHaveBeenCalledWith(expect.objectContaining({ ok: false }), "https://demo.invalid");
  });
});
