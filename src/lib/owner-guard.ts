/**
 * Captures the local data owner when a deferred UI action (e.g. an Undo toast) is created;
 * `run` executes the action only if the same owner is still active. Owner ids never leave this closure.
 */
export function captureOwnerGuard(getOwner: () => string | null) {
  const captured = getOwner();
  return {
    isCurrent: () => getOwner() === captured,
    run(action: () => void, onRefused?: () => void): boolean {
      if (getOwner() !== captured) {
        onRefused?.();
        return false;
      }
      action();
      return true;
    },
  };
}
