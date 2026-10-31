/** Which nav item is the current page. Section-based pages live on "/" so Home is current only without a section. */
export type NavKey = "ai-workflow" | "evo" | string;
export function currentNavKey(pathname: string, searchStr: string, routes: string[]): NavKey | null {
  const section = new URLSearchParams(searchStr).get("section") || "";
  if (pathname === "/") {
    if (section === "ai-workflow") return "ai-workflow";
    if (section === "evo" || section === "alfred") return "evo";
    return section ? null : "/";
  }
  const hit = routes.filter((r) => r !== "/" && pathname.startsWith(r)).sort((a, b) => b.length - a.length)[0];
  return hit ?? null;
}
