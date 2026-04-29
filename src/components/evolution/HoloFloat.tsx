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
  spin?: boolean;
}

export function HoloFloat({ src, alt = "", width, height, className = "", spin = false }: Props) {
  return (
    <div
      className={`holo-float-wrap ${className}`}
      style={{ width, height, perspective: spin ? "800px" : undefined }}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`holo-float-img ${spin ? "holo-spin-y" : ""}`}
      />
      <div className="holo-float-base" />
    </div>
  );
}
