import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, InsightsResponse } from "../types/index.js";
import { getInsights } from "../services/api.js";
import { RadarChartComponent } from "../components/RadarChartComponent.js";
import { ThumbsUp, ThumbsDown, UserCircle2, RotateCcw, ListChecks } from "lucide-react";

interface InsightsPageProps { user: User | null; }

export const InsightsPage: React.FC<InsightsPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = () => {
    if (!user) return;
    setLoading(true); setError(null);
    getInsights().then(setData).catch((e: any) => setError(e.message || "Failed to load insights.")).finally(() => setLoading(false));
  };

  useEffect(() => { fetchInsights(); }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <UserCircle2 className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-[20px] font-semibold text-neutral-900 mb-2">Not signed in</h2>
          <p className="text-[14px] text-neutral-500 mb-6">Sign in to view your insights and trajectory.</p>
          <button onClick={() => navigate("/auth")} className="px-6 h-11 bg-neutral-900 text-white text-[14px] font-medium rounded-lg hover:bg-neutral-800 transition-colors">Sign in</button>
        </div>
      </div>
    );
  }

  const stats = data ? [
    { label: "Alignment",     value: `${data.alignmentScore}%` },
    { label: "Roadmap steps", value: `${data.roadmapCompleted}/${data.roadmapTotal || 3}` },
    { label: "Resonated",     value: String(data.likedCount) },
    { label: "Didn't land",   value: String(data.dislikedCount) },
  ] : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative max-w-5xl mx-auto px-8 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 h-6 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Insights
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] text-neutral-900 mb-2">Your trajectory</h1>
          <p className="text-[15px] text-neutral-500">Patterns across your reflections and roadmap progress.</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-neutral-400 rounded-full"
                  animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
            <p className="text-[14px] text-neutral-500">Synthesizing your insights…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-24 gap-3">
            <p className="text-[14px] text-neutral-600">{error}</p>
            <button onClick={fetchInsights} className="inline-flex items-center gap-2 text-[13px] text-neutral-900 font-medium underline underline-offset-2">
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* AI narrative */}
            <div className="mb-8 border border-neutral-900 rounded-xl p-8 bg-neutral-900">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-4">Peak's take</p>
              <p className="text-[17px] text-white leading-relaxed font-medium">{data.narrative}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map(({ label, value }) => (
                <div key={label} className="border border-neutral-200 rounded-xl p-5 text-center bg-white">
                  <p className="text-[28px] font-bold text-neutral-900 mb-1">{value}</p>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Radar + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-7 border border-neutral-200 rounded-xl p-6 bg-white">
                <h3 className="text-[15px] font-semibold text-neutral-900 mb-4">Current radar</h3>
                {Object.keys(data.radarScores).length > 0
                  ? <RadarChartComponent radarScores={data.radarScores} />
                  : <p className="text-[13px] text-neutral-400 py-10 text-center">Complete onboarding to generate your radar.</p>
                }
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="lg:col-span-5 flex flex-col gap-4">
                <div className="border border-neutral-200 rounded-xl p-6 bg-white">
                  <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">Widest gap</p>
                  {data.widestGapDimension ? (
                    <>
                      <h3 className="text-[24px] font-semibold text-neutral-900 mb-2">{data.widestGapDimension}</h3>
                      <p className="text-[13px] text-neutral-500 leading-relaxed">
                        {data.widestGapValue} points between current and goal — your fastest path to a higher alignment score.
                      </p>
                    </>
                  ) : (
                    <p className="text-[13px] text-neutral-400">Complete onboarding to see your widest gap.</p>
                  )}
                </div>

                <div className="border border-neutral-200 rounded-xl p-6 bg-white">
                  <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">Most common reaction</p>
                  <div className="flex items-center gap-3">
                    {data.likedCount >= data.dislikedCount
                      ? <ThumbsUp className="w-5 h-5 text-neutral-900" />
                      : <ThumbsDown className="w-5 h-5 text-neutral-400" />
                    }
                    <div>
                      <h3 className="text-[20px] font-semibold text-neutral-900">{data.topEmotion || "—"}</h3>
                      <p className="text-[12px] text-neutral-400">{data.totalReflections} reflection{data.totalReflections === 1 ? "" : "s"} logged</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Habits */}
            {data.habits.length > 0 && (
              <div className="border border-neutral-200 rounded-xl p-6 bg-white">
                <div className="flex items-center gap-2 mb-5">
                  <ListChecks className="w-4 h-4 text-neutral-900" />
                  <h3 className="text-[15px] font-semibold text-neutral-900">Daily habits for your goal</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.habits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between gap-3 p-4 rounded-lg border border-neutral-100 bg-neutral-50">
                      <span className="text-[13px] text-neutral-900">{habit.title}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-neutral-200 text-neutral-500 shrink-0">
                        {habit.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
