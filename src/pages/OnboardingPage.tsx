import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Profile } from "../types/index.js";
import { submitOnboarding, setSessionId } from "../services/api.js";
import { ArrowRight, Loader2 } from "lucide-react";

interface OnboardingPageProps {
  onProfileReceived?: (profile: Profile) => void;
}

const GOAL_SUGGESTIONS = [
  "Become a disciplined engineer",
  "Build a consistent fitness routine",
  "Learn AI & machine learning",
  "Grow as a leader at work",
  "Start and ship my own product",
  "Read more, scroll less",
];

const BLOCKER_SUGGESTIONS = [
  "Procrastination",
  "Too many distractions",
  "No clear direction",
  "Lack of time",
  "Overthinking, never starting",
  "Low energy & motivation",
];

const EXPERIENCE_SUGGESTIONS = [
  "Complete beginner",
  "Some exposure, still learning",
  "Intermediate with gaps",
  "Advanced, refining skills",
  "Expert in most areas",
];

const LEARNING_SUGGESTIONS = [
  "Video tutorials & courses",
  "Books & long-form reading",
  "Hands-on projects",
  "Podcasts & audio content",
  "Mentorship & community",
  "Articles & documentation",
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onProfileReceived }) => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [blocker, setBlocker] = useState("");
  const [experience, setExperience] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    // Only auto-redirect if NOT explicitly resetting onboarding
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "true") {
      try {
        localStorage.removeItem("peak_profile");
        localStorage.removeItem("peak_session_id");
        localStorage.removeItem("peak_alignment_score");
      } catch {}
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || !blocker.trim() || !experience.trim() || !learningStyle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await submitOnboarding({ 
        goal: goal.trim(), 
        blocker: blocker.trim(),
        experience: experience.trim(),
        learningStyle: learningStyle.trim(),
      } as any);
      setSessionId(res.sessionId);
      try { localStorage.setItem("peak_session_id", res.sessionId); } catch {}
      if (onProfileReceived) onProfileReceived(res.profile);
      navigate("/identity", { state: { profile: res.profile } });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      {/* Blueprint grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-xl"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 h-6 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 tracking-wide uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            4 questions · 90 seconds
          </div>
          <h1 className="text-[34px] font-semibold tracking-[-0.025em] text-neutral-900 leading-[1.15] mb-3">
            Let's map your identity
          </h1>
          <p className="text-[15px] text-neutral-500 leading-relaxed">
            Answer four quick questions and Peak will build your personalized growth profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1 */}
          <div>
            <label className="block text-[13px] font-semibold text-neutral-900 mb-1">
              1 — What's your main goal?
            </label>
            <p className="text-[12px] text-neutral-400 mb-3">Who do you want to become?</p>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. I want to become a disciplined engineer who ships products consistently"
              rows={2}
              className="w-full px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all resize-none leading-relaxed"
            />
            {/* Suggestion bubbles */}
            <div className="flex flex-wrap gap-2 mt-3">
              {GOAL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setGoal(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                    goal === s
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <label className="block text-[13px] font-semibold text-neutral-900 mb-1">
              2 — What's your biggest blocker?
            </label>
            <p className="text-[12px] text-neutral-400 mb-3">What's holding you back right now?</p>
            <textarea
              value={blocker}
              onChange={(e) => setBlocker(e.target.value)}
              placeholder="e.g. Procrastination and endless scrolling on my phone"
              rows={2}
              className="w-full px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all resize-none leading-relaxed"
            />
            {/* Suggestion bubbles */}
            <div className="flex flex-wrap gap-2 mt-3">
              {BLOCKER_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setBlocker(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                    blocker === s
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3 */}
          <div>
            <label className="block text-[13px] font-semibold text-neutral-900 mb-1">
              3 — What's your current skill level?
            </label>
            <p className="text-[12px] text-neutral-400 mb-3">Where are you starting from?</p>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setExperience(s)}
                  className={`px-3 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                    experience === s
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4 */}
          <div>
            <label className="block text-[13px] font-semibold text-neutral-900 mb-1">
              4 — How do you prefer to learn?
            </label>
            <p className="text-[12px] text-neutral-400 mb-3">Pick your favorite learning format</p>
            <div className="flex flex-wrap gap-2">
              {LEARNING_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setLearningStyle(s)}
                  className={`px-3 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                    learningStyle === s
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!goal.trim() || !blocker.trim() || !experience.trim() || !learningStyle.trim() || loading}
            className="group w-full h-12 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-white text-[14px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building your profile…
              </>
            ) : (
              <>
                Build my growth profile
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
