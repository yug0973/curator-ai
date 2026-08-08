import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, HistoryResponse } from "../types/index.js";
import { getHistory } from "../services/api.js";
import { CheckCircle2, Circle, ThumbsUp, ThumbsDown, UserCircle2, RotateCcw } from "lucide-react";

interface HistoryPageProps { user: User | null; }

export const HistoryPage: React.FC<HistoryPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = () => {
    if (!user) return;
    setLoading(true); setError(null);
    getHistory().then(setData).catch((e: any) => setError(e.message || "Failed to load history.")).finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <UserCircle2 className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-[20px] font-semibold text-neutral-900 mb-2">Not signed in</h2>
          <p className="text-[14px] text-neutral-500 mb-6">Sign in to view your growth timeline.</p>
          <button onClick={() => navigate("/auth")} className="px-6 h-11 bg-neutral-900 text-white text-[14px] font-medium rounded-lg hover:bg-neutral-800 transition-colors">Sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative max-w-5xl mx-auto px-8 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 h-6 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Growth timeline
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] text-neutral-900 mb-2">History</h1>
          <p className="text-[15px] text-neutral-500">Every reflection and roadmap milestone so far.</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-neutral-400 rounded-full"
                  animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
            <p className="text-[14px] text-neutral-500">Loading your history…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-24 gap-3">
            <p className="text-[14px] text-neutral-600">{error}</p>
            <button onClick={fetchHistory} className="inline-flex items-center gap-2 text-[13px] text-neutral-900 font-medium underline underline-offset-2">
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Roadmap */}
            <div className="border border-neutral-200 rounded-xl p-6 bg-white">
              <h3 className="text-[15px] font-semibold text-neutral-900 mb-5">Roadmap milestones</h3>
              {data.roadmapSteps.length === 0 ? (
                <p className="text-[13px] text-neutral-400">No roadmap yet — complete onboarding first.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.roadmapSteps.map((step) => (
                    <div key={step.phase} className="flex gap-3 p-4 rounded-lg border border-neutral-100 bg-neutral-50">
                      {step.completed
                        ? <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                        : <Circle className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                      }
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[13px] font-semibold text-neutral-900">Phase {step.phase}: {step.title}</span>
                          <span className="text-[11px] text-neutral-400">{step.duration}</span>
                        </div>
                        <p className="text-[12px] text-neutral-500 leading-relaxed">{step.actionableInstruction}</p>
                        <span className={`inline-block mt-2 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          step.completed ? "text-neutral-900 border-neutral-900 bg-white" : "text-neutral-400 border-neutral-200 bg-white"
                        }`}>
                          {step.completed ? "Completed" : "In progress"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reflections */}
            <div className="border border-neutral-200 rounded-xl p-6 bg-white">
              <h3 className="text-[15px] font-semibold text-neutral-900 mb-5">Reflection log</h3>
              {data.reflections.length === 0 ? (
                <p className="text-[13px] text-neutral-400">No reflections yet — react to a recommendation to start.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto">
                  {data.reflections.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral-100 bg-neutral-50">
                      {r.liked
                        ? <ThumbsUp className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                        : <ThumbsDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-neutral-900 truncate">{r.recommendationTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-neutral-400">{r.emotion}</span>
                          <span className="text-[11px] text-neutral-300">·</span>
                          <span className="text-[11px] text-neutral-400">{r.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
