import { useEffect, useState } from "react";

/**
 * Phone-only experience: renders the user's finished Evolution OS mobile
 * design (public/evolution-mobile) full-screen. Desktop is untouched.
 */
export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isPhone;
}

export function MobileApp() {
  return (
    <iframe
      src="/evolution-mobile/index.html"
      title="Evolution OS"
      className="fixed inset-0 z-[1000] h-[100dvh] w-full border-0 bg-background"
      allow="autoplay"
    />
  );
}
