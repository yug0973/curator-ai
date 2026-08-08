import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Recommendation, Profile, ReflectionResponse } from "../types/index.js";
import { getRecommendations } from "../services/api.js";
import { CURATED_RESOURCES } from "../data/resources.js";
import { MediaPlayerModal } from "../components/MediaPlayerModal.js";
import { RadarChartComponent } from "../components/RadarChartComponent.js";
import {
  BookOpen, GraduationCap, PlayCircle, FileText, Headphones,
  Sparkles, ExternalLink, CheckCircle2, ChevronDown, RotateCcw, Play, Filter, Flame, ArrowUpRight
} from "lucide-react";

// ── YouTube helpers ──────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex(p => ["embed", "shorts", "v"].includes(p));
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  } catch {}
  return null;
}

function YoutubeThumbnail({ url, title }: { url: string; title: string }) {
  const id = getYouTubeId(url);
  const [err, setErr] = useState(false);

  if (!id || err) {
    return (
      <div className="w-full aspect-video rounded-xl bg-neutral-100 flex items-center justify-center mb-4 border border-neutral-200">
        <PlayCircle className="w-8 h-8 text-neutral-300" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 group/yt cursor-pointer shadow-xs"
      onClick={e => { e.stopPropagation(); window.open(url, "_blank", "noopener,noreferrer"); }}
    >
      <img
        src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover group-hover/yt:scale-105 transition-transform duration-300"
        onError={() => setErr(true)}
      />
      {/* dark overlay + play button on hover */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/yt:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
          <Play className="w-5 h-5 text-neutral-900 ml-0.5" fill="currentColor" />
        </div>
      </div>
      {/* YouTube pill badge */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide">
        <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        YouTube Curation
      </div>
    </div>
  );
}

interface RecommendationsPageProps {
  storedProfile?: Profile | null;
  onAlignmentUpdate?: (score: number) => void;
}

interface ResourceProgress { [id: string]: { completed: boolean; timestamp?: number } }

const sectionMeta: Record<string, { color: string; bg: string; border: string }> = {
  Video:   { color: "text-emerald-700",  bg: "bg-emerald-50",  border: "border-emerald-200" },
  Book:    { color: "text-blue-700",     bg: "bg-blue-50",     border: "border-blue-200"    },
  Course:  { color: "text-violet-700",   bg: "bg-violet-50",   border: "border-violet-200"  },
  Article: { color: "text-orange-700",   bg: "bg-orange-50",   border: "border-orange-200"  },
  Podcast: { color: "text-pink-700",     bg: "bg-pink-50",     border: "border-pink-200"    },
  Guide:   { color: "text-cyan-700",     bg: "bg-cyan-50",     border: "border-cyan-200"    },
};
const fallback = { color: "text-neutral-700", bg: "bg-neutral-50", border: "border-neutral-200" };

function typeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "book":    return <BookOpen className="w-4 h-4" />;
    case "course":  return <GraduationCap className="w-4 h-4" />;
    case "video":   return <PlayCircle className="w-4 h-4" />;
    case "article": return <FileText className="w-4 h-4" />;
    case "podcast": return <Headphones className="w-4 h-4" />;
    default:        return <Sparkles className="w-4 h-4" />;
  }
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ storedProfile, onAlignmentUpdate }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryTheme = searchParams.get("gapTheme");
  const storedSavedProfile = useMemo(() => {
    if (storedProfile) return storedProfile;
    try {
      const saved = localStorage.getItem("peak_profile");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  }, [storedProfile]);

  const gapTheme = queryTheme || (location.state as any)?.gapTheme || storedSavedProfile?.gapTheme || "Discipline";
  const profile: Profile | null = (location.state as any)?.profile || storedSavedProfile || null;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [reflectionResult, setReflectionResult] = useState<ReflectionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");
  
  // Keep a mutable copy of profile so radar updates live after reflection
  const [liveProfile, setLiveProfile] = useState<Profile | null>(profile);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ Video: true, Book: true, Course: true, Article: true, Podcast: true, Guide: true });
  const [progress, setProgress] = useState<ResourceProgress>(() => {
    try { return JSON.parse(localStorage.getItem("resourceProgress") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    if (profile) setLiveProfile(profile);
  }, [profile]);


  useEffect(() => { localStorage.setItem("resourceProgress", JSON.stringify(progress)); }, [progress]);

  const fetchRecs = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRecommendations(await getRecommendations(gapTheme)); }
    catch (e: any) {
      const msg: string = e.message || "";
      if (msg.toLowerCase().includes("session") || msg.toLowerCase().includes("onboard")) {
        setError("__no_session__");
      } else {
        const localMatched = CURATED_RESOURCES.filter(r =>
          r.tags.some(t => t.toLowerCase() === gapTheme.toLowerCase())
        ).slice(0, 8);
        
        if (localMatched.length > 0) {
          setRecommendations(localMatched.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.type,
            url: r.url,
            reason: r.defaultReason,
            difficulty: r.difficulty
          })));
        } else {
          setError(msg || "Unable to fetch recommendations.");
        }
      }
    }
    finally { setLoading(false); }
  }, [gapTheme]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  const handleOpen = (rec: Recommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rec.url) window.open(rec.url, "_blank", "noopener,noreferrer");
    setSelectedRec(rec);
  };

  const handleReflectionSuccess = (res: ReflectionResponse) => {
    setReflectionResult(res);
    onAlignmentUpdate?.(res.alignmentScore);
    if (selectedRec) setProgress(p => ({ ...p, [selectedRec.id]: { completed: true, timestamp: Date.now() } }));
    if (res.updatedRadar) {
      setLiveProfile(prev => prev
        ? { ...prev, radarScores: res.updatedRadar as any }
        : prev
      );
    }
  };

  const toggleDone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProgress(p => ({ ...p, [id]: { completed: !p[id]?.completed, timestamp: Date.now() } }));
  };

  const categories = useMemo(() => {
    const types = Array.from(new Set(recommendations.map(r => r.type)));
    return ["All", ...types];
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    if (activeTab === "All") return recommendations;
    return recommendations.filter(r => r.type === activeTab);
  }, [recommendations, activeTab]);

  const grouped = filteredRecommendations.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const total = recommendations.length;
  const done = recommendations.filter(r => progress[r.id]?.completed).length;
  const overallPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 py-12">
        {/* Header — IABTM High-Signal Style */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-800 tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identity Gap: {gapTheme}</span>
            </div>
            <h1 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.03em] text-neutral-900 leading-tight">
              Curated Growth Feed
            </h1>
            <p className="text-[16px] text-neutral-600 max-w-xl mt-2">
              High-signal media, protocols, and reflection exercises matched to your aspirational identity radar.
            </p>
          </div>

          {/* Alignment Badge */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-lg">
              {reflectionResult?.alignmentScore ?? (storedProfile ? 78 : 70)}%
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Live Alignment</div>
              <div className="text-sm font-bold text-neutral-900">{gapTheme} Vector</div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs (IABTM Style) */}
        {!loading && !error && categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 mb-4">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#1a1a1a] text-white shadow-md"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
                }`}
              >
                {tab === "All" ? "All Recommendations" : `${tab}s`}
              </button>
            ))}
          </div>
        )}

        {/* Overall progress */}
        {!loading && !error && total > 0 && (
          <div className="mb-10 p-6 border border-neutral-200/80 rounded-2xl bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-bold text-neutral-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-600" />
                Overall Protocol Completion
              </span>
              <span className="text-[13px] font-semibold text-neutral-700">{done} of {total} completed</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-neutral-900 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 0.8 }} />
            </div>
            <div className="flex items-center justify-between mt-3 text-[12px] text-neutral-500 font-mono">
              <span>{overallPct}% Completed</span>
              <span>+5% Alignment Boost per Resource</span>
            </div>
          </div>
        )}

        {/* Reflection success banner */}
        {reflectionResult && (
          <div className="mb-8 p-5 border border-emerald-300 rounded-2xl bg-emerald-50/80 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[15px] font-bold text-emerald-950">Identity Nudge Applied!</p>
                <p className="text-[13px] text-emerald-800">Your reflection logged successfully. Your identity radar evolved in real-time.</p>
              </div>
            </div>
            <div className="text-right shrink-0 bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-xs">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">New Score</p>
              <p className="text-[20px] font-extrabold text-emerald-600">{reflectionResult.alignmentScore}%</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2.5 h-2.5 bg-neutral-900 rounded-full"
                  animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
            <p className="text-[15px] font-medium text-neutral-600">Curating resources for {gapTheme}…</p>
          </div>
        )}

        {/* No session error fallback */}
        {error === "__no_session__" && (
          <div className="flex flex-col items-center py-24 gap-5 text-center bg-white rounded-3xl border border-neutral-200 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-3xl">
              🗺️
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 mb-2">No identity profile found</p>
              <p className="text-sm text-neutral-600">
                Complete our 2-step onboarding so Peak can match high-signal resources to your gap analysis.
              </p>
            </div>
            <button
              onClick={() => navigate("/onboarding")}
              className="inline-flex items-center gap-2 h-11 px-8 bg-[#1a1a1a] hover:bg-black text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
            >
              Start Onboarding
            </button>
          </div>
        )}

        {/* Generic error */}
        {error && error !== "__no_session__" && (
          <div className="flex flex-col items-center py-24 gap-4">
            <p className="text-sm text-neutral-600">{error}</p>
            <button onClick={fetchRecs} className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-900 underline underline-offset-2 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Content Sections */}
        {!loading && !error && (
          <div className="space-y-6 mb-16">
            {(Object.entries(grouped) as [string, Recommendation[]][]).map(([type, resources]) => {
              const m = sectionMeta[type] ?? fallback;
              const secDone = resources.filter(r => progress[r.id]?.completed).length;
              const secPct = Math.round((secDone / resources.length) * 100);
              const isOpen = expanded[type] ?? true;

              return (
                <div key={type} className="border border-neutral-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {/* Section Header */}
                  <button onClick={() => setExpanded(p => ({ ...p, [type]: !p[type] }))}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-neutral-50/80 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.border} ${m.color} border shadow-2xs`}>
                        {typeIcon(type)}
                      </div>
                      <div className="text-left">
                        <p className="text-base font-bold text-neutral-900">{type}s</p>
                        <p className="text-xs text-neutral-500">{resources.length} curated resource{resources.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-neutral-900">{secDone}/{resources.length} Done</p>
                        <p className="text-[11px] text-neutral-400 font-mono">{secPct}% complete</p>
                      </div>
                      <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden hidden sm:block">
                        <motion.div className={`h-full rounded-full bg-neutral-900`}
                          initial={{ width: 0 }} animate={{ width: `${secPct}%` }} transition={{ duration: 0.5 }} />
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Resource Cards */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6 pt-3 border-t border-neutral-100 bg-neutral-50/50">
                          {resources.map((rec) => {
                            const isDone = progress[rec.id]?.completed;
                            return (
                              <div key={rec.id}
                                className={`border border-neutral-200/80 rounded-2xl p-5 flex flex-col justify-between bg-white hover:border-neutral-400 hover:shadow-lg transition-all cursor-pointer group ${isDone ? "opacity-60 bg-neutral-50/80" : ""}`}
                                onClick={() => setSelectedRec(rec)}>
                                <div>
                                  {/* YouTube thumbnail for Video */}
                                  {rec.type === "Video" && (
                                    <YoutubeThumbnail url={rec.url} title={rec.title} />
                                  )}

                                  <div className="flex items-center justify-between mb-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg} ${m.border} ${m.color} border`}>
                                      {typeIcon(rec.type)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        +5% Alignment
                                      </span>
                                    </div>
                                  </div>

                                  <h3 className={`text-base font-bold mb-2 leading-snug group-hover:text-emerald-700 transition-colors ${isDone ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                                    {rec.title}
                                  </h3>
                                  <p className="text-xs text-neutral-600 leading-relaxed mb-4 line-clamp-2">
                                    {rec.description}
                                  </p>
                                  
                                  {/* Reason Box */}
                                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 leading-relaxed mb-4">
                                    <span className="font-semibold text-neutral-800 block mb-1">Curation Reason</span>
                                    "{rec.reason}"
                                  </div>
                                </div>

                                {/* Card Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                                  <button onClick={(e) => toggleDone(rec.id, e)}
                                    title={isDone ? "Mark as unread" : "Mark as completed"}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shrink-0 cursor-pointer ${
                                      isDone ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-400"
                                    }`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={(e) => handleOpen(rec, e)}
                                    className="flex-1 h-9 bg-[#1a1a1a] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                                    Open & Reflect <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Identity Radar Chart Card */}
        {(liveProfile || reflectionResult) && !loading && !error && (
          <div className="border border-neutral-200/90 rounded-3xl p-8 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Identity Radar Radar Scores</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Real-time alignment mapping across 5 growth dimensions.</p>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                Alignment: {reflectionResult?.alignmentScore ?? (storedProfile ? 78 : 70)}%
              </span>
            </div>
            <RadarChartComponent
              radarScores={liveProfile?.radarScores || {}}
              updatedRadar={reflectionResult?.updatedRadar}
            />
          </div>
        )}
      </div>

      {selectedRec && (
        <MediaPlayerModal recommendation={selectedRec} isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)} onSuccess={handleReflectionSuccess} />
      )}
    </div>
  );
};

