import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
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
        options: { emailRedirectTo: `${window.location.origin}/`, data: { name: nameRef.current } },
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
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = begin();
    if (!id) return;
    const submitted = email;
    try {
      if (mode === "signup") {
        const r = await signUpOnce(submitted);
        if (!live(id)) return;
        if (r.kind === "error") throw new Error(r.message);
        if (r.kind === "signed-in") navigate({ to: "/" });
        else if (r.kind === "check-email") setCheckEmail(submitted);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: submitted, password });
        if (!live(id)) return;
        if (error) throw error;
        navigate({ to: "/" });
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
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (!live(id)) return;
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch (err) {
      if (live(id)) toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      end(id);
    }
  };

  if (checkEmail)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="hud-card p-8 w-full max-w-md flex flex-col gap-4 text-center" role="status">
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="hud-card p-8 w-full max-w-md flex flex-col gap-5">
        <div className="text-center">
          <div className="hud-label text-primary hud-glow text-lg">EVOLUTION</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-1">
            {mode === "signin" ? "Access your operating system" : "Create your account"}
          </div>
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

        <Link to="/" className="text-center hud-label text-[9px] text-muted-foreground hover:text-primary">
          ← Back
        </Link>
      </div>
    </div>
  );
}
