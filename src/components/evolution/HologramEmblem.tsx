/**
 * HologramEmblem — wraps the Three.js Hologram3D scene so existing call sites
 * (Onboarding, Dashboard, Sidebar, Picker) keep working with the same
 * `kind` + `size` props.
 */
import type { HologramKey } from "@/lib/holograms";
import { Hologram3D } from "./Hologram3D";

interface Props {
  kind: HologramKey;
  size?: number;
}

export function HologramEmblem({ kind, size = 192 }: Props) {
  return <Hologram3D kind={kind} size={size} />;
}
