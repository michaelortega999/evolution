import type { LucideIcon } from "lucide-react";

interface HoloIconProps {
  icon: LucideIcon;
}

export function HoloIcon({ icon: Icon }: HoloIconProps) {
  return (
    <div className="holo-icon" aria-hidden="true">
      <div className="holo-icon-base" />
      <div className="holo-icon-spin">
        <Icon className="holo-icon-svg h-5 w-5" />
      </div>
    </div>
  );
}
