// Pure three-way merge helpers shared by cloud sync (evolution-data) and the phone bridge.
// No imports: safe to use from tests that mock evolution-data.

export const sameJSON = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const isIdArray = (v: unknown): v is { id: unknown }[] =>
  Array.isArray(v) && v.length > 0 && v.every((x) => x && typeof x === "object" && "id" in (x as object));
export const isPlainObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

type Opts = { maxDepth: number; collisionGuard: boolean };

/** Give a colliding local record a fresh id that exists on neither side. */
function freshId(id: unknown, taken: Set<string>): unknown {
  if (typeof id === "number") {
    let n = Math.max(id, ...[...taken].map(Number).filter(Number.isFinite)) + 1;
    while (taken.has(String(n))) n++;
    return n;
  }
  let i = 2;
  while (taken.has(`${id}~${i}`)) i++;
  return `${id}~${i}`;
}

function mergeById(b: unknown[], l: unknown[], r: unknown[], o: Opts): unknown[] {
  const key = (x: unknown) => String((x as { id: unknown }).id);
  const B = new Map(b.map((x) => [key(x), x])), L = new Map(l.map((x) => [key(x), x])), R = new Map(r.map((x) => [key(x), x]));
  const order = [...r.map(key), ...l.map(key).filter((k) => !R.has(k))];
  const taken = new Set([...B.keys(), ...L.keys(), ...R.keys()]);
  const out: unknown[] = [];
  const extra: unknown[] = [];
  for (const k of order) {
    const lb = B.get(k), ll = L.get(k), lr = R.get(k);
    if (ll !== undefined && lr !== undefined) {
      if (lb === undefined && o.collisionGuard && !sameJSON(ll, lr) && (typeof (ll as any).id === "number" || typeof (ll as any).id === "string")) {
        // Two clients created different records with the same id: keep both.
        const id = freshId((ll as any).id, taken); taken.add(String(id));
        out.push(lr); extra.push({ ...(ll as object), id });
      } else if (lb !== undefined && sameJSON(ll, lb)) out.push(lr);
      else if (lb !== undefined && sameJSON(lr, lb)) out.push(ll);
      else if (lb !== undefined && o.maxDepth > 0 && isPlainObj(ll) && isPlainObj(lr)) out.push(mergeValue(lb, ll, lr, 0, o));
      else out.push(ll);
    }
    else if (ll !== undefined) { if (lb === undefined || !sameJSON(ll, lb)) out.push(ll); }
    else if (lr !== undefined) { if (lb === undefined || !sameJSON(lr, lb)) out.push(lr); }
  }
  return [...out, ...extra];
}

export function mergeValue(b: unknown, l: unknown, r: unknown, depth: number, o: Opts = { maxDepth: 2, collisionGuard: false }): unknown {
  if (sameJSON(l, b)) return r;
  if (sameJSON(r, b)) return l;
  const arr = (x: unknown) => (Array.isArray(x) ? x : []);
  if ((isIdArray(l) || isIdArray(r) || isIdArray(b)) && [b, l, r].every((x) => x === undefined || Array.isArray(x)))
    return mergeById(arr(b), arr(l), arr(r), o);
  if (depth < o.maxDepth && isPlainObj(l) && isPlainObj(r)) {
    const bo = isPlainObj(b) ? b : {};
    const out: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(r), ...Object.keys(l)])) {
      const v = mergeValue(bo[k], l[k], r[k], depth + 1, o);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return l; // true conflict on a scalar → this device's latest edit
}

/** Deep, per-domain/per-record merge for raw phone data (unknown fields kept, id collisions kept apart). */
export function mergePhoneData(b: unknown, l: unknown, r: unknown): Record<string, unknown> | undefined {
  if (l === undefined && r === undefined) return undefined;
  if (l === undefined) return r as Record<string, unknown>;
  if (r === undefined) return l as Record<string, unknown>;
  return mergeValue(b, l, r, 0, { maxDepth: 32, collisionGuard: true }) as Record<string, unknown>;
}

/**
 * Advance a merge base only where the running phone already holds the merged value:
 * matching parts take the phone value; differing parts keep the old base.
 */
export function advanceBase(base: unknown, held: unknown, merged: unknown): unknown {
  if (sameJSON(held, merged)) return held;
  if ((isIdArray(held) || isIdArray(merged)) && Array.isArray(held) && (merged === undefined || Array.isArray(merged))) {
    const key = (x: unknown) => String((x as { id: unknown }).id);
    const M = new Map((merged ?? []).map((x: unknown) => [key(x), x]));
    const B = new Map((Array.isArray(base) ? base : []).filter((x) => x && typeof x === "object" && "id" in x).map((x: unknown) => [key(x), x]));
    const out: unknown[] = [];
    for (const h of held) {
      const k = key(h), m = M.get(k), bb = B.get(k);
      if (m !== undefined && sameJSON(m, h)) out.push(h);
      else if (bb !== undefined) out.push(bb);
    }
    return out;
  }
  if (isPlainObj(held) && isPlainObj(merged)) {
    const bo = isPlainObj(base) ? base : {};
    const out: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(held), ...Object.keys(merged)])) {
      if (!(k in held)) { if (k in bo) out[k] = bo[k]; continue; }
      const v = advanceBase(bo[k], held[k], merged[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return base;
}
