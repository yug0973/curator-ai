import React, { useEffect, useState } from "react";
// v2 — aurora mounted once, StrictMode-safe
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Profile, User } from "./types/index.js";
import { Header } from "./components/Header.js";
import { LandingPage } from "./pages/LandingPage.js";
import { OnboardingPage } from "./pages/OnboardingPage.js";
import { IdentityPage } from "./pages/IdentityPage.js";
import { RecommendationsPage } from "./pages/RecommendationsPage.js";
import { AuthPage } from "./pages/AuthPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { HistoryPage } from "./pages/HistoryPage.js";
import { InsightsPage } from "./pages/InsightsPage.js";
import { ChallengesPage } from "./pages/ChallengesPage.js";
import { BlogPage } from "./pages/BlogPage.js";
import { setAuthToken, setSessionId, clearSession } from "./services/api.js";

// Rehydrate auth token / session id saved from a previous visit, so a hard
// refresh mid-flow doesn't silently drop the user's session against the
// session-based backend (recommendations/reflection require x-session-id).
function rehydrateSession() {
  try {
    const token = localStorage.getItem("peak_token");
    if (token) {
      setAuthToken(token);
      console.log("[Peak] Restored auth token from localStorage");
    }
    const sessionId = localStorage.getItem("peak_session_id");
    if (sessionId) {
      setSessionId(sessionId);
      console.log("[Peak] Restored session ID from localStorage");
    }
  } catch {
    // localStorage unavailable (private browsing, etc.) — non-fatal
    console.warn("[Peak] localStorage unavailable, session will not persist across page reloads");
  }
}

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

interface AnimatedRoutesProps {
  storedProfile: Profile | null;
  alignmentScore: number | null;
  user: User | null;
  handleProfileReceived: (profile: Profile) => void;
  handleAlignmentUpdate: (score: number) => void;
  handleAuthSuccess: (user: User) => void;
  handleUserUpdate: (user: User) => void;
  handleLogout: () => void;
}

// Inner component so we can call useLocation() inside BrowserRouter
function AppShell() {
  const location = useLocation();
  const [storedProfile, setStoredProfile] = useState<Profile | null>(null);
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    rehydrateSession();
    try {
      const savedUser = localStorage.getItem("peak_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedProfile = localStorage.getItem("peak_profile");
      if (savedProfile) setStoredProfile(JSON.parse(savedProfile));

      const savedScore = localStorage.getItem("peak_alignment_score");
      if (savedScore) setAlignmentScore(Number(savedScore));
    } catch {
      // localStorage unavailable or corrupted — start with a clean slate
    }
  }, []);

  // Persist user state whenever it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("peak_user", JSON.stringify(user));
      } catch {
        // non-fatal
      }
    }
  }, [user]);

  // Persist profile whenever it changes
  useEffect(() => {
    if (storedProfile) {
      try {
        localStorage.setItem("peak_profile", JSON.stringify(storedProfile));
      } catch {
        // non-fatal
      }
    }
  }, [storedProfile]);

  // Persist alignment score whenever it changes
  useEffect(() => {
    if (alignmentScore !== null) {
      try {
        localStorage.setItem("peak_alignment_score", String(alignmentScore));
      } catch {
        // non-fatal
      }
    }
  }, [alignmentScore]);

  const handleAuthSuccess = (nextUser: User) => {
    setUser(nextUser);
    if (nextUser.profile) {
      setStoredProfile(nextUser.profile);
    }
    if (nextUser.alignmentScore !== undefined && nextUser.alignmentScore !== null) {
      setAlignmentScore(nextUser.alignmentScore);
    }
  };

  const handleUserUpdate = (nextUser: User) => {
    setUser(nextUser);
    // localStorage persistence is handled by useEffect
  };

  const handleProfileReceived = (profile: Profile) => {
    setStoredProfile(profile);
    setAlignmentScore(70);
    // localStorage persistence is handled by useEffect
  };

  const handleAlignmentUpdate = (score: number) => {
    setAlignmentScore(score);
    // localStorage persistence is handled by useEffect
  };

  const handleLogout = () => {
    setUser(null);
    setStoredProfile(null);
    setAlignmentScore(null);
    clearSession();
    try {
      localStorage.removeItem("peak_token");
      localStorage.removeItem("peak_user");
      localStorage.removeItem("peak_session_id");
      localStorage.removeItem("peak_profile");
      localStorage.removeItem("peak_alignment_score");
    } catch {
      // non-fatal
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 font-sans antialiased overflow-x-hidden">
      <Header alignmentScore={alignmentScore} />
      <main className="relative pb-16">
        <AnimatedRoutes
          storedProfile={storedProfile}
          alignmentScore={alignmentScore}
          user={user}
          handleProfileReceived={handleProfileReceived}
          handleAlignmentUpdate={handleAlignmentUpdate}
          handleAuthSuccess={handleAuthSuccess}
          handleUserUpdate={handleUserUpdate}
          handleLogout={handleLogout}
        />
      </main>
    </div>
  );
}

const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({
  storedProfile,
  alignmentScore,
  user,
  handleProfileReceived,
  handleAlignmentUpdate,
  handleAuthSuccess,
  handleUserUpdate,
  handleLogout,
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
          <Route
            path="/onboarding"
            element={<OnboardingPage onProfileReceived={handleProfileReceived} />}
          />
          <Route
            path="/identity"
            element={<IdentityPage storedProfile={storedProfile} />}
          />
          <Route
            path="/recommendations"
            element={
              <RecommendationsPage
                storedProfile={storedProfile}
                onAlignmentUpdate={handleAlignmentUpdate}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                storedProfile={storedProfile}
                alignmentScore={alignmentScore}
                onLogout={handleLogout}
                onUserUpdate={handleUserUpdate}
              />
            }
          />
          <Route path="/history" element={<HistoryPage user={user} />} />
          <Route path="/insights" element={<InsightsPage user={user} />} />
          <Route path="/challenges" element={<ChallengesPage user={user} gapTheme={storedProfile?.gapTheme} />} />
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
