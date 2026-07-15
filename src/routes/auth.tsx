import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Evolution" },
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="hud-card p-8 w-full max-w-md flex flex-col gap-5">
        <div className="text-center">
          <div className="hud-label text-primary hud-glow text-lg">EVOLUTION</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-1">
            {mode === "signin" ? "Access your operating system" : "Create your account"}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={loading}
          className="hud-label text-xs"
        >
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
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </label>
          )}
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Email</span>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Password</span>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </label>
          <Button type="submit" disabled={loading} className="hud-label text-xs mt-2">
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
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
