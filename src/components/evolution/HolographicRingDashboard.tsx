import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Aperture, Orbit } from "lucide-react";
import { hologramSrc } from "@/lib/holograms";
import { useEvolutionData } from "@/lib/evolution-data";
import ringReference from "@/assets/holographic-ring-layout.jpeg";

type RingCards = {
  fitness: ReactNode;
  wealth: ReactNode;
  business: ReactNode;
  nutrition: ReactNode;
  investing: ReactNode;
  journal: ReactNode;
  calendar: ReactNode;
  hobby: ReactNode;
};

/**
 * A live reconstruction of the Holographic Ring reference. The supplied art is
 * deliberately kept underneath as a low-opacity alignment guide, while every
 * foreground panel is an existing, working Evolution OS component.
 */
export function HolographicRingDashboard({ cards }: { cards: RingCards }) {
  const { data } = useEvolutionData();
  return <section className="ring-home" aria-label="Holographic Ring dashboard">
    <img className="ring-home-reference" src={ringReference} alt="" aria-hidden="true" draggable={false} />
    <div className="ring-home-grid">
      <div className="ring-home-slot ring-fitness">{cards.fitness}</div>
      <div className="ring-home-slot ring-wealth">{cards.wealth}</div>
      <div className="ring-home-slot ring-business">{cards.business}</div>
      <div className="ring-home-slot ring-nutrition">{cards.nutrition}</div>
      <Link to="/" className="ring-home-core" aria-label="Evolution OS home">
        <span className="ring-home-core-orbit"><Orbit /></span>
        <span className="ring-home-core-orbit ring-home-core-orbit--inner"><Aperture /></span>
        <img src={hologramSrc(data.profile.hologram)} alt="" draggable={false} />
        <strong>Evolution Co</strong>
        <small>Life · Experience · Growth</small>
      </Link>
      <div className="ring-home-slot ring-hobby">{cards.hobby}</div>
      <div className="ring-home-slot ring-investing">{cards.investing}</div>
      <div className="ring-home-slot ring-journal">{cards.journal}</div>
      <div className="ring-home-slot ring-calendar">{cards.calendar}</div>
    </div>
  </section>;
}
