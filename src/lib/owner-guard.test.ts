import { describe, expect, it } from "vitest";
import { captureOwnerGuard } from "./owner-guard";

describe("owner guard for deferred content actions", () => {
  it("runs while the same account is active", () => {
    let owner: string | null = "u1";
    const g = captureOwnerGuard(() => owner);
    let ran = 0;
    expect(g.run(() => ran++)).toBe(true);
    expect(ran).toBe(1);
  });
  it("refuses after a switch to another account or guest", () => {
    let owner: string | null = "u1";
    const g = captureOwnerGuard(() => owner);
    owner = "u2";
    let ran = 0, refused = 0;
    expect(g.run(() => ran++, () => refused++)).toBe(false);
    owner = "guest";
    expect(g.isCurrent()).toBe(false);
    expect(ran).toBe(0);
    expect(refused).toBe(1);
  });
});
