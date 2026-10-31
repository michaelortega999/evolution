import { describe, it, expect } from "vitest";
import { currentNavKey } from "./nav-current";
const routes = ["/", "/calendar", "/wealth", "/settings"];
const keys = ["ai-workflow", "evo", ...routes];
const currentCount = (p: string, s: string) => keys.filter((k) => k === currentNavKey(p, s, routes)).length;
describe("nav current item", () => {
  it("Home only without a section", () => {
    expect(currentNavKey("/", "", routes)).toBe("/");
    expect(currentCount("/", "")).toBe(1);
  });
  it("AI Workflow, not Home", () => {
    expect(currentNavKey("/", "?section=ai-workflow", routes)).toBe("ai-workflow");
    expect(currentCount("/", "?section=ai-workflow")).toBe(1);
  });
  it("Evo Planner for evo and alfred", () => {
    expect(currentNavKey("/", "?section=evo", routes)).toBe("evo");
    expect(currentNavKey("/", "?section=alfred&tool=x", routes)).toBe("evo");
    expect(currentCount("/", "?section=evo")).toBe(1);
  });
  it("normal route", () => {
    expect(currentNavKey("/wealth", "", routes)).toBe("/wealth");
  });
});
