/** Small auth flow helpers so sign-up/sign-out outcomes are decided in one testable place. */
type AuthErr = { message?: string } | null | undefined;

export type SignUpOutcome =
  | { kind: "signed-in" }
  | { kind: "check-email"; email: string }
  | { kind: "error"; message: string }
  | { kind: "busy" };

/** Single-flight email sign-up: only a returned session counts as signed in. */
export function createSignUp(signUp: (email: string) => Promise<{ data: { session: unknown } | null; error: AuthErr }>) {
  let pending = false;
  return async (email: string): Promise<SignUpOutcome> => {
    if (pending) return { kind: "busy" };
    pending = true;
    try {
      const { data, error } = await signUp(email);
      if (error) return { kind: "error", message: error.message || "Sign-up failed. Please try again." };
      return data?.session ? { kind: "signed-in" } : { kind: "check-email", email };
    } catch (e) {
      return { kind: "error", message: e instanceof Error ? e.message : "Sign-up failed. Please try again." };
    } finally { pending = false; }
  };
}

export type SignOutOutcome = { kind: "ok" } | { kind: "error"; message: string } | { kind: "busy" };

/** Single-flight sign-out that reports the real result instead of assuming success. */
export function createSignOut(signOut: () => Promise<{ error: AuthErr }>) {
  let pending = false;
  return async (): Promise<SignOutOutcome> => {
    if (pending) return { kind: "busy" };
    pending = true;
    try {
      const { error } = await signOut();
      return error ? { kind: "error", message: error.message || "Couldn't sign out. Please try again." } : { kind: "ok" };
    } catch (e) {
      return { kind: "error", message: e instanceof Error ? e.message : "Couldn't sign out. Please try again." };
    } finally { pending = false; }
  };
}
