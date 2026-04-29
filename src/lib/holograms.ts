import bonsaiImg from "@/assets/bonsai.png";

export type HologramKey = "bonsai";

export const HOLOGRAMS: { key: HologramKey; label: string; src: string; tagline: string }[] = [
  { key: "bonsai", label: "Bonsai", src: bonsaiImg, tagline: "Growth requires patience." },
];

export function hologramSrc(_key: HologramKey | undefined): string {
  return HOLOGRAMS[0].src;
}
