import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Lightbulb, History, UserCircle2, Trophy, BookOpen, Sparkles } from "lucide-react";

interface HeaderProps {
  alignmentScore?: number | null;
}

const APP_ROUTES = new Set(["/onboarding", "/identity", "/recommendations", "/profile", "/history", "/insights", "/challenges", "/blog"]);

export const Header: React.FC<HeaderProps> = ({ alignmentScore }) => {
  const location = useLocation();
  if (!APP_ROUTES.has(location.pathname)) return null;

  const navItems = [
    { to: "/recommendations", icon: Sparkles, label: "Feed" },
    { to: "/identity", icon: Trophy, label: "Identity Map" },
    { to: "/challenges", icon: Trophy, label: "Challenges" },
    { to: "/blog",  icon: BookOpen, label: "Blog"  },
    { to: "/insights", icon: Lightbulb, label: "Insights" },
    { to: "/history",  icon: History,   label: "History"  },
    { to: "/profile",  icon: UserCircle2, label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200/70 transition-all">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link to="/identity" className="flex items-center gap-2 group">
          <span className="text-[18px] font-bold tracking-tight text-neutral-900 group-hover:text-neutral-600 transition-colors">
            Peak
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          {alignmentScore != null && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50/80 text-emerald-800 mr-2 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[12px] font-semibold">{alignmentScore}% aligned</span>
            </div>
          )}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} title={label}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                    active 
                      ? "bg-neutral-900 text-white shadow-xs" 
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80"
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

