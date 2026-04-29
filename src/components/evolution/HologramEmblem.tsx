/**
 * HologramEmblem — image-based holographic projection.
 * Renders the selected PNG (bonsai/brain/earth) with rotation, scanlines,
 * edge glow, projection rings, floating particles, and flicker effects.
 * Uses mix-blend-mode: screen to drop the black background of the source
 * images so only the glowing blue subject remains.
 */
import { useMemo } from "react";
import { hologramSrc, type HologramKey } from "@/lib/holograms";

interface Props {
  kind: HologramKey;
  size?: number;
}

export function HologramEmblem({ kind, size = 320 }: Props) {
  const src = hologramSrc(kind);

  // Stable particle layout per render
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        left: `${(i * 9 + 7) % 95}%`,
        delay: `${(i * 0.45) % 4}s`,
        duration: `${3 + (i % 3)}s`,
      })),
    [],
  );

  return (
    <div
      className="holo-emblem"
      style={{ width: size, height: size, background: "transparent", backgroundColor: "transparent" }}
      aria-label={`${kind} hologram`}
    >
      {/* Edge glow */}
      <div className="holo-emblem__glow" />

      {/* Rotating image */}
      <div
        className="holo-emblem__rotor"
        style={{ background: "transparent", backgroundColor: "transparent" }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="holo-emblem__img"
          style={{ mixBlendMode: "screen", display: "block" }}
        />
      </div>

      {/* Horizontal faint scan lines */}
      <div className="holo-emblem__scanlines" />

      {/* Sweeping scan bar */}
      <div className="holo-emblem__sweep" />

      {/* Projector base rings */}
      <div className="holo-emblem__base">
        <div className="holo-emblem__projection holo-emblem__projection--wide" />
        <div className="holo-emblem__projection holo-emblem__projection--mid" />
        <div className="holo-emblem__projection holo-emblem__projection--core" />
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="holo-emblem__particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
