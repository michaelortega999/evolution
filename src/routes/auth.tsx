import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase, setRememberMe, isVerifiedRecoverySession } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createSignUp } from "@/lib/auth-actions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Evolution" },
      { property: "og:title", content: "Sign in — Evolution" },
      { property: "og:description", content: "Sign in to your Evolution life operating system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "description", content: "Sign in to your Evolution life operating system." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const accessDestination = () =>
    new URLSearchParams(window.location.search).get("next") === "access" ? "/?section=access&step=checkout" : "/";
  const finishSignIn = () => window.location.assign(accessDestination());
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [recovery, setRecovery] = useState<"request" | "sent" | "reset" | "done" | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const recoveryVerified = useRef(false);
  const recoveryActive = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRemember] = useState(false);
  const passwordRef = useRef("");
  const nameRef = useRef("");
  passwordRef.current = password;
  nameRef.current = name;
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [signUpOnce] = useState(() =>
    createSignUp((addr: string) =>
      supabase.auth.signUp({
        email: addr,
        password: passwordRef.current,
        options: {
          emailRedirectTo: `${window.location.origin}${accessDestination()}`,
          data: { name: nameRef.current },
        },
      }),
    ),
  );

  // One request at a time; a request id lets only the owner release loading, and unmount/Back drops stale completions.
  const reqRef = useRef(0);
  const busyRef = useRef(false);
  useEffect(
    () => () => {
      reqRef.current++;
      busyRef.current = false;
    },
    [],
  );
  const begin = () => {
    if (busyRef.current) return 0;
    busyRef.current = true;
    setLoading(true);
    return ++reqRef.current;
  };
  const live = (id: number) => id === reqRef.current;
  const end = (id: number) => {
    if (live(id)) {
      busyRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    // A URL flag is navigation context only, NEVER proof of recovery.
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup" && params.get("next") === "access") setMode("signup");
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const returning = params.get("recovery") === "1" || hash.get("type") === "recovery";
    if (returning) {
      recoveryActive.current = true;
      setRecovery("request");
      if (hash.has("error")) setRecoveryError("This recovery link is invalid or expired. Request a new email below.");
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        recoveryVerified.current = true;
        recoveryActive.current = true;
        setRecovery("reset");
        setRecoveryError("");
        setPassword("");
        setConfirmation("");
        // Remove tokens and callback flags from the visible URL/history.
        window.history.replaceState(window.history.state, "", "/auth?recovery=1");
      } else if ((event === "SIGNED_OUT" || event === "SIGNED_IN") && recoveryVerified.current) {
        recoveryVerified.current = false;
        setRecovery("request");
        setRecoveryError("Your recovery session ended. Request a new recovery email.");
      }
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error && returning) setRecoveryError("Unable to verify this link. Request a new recovery email.");
        if (isVerifiedRecoverySession(data.session)) {
          recoveryVerified.current = true;
          recoveryActive.current = true;
          setRecovery("reset");
          setRecoveryError("");
          setPassword("");
          setConfirmation("");
          window.history.replaceState(window.history.state, "", "/auth?recovery=1");
        } else if (data.session && !recoveryActive.current) finishSignIn();
      })
      .catch(() => {
        if (active && returning) setRecoveryError("Unable to verify this link. Request a new recovery email.");
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  const openRecovery = () => {
    recoveryActive.current = true;
    setRecovery("request");
    setRecoveryEmail(email.trim());
    setPassword("");
    setConfirmation("");
    setCode("");
    setRecoveryError("");
  };
  const closeRecovery = async () => {
    const id = begin();
    if (!id) return;
    try {
      if (recoveryVerified.current) {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) throw error;
      }
      if (!live(id)) return;
      recoveryVerified.current = false;
      recoveryActive.current = false;
      setRecovery(null);
      setRecoveryError("");
      setPassword("");
      setConfirmation("");
      setCode("");
      setMode("signin");
      window.history.replaceState(window.history.state, "", "/auth");
    } catch {
      if (live(id)) setRecoveryError("Could not close the recovery session. Please try again.");
    } finally {
      end(id);
    }
  };
  const sendRecovery = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (Date.now() < resendAt) return;
    const id = begin();
    if (!id) return;
    const address = recoveryEmail.trim();
    setRecoveryError("");
    try {
      // Recovery is temporary and uses the existing account only: no signUp/signInWithOtp.
      setRememberMe(false);
      const { error } = await supabase.auth.resetPasswordForEmail(address, {
        redirectTo: `${window.location.origin}/auth?recovery=1`,
      });
      if (!live(id)) return;
      if (error) throw error;
      setRecoveryEmail(address);
      setCode("");
      setRecovery("sent");
      setNow(Date.now());
      setResendAt(Date.now() + 60000);
    } catch {
      if (live(id))
        setRecoveryError(
          "We could not process that request. Please wait a minute and try again. No account details are disclosed.",
        );
    } finally {
      end(id);
    }
  };
  const verifyRecovery = async (event: React.FormEvent) => {
    event.preventDefault();
    const id = begin();
    if (!id) return;
    setRecoveryError("");
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: recoveryEmail,
        token: code.trim(),
        type: "recovery",
      });
      if (!live(id)) return;
      if (error || !data.session) throw new Error("Invalid recovery code");
      recoveryVerified.current = true;
      setRecovery("reset");
      setPassword("");
      setConfirmation("");
      setCode("");
    } catch {
      if (live(id))
        setRecoveryError(
          "That code is invalid or expired. Use the newest code from your recovery email, or request another email.",
        );
    } finally {
      end(id);
    }
  };
  const saveRecoveryPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recoveryVerified.current) {
      setRecovery("request");
      return;
    }
    if (password !== confirmation) {
      setRecoveryError("Passwords do not match.");
      return;
    }
    const id = begin();
    if (!id) return;
    setRecoveryError("");
    try {
      const current = await supabase.auth.getSession();
      if (!live(id)) return;
      if (current.error || !isVerifiedRecoverySession(current.data.session)) {
        recoveryVerified.current = false;
        setRecovery("request");
        setRecoveryError("Your verified recovery session ended. Request a new recovery email.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (!live(id)) return;
      if (error) {
        setRecoveryError(
          "Password could not be updated. Use a different, stronger password, or request a fresh recovery email if your session expired.",
        );
        return;
      }
      setPassword("");
      setConfirmation("");
      // Do not retain an authenticated recovery session on a shared device.
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (!live(id)) return;
      recoveryVerified.current = !!signOutError;
      setRecovery("done");
      setRecoveryError(
        signOutError
          ? "Your password was updated, but this recovery session could not be closed. Use Back to sign in to retry closing it."
          : "",
      );
    } catch {
      if (live(id))
        setRecoveryError(
          "Connection interrupted. Your password may have changed. Try signing in, or request a fresh recovery email.",
        );
    } finally {
      end(id);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = begin();
    if (!id) return;
    const submitted = email;
    try {
      setRememberMe(rememberMe);
      if (mode === "signup") {
        const r = await signUpOnce(submitted);
        if (!live(id)) return;
        if (r.kind === "error") throw new Error(r.message);
        if (r.kind === "signed-in") finishSignIn();
        else if (r.kind === "check-email") setCheckEmail(submitted);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: submitted, password });
        if (!live(id)) return;
        if (error) throw error;
        finishSignIn();
      }
    } catch (err) {
      if (live(id)) toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      end(id);
    }
  };

  const handleGoogle = async () => {
    const id = begin();
    if (!id) return;
    try {
      setRememberMe(rememberMe);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}${accessDestination()}`,
      });
      if (!live(id)) return;
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      finishSignIn();
    } catch (err) {
      if (live(id)) toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      end(id);
    }
  };

  if (recovery)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="hud-card hud-scan p-5 sm:p-6 w-full max-w-md flex flex-col gap-5">
          <div className="text-center">
            <div className="hud-label text-primary hud-glow text-lg">EVOLUTION OS</div>
            <h1 className="mt-3 text-xl font-semibold">
              {recovery === "reset"
                ? "Choose a new password"
                : recovery === "done"
                  ? "Password updated"
                  : "Reset your password"}
            </h1>
          </div>
          {recoveryError && (
            <p role="alert" className="text-sm text-destructive">
              {recoveryError}
            </p>
          )}
          {recovery === "request" && (
            <>
              <p className="text-sm text-muted-foreground">
                Use the email on your Evolution account. Gmail and other email addresses are supported.
              </p>
              <form onSubmit={sendRecovery} className="flex flex-col gap-4">
                <label className="text-sm">
                  Account email
                  <Input
                    autoComplete="email"
                    type="email"
                    required
                    value={recoveryEmail}
                    disabled={loading}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="mt-2"
                  />
                </label>
                <Button disabled={loading || now < resendAt} type="submit">
                  {loading
                    ? "Requesting…"
                    : now < resendAt
                      ? `Try again in ${Math.ceil((resendAt - now) / 1000)}s`
                      : "Send recovery email"}
                </Button>
              </form>
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                <strong className="block text-foreground mb-1">Phone verification is not available</strong>
                SMS recovery must be enabled and linked to your existing account first. Use email recovery here.
              </div>
              <p className="text-xs text-muted-foreground">
                If you joined with Google, go back and choose Continue with Google. Your Google password is managed by
                Google.
              </p>
            </>
          )}
          {recovery === "sent" && (
            <>
              <p role="status" className="text-sm text-muted-foreground">
                If an eligible account exists for <span className="break-all text-foreground">{recoveryEmail}</span>, a
                recovery email will arrive. Check your inbox and spam folder, then open its secure reset link.
              </p>
              <details className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm">My email contains a verification code</summary>
                <p className="text-xs text-muted-foreground my-3">
                  Enter the code exactly as shown in your recovery email. Six-digit codes require provider
                  configuration; if your email has only a link, use that link instead.
                </p>
                <form onSubmit={verifyRecovery} className="flex flex-col gap-3">
                  <label className="text-sm">
                    Recovery code
                    <Input
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6,10}"
                      minLength={6}
                      maxLength={10}
                      required
                      value={code}
                      disabled={loading}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="mt-2 tracking-[0.25em]"
                    />
                  </label>
                  <Button disabled={loading} type="submit">
                    {loading ? "Verifying…" : "Verify code"}
                  </Button>
                </form>
              </details>
              <Button
                variant="outline"
                type="button"
                onClick={() => sendRecovery()}
                disabled={loading || now < resendAt}
              >
                {now < resendAt
                  ? `Resend in ${Math.max(0, Math.ceil((resendAt - now) / 1000))}s`
                  : "Resend recovery email"}
              </Button>
              <button
                type="button"
                disabled={loading}
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  setRecovery("request");
                  setRecoveryError("");
                  setCode("");
                }}
              >
                Use a different email
              </button>
            </>
          )}
          {recovery === "reset" && (
            <form onSubmit={saveRecoveryPassword} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Your recovery was verified. Choose a unique password with at least 8 characters.
              </p>
              <label className="text-sm">
                New password
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                />
              </label>
              <label className="text-sm">
                Confirm new password
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmation}
                  disabled={loading}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="mt-2"
                />
              </label>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
          {recovery === "done" && (
            <p role="status" className="text-sm text-muted-foreground">
              Your password has been updated. Return to sign in with your new password.
            </p>
          )}
          <Button type="button" variant="ghost" disabled={loading} onClick={closeRecovery}>
            ← Back to sign in
          </Button>
        </div>
      </div>
    );

  if (checkEmail)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="hud-card hud-scan p-5 sm:p-6 w-full max-w-md flex flex-col gap-4 text-center" role="status">
          <div className="hud-label text-primary hud-glow text-lg">CHECK YOUR EMAIL</div>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <span className="text-foreground break-all">{checkEmail}</span>. Open it to
            finish creating your account, then sign in.
          </p>
          <Button
            type="button"
            variant="outline"
            className="hud-label text-xs"
            onClick={() => {
              setCheckEmail(null);
              setMode("signin");
              setPassword("");
            }}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="hud-card hud-scan p-5 sm:p-6 w-full max-w-md flex flex-col gap-5">
        <div className="text-center">
          <div className="hud-label text-primary hud-glow text-lg">EVOLUTION OS</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-1">
            {mode === "signin" ? "Access your operating system" : "Create your account"}
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              disabled={loading}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-cyan-400"
              aria-describedby="remember-help"
            />
            <span>Remember Me</span>
          </label>
          <p id="remember-help" className="mt-2 text-xs text-muted-foreground">
            {rememberMe
              ? "Keep me signed in on this trusted device until I sign out or my session expires."
              : "Use a temporary session in this tab. Browser session restore may keep it open."}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading} className="hud-label text-xs">
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="hud-label text-[9px] text-muted-foreground">OR</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-3">
          {mode === "signup" && (
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Name</span>
              <Input disabled={loading} value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </label>
          )}
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Email</span>
            <Input
              disabled={loading}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Password</span>
            <Input
              disabled={loading}
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </label>
          <Button type="submit" disabled={loading} className="hud-label text-xs mt-2">
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {mode === "signin" && (
          <button
            type="button"
            disabled={loading}
            onClick={openRecovery}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        )}

        <div className="text-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="hud-label text-[10px] text-primary hover:underline"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <a href="/?section=access" className="text-center text-sm text-primary hover:underline">
          Purchase & website access
        </a>
        <Link to="/" className="text-center hud-label text-[9px] text-muted-foreground hover:text-primary">
          ← Back
        </Link>
      </div>
    </div>
  );
}
