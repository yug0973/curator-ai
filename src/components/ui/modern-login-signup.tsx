import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export interface ModernLoginSignupProps {
  onGoogleCredential?: (credential: string) => void | Promise<void>;
  onLogin?: (email: string, pass: string) => void | Promise<void>;
  onSignup?: (name: string, email: string, pass: string) => void | Promise<void>;
  error?: string | null;
  loading?: boolean;
}

declare global {
  interface Window { google?: any; }
}

export default function ModernLoginSignup({ onGoogleCredential, onLogin, onSignup, error, loading }: ModernLoginSignupProps) {
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  useEffect(() => {
    const clientId = (import.meta as unknown as { env?: { VITE_GOOGLE_CLIENT_ID?: string } }).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    let attempts = 0;

    const tryRender = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            if (onGoogleCredential) onGoogleCredential(response.credential);
          },
        });
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: 320,
        });
      } else if (attempts < 40) {
        attempts += 1;
        setTimeout(tryRender, 150);
      }
    };

    tryRender();
    return () => { cancelled = true; };
  }, [onGoogleCredential]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      if (onLogin && email && password) onLogin(email, password);
    } else {
      if (onSignup && name && email && password) onSignup(name, email, password);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 h-9 px-4 text-[13px] text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 rounded-lg transition-colors bg-white cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 flex-col justify-between p-16">
        <div>
          <span className="text-white text-[15px] font-semibold tracking-[-0.01em]">Peak</span>
        </div>
        <div>
          <blockquote className="text-white text-[28px] font-semibold leading-[1.3] tracking-[-0.02em] max-w-[420px]">
            "The gap between who you are and who you want to be is where growth lives."
          </blockquote>
          <p className="text-neutral-500 text-[13px] mt-6">
            Replace doomscrolling with deliberate growth.
          </p>
        </div>
        <div className="flex gap-2">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-8 h-1 rounded-full bg-neutral-700" />
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <span className="text-neutral-900 text-[17px] font-semibold tracking-[-0.01em]">Peak</span>
          </div>

          <div className="flex border-b border-neutral-200 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`pb-2 mr-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                mode === "login" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                mode === "signup" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-900 mb-1">
            {mode === "login" ? "Welcome back" : "Get started with Peak"}
          </h1>
          <p className="text-[13px] text-neutral-500 mb-6">
            {mode === "login" ? "Sign in to access your growth dashboard." : "Create your account to save your identity map."}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Regular Sign In / Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {mode === "signup" && (
              <div>
                <label className="block text-[12px] font-medium text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-none text-[13px]"
                />
              </div>
            )}
            <div>
              <label className="block text-[12px] font-medium text-neutral-700 mb-1">Email address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-none text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-none text-[13px]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-[13px] transition-colors cursor-pointer"
            >
              {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-neutral-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase tracking-wider absolute">Or</span>
          </div>

          {/* Google button */}
          <div className="space-y-3">
            {loading ? (
              <div className="w-full h-11 rounded-lg bg-neutral-100 flex items-center justify-center text-[13px] text-neutral-500 border border-neutral-200">
                Signing you in…
              </div>
            ) : (
              <div ref={googleBtnRef} className="flex justify-center" />
            )}
          </div>

          <p className="mt-8 text-[12px] text-neutral-400 text-center leading-relaxed">
            By continuing you agree to our{" "}
            <a href="#" className="text-neutral-600 hover:text-neutral-900 underline underline-offset-2">Terms</a>
            {" "}and{" "}
            <a href="#" className="text-neutral-600 hover:text-neutral-900 underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
