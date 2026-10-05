/** Handle a phone UI sign-out request through the existing parent authentication client. */
export function createPhoneSignOutHandler(options: {
  origin: string;
  getFrame: () => Window | null;
  getOwner: () => string | null;
  flush: () => void;
  signOut: () => Promise<{ error: unknown }>;
}) {
  let pending = false;
  return async (event: MessageEvent): Promise<void> => {
    const frame = options.getFrame();
    const message = event.data;
    if (!frame || event.source !== frame || event.origin !== options.origin ||
        !message || message.type !== "evo:sign-out-request" ||
        typeof message.requestId !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(message.requestId) || pending) return;
    const owner = options.getOwner();
    pending = true;
    let ok = false;
    try {
      options.flush(); // preserve the requesting account's latest phone edits before auth changes
      if (options.getFrame() !== frame || options.getOwner() !== owner) return;
      const result = await options.signOut();
      ok = !result.error;
    } catch { ok = false; }
    finally { pending = false; }
    // Auth lifecycle may already have replaced the frame. Never send an old result into a new session.
    if (options.getFrame() !== frame || options.getOwner() !== owner) return;
    try {
      frame.postMessage({ type: "evo:sign-out-result", requestId: message.requestId, ok,
        message: ok ? undefined : "Couldn't sign out. Please try again." }, options.origin);
    } catch { /* the requesting frame may have closed */ }
  };
}
