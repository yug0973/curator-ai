import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Profile } from "../types/index.js";
import { RadarChartComponent } from "../components/RadarChartComponent.js";
import { ArrowRight } from "lucide-react";

interface IdentityPageProps {
  storedProfile?: Profile | null;
}

export const IdentityPage: React.FC<IdentityPageProps> = ({ storedProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const profile: Profile | null = (location.state as { profile?: Profile })?.profile || storedProfile || null;

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <h3 className="text-[20px] font-semibold text-neutral-900 mb-3">No profile found</h3>
          <p className="text-[14px] text-neutral-500 mb-6">Complete onboarding to view your identity map.</p>
          <button onClick={() => navigate("/onboarding")}
            className="px-6 h-11 bg-neutral-900 hover:bg-neutral-800 text-white text-[14px] font-medium rounded-lg transition-colors">
            Go to onboarding
          </button>
        </div>
      </div>
    );
  }

  const { aspirationalTraits, behaviorTraits, gapTheme, radarScores } = profile;

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative max-w-6xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 h-6 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Identity gap analysis
          </div>
          <h1 className="text-[40px] font-semibold tracking-[-0.03em] text-neutral-900 mb-3">
            Your identity map
          </h1>
          <p className="text-[15px] text-neutral-500 max-w-xl">
            The gap between your current patterns and aspirational self, visualized.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Radar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="lg:col-span-7 border border-neutral-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-neutral-900">Dimensions radar</h2>
              <span className="text-[12px] text-neutral-400">0 – 100 scale</span>
            </div>
            <p className="text-[13px] text-neutral-500 mb-4">Current vs. aspirational across 5 dimensions</p>
            <RadarChartComponent radarScores={radarScores} />
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col gap-4">

            {/* Gap theme */}
            <div className="border border-neutral-900 rounded-xl p-6 bg-neutral-900 text-white">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">Primary focus area</p>
              <h3 className="text-[32px] font-semibold tracking-[-0.02em] mb-2">{gapTheme}</h3>
              <p className="text-[13px] text-neutral-400 leading-relaxed">
                Your biggest growth opportunity. Resources will be curated to bridge this exact gap.
              </p>
            </div>

            {/* Current traits */}
            <div className="border border-neutral-200 rounded-xl p-6">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-4">Current behavior traits</p>
              <div className="flex flex-wrap gap-2">
                {behaviorTraits.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full border border-neutral-200 text-[12px] text-neutral-600 bg-neutral-50">{t}</span>
                ))}
              </div>
            </div>

            {/* Aspirational traits */}
            <div className="border border-neutral-200 rounded-xl p-6">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-4">Aspirational identity traits</p>
              <div className="flex flex-wrap gap-2">
                {aspirationalTraits.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full border border-neutral-900 text-[12px] text-neutral-900 font-medium">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate(`/recommendations?gapTheme=${encodeURIComponent(gapTheme)}`, { state: { gapTheme, profile } })}
            className="group inline-flex items-center gap-2 h-11 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-[14px] font-medium rounded-lg transition-colors"
          >
            View curated resources
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
