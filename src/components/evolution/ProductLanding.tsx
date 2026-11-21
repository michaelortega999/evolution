/** Same-origin promotional document; never receives customer records or session tokens. */
export function ProductLanding() {
  return <iframe title="Evolution OS — product website" src="/evolution-promo/index.html?page=evolution"
    style={{ position: 'fixed', inset: 0, width: '100%', height: '100dvh', border: 0, background: '#050a10' }} />;
}
