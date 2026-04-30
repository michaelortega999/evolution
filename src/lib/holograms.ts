import bonsaiImg from "@/assets/bonsai.png";
import brainImg from "@/assets/brain.png";
import earthImg from "@/assets/earth.png";
import jarvisImg from "@/assets/jarvis.png";

export type HologramKey = "bonsai" | "brain" | "earth" | "jarvis";

export const HOLOGRAMS: { key: HologramKey; label: string; src: string; tagline: string }[] = [
  { key: "earth",  label: "Earth",  src: earthImg,  tagline: "Your world is what you build." },
  { key: "brain",  label: "Brain",  src: brainImg,  tagline: "Your mind shapes reality." },
  { key: "bonsai", label: "Bonsai", src: bonsaiImg, tagline: "Growth requires patience." },
  { key: "jarvis", label: "Jarvis", src: jarvisImg, tagline: "Just A Rather Very Intelligent System." },
];

export function hologramSrc(key: HologramKey | undefined): string {
  return (HOLOGRAMS.find((h) => h.key === key) ?? HOLOGRAMS[2]).src;
}
