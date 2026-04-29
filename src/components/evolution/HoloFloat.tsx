/**
 * HoloFloat — floating holographic subject with glowing base rings.
 * Uses mix-blend-mode: screen on the image so black backgrounds disappear.
 */
interface Props {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
}

export function HoloFloat({ src, alt = "", width, height, className = "" }: Props) {
  return (
    <div
      className={`holo-float-wrap ${className}`}
      style={{ width, height }}
      aria-hidden={alt ? undefined : true}
    >
      <img src={src} alt={alt} draggable={false} className="holo-float-img" />
      <div className="holo-float-base" />
    </div>
  );
}
