import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModernLoginSignup from "../components/ui/modern-login-signup.js";
import { googleLogin, login, signup, setAuthToken } from "../services/api.js";
import { User } from "../types/index.js";

interface AuthPageProps {
  onAuthSuccess?: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processAuthResult = (res: { token: string; user: User }) => {
    setAuthToken(res.token);
    try {
      localStorage.setItem("peak_token", res.token);
      localStorage.setItem("peak_user", JSON.stringify(res.user));
      if (res.user.profile) {
        localStorage.setItem("peak_profile", JSON.stringify(res.user.profile));
      }
      if (res.user.alignmentScore) {
        localStorage.setItem("peak_alignment_score", String(res.user.alignmentScore));
      }
    } catch {
      // non-fatal
    }
    if (onAuthSuccess) onAuthSuccess(res.user);
    if (res.user.profile) {
      navigate("/identity", { state: { profile: res.user.profile } });
    } else {
      navigate("/onboarding");
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await googleLogin(credential);
      processAuthResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, pass);
      processAuthResult(res);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signup(name, email, pass);
      processAuthResult(res);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      <ModernLoginSignup
        onGoogleCredential={handleGoogleCredential}
        onLogin={handleLogin}
        onSignup={handleSignup}
        loading={loading}
        error={error}
      />
    </div>
  );
};
