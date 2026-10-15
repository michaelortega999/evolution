import { describe, it, expect, vi } from "vitest";
import { createSignUp, createSignOut } from "./auth-actions";

describe("email sign-up", () => {
  it("confirmation required (no session) → check-email, never signed-in", async () => {
    const run = createSignUp(async () => ({ data: { session: null }, error: null }));
    expect(await run("a@x.io")).toEqual({ kind: "check-email", email: "a@x.io" });
  });
  it("returned session → signed-in", async () => {
    const run = createSignUp(async () => ({ data: { session: { access_token: "t" } }, error: null }));
    expect((await run("a@x.io")).kind).toBe("signed-in");
  });
  it("auth error and thrown error → error, then retry works", async () => {
    const fn = vi.fn().mockResolvedValueOnce({ data: null, error: { message: "User already registered" } })
      .mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce({ data: { session: null }, error: null });
    const run = createSignUp(fn);
    expect(await run("a@x.io")).toEqual({ kind: "error", message: "User already registered" });
    expect(await run("a@x.io")).toEqual({ kind: "error", message: "network" });
    expect((await run("a@x.io")).kind).toBe("check-email");
  });
  it("duplicate submit while pending makes one request", async () => {
    let done!: (v: any) => void;
    const fn = vi.fn(() => new Promise<any>((r) => { done = r; }));
    const run = createSignUp(fn);
    const p = run("a@x.io");
    expect((await run("a@x.io")).kind).toBe("busy");
    done({ data: { session: null }, error: null }); await p;
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe("sign-out", () => {
  it("success → ok", async () => {
    expect(await createSignOut(async () => ({ error: null }))()).toEqual({ kind: "ok" });
  });
  it("failure is reported, not success; retry after failure succeeds", async () => {
    const fn = vi.fn().mockResolvedValueOnce({ error: { message: "offline" } }).mockResolvedValueOnce({ error: null });
    const run = createSignOut(fn);
    expect(await run()).toEqual({ kind: "error", message: "offline" });
    expect(await run()).toEqual({ kind: "ok" });
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("duplicate clicks while pending send one request", async () => {
    let done!: (v: any) => void;
    const fn = vi.fn(() => new Promise<any>((r) => { done = r; }));
    const run = createSignOut(fn);
    const p = run();
    expect((await run()).kind).toBe("busy");
    done({ error: null }); expect((await p).kind).toBe("ok");
    expect(fn).toHaveBeenCalledOnce();
  });
});
