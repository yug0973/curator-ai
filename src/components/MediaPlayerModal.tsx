import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Recommendation, ReflectionResponse } from "../types/index.js";
import { submitReflection } from "../services/api.js";
import {
  X, Play, Pause, ExternalLink, ThumbsUp, ThumbsDown, Sparkles, CheckCircle2, Loader2, BookOpen, Volume2, VolumeX, RotateCcw, Share2, Flame
} from "lucide-react";

interface MediaPlayerModalProps {
  recommendation: Recommendation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: ReflectionResponse) => void;
}

const EMOTIONS = ["Inspired", "Motivated", "Focused", "Mindset Shift", "Challenge Accepted"];

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
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

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({
  recommendation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [liked, setLiked] = useState<boolean | null>(true);
  const [emotion, setEmotion] = useState("Inspired");
  const [userNote, setUserNote] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioProgress, setAudioProgress] = useState(25);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const youtubeId = getYouTubeId(recommendation.url);
  const isVideo = recommendation.type === "Video" || !!youtubeId;
  const isAudio = recommendation.type === "Podcast";

  useEffect(() => {
    let interval: any;
    if (isAudio && isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAudio, isPlaying]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (liked === null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await submitReflection(recommendation.id, liked, emotion);
      setLoading(false);
      setCompletedSuccess(true);
      setTimeout(() => {
        onSuccess(res);
        onClose();
      }, 800);
    } catch (err: unknown) {
      setLoading(false);
      setError((err as Error).message || "Failed to submit reflection. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-4xl w-full bg-white rounded-3xl border border-neutral-200/90 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        >
          {/* Top Modal Header */}
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                +5% Identity Alignment Boost
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold hidden sm:inline">
                {recommendation.type} Protocol
              </span>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.url && (
                <a
                  href={recommendation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900 bg-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Main Content (Split Media / Reflection Log) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-neutral-100">
            
            {/* Left Side: Media Player / Reader View */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug mb-2">
                  {recommendation.title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                  {recommendation.description}
                </p>

                {/* Video Media View */}
                {isVideo && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-neutral-200">
                    {youtubeId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                        title={recommendation.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center">
                        <Play className="w-12 h-12 text-emerald-400 mb-3" />
                        <p className="text-sm font-semibold">Video Resource Link Available</p>
                        <a
                          href={recommendation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 px-4 py-2 rounded-full bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100 transition-colors"
                        >
                          Watch Video in External Tab
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Audio / Podcast Player View */}
                {isAudio && (
                  <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-lg border border-neutral-800 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          🎙️
                        </div>
                        <div>
                          <div className="text-xs text-emerald-400 font-mono font-semibold uppercase">Audio Podcast Session</div>
                          <div className="text-sm font-bold text-white truncate max-w-[200px]">{recommendation.title}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setMuted(!muted)}
                        className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition-colors cursor-pointer"
                      >
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Equalizer Spectrum Bar */}
                    <div className="flex items-end justify-center gap-1.5 h-12 py-2">
                      {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 95, 60, 35, 85].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: isPlaying ? [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`] : `${h * 0.3}%` }}
                          transition={{ repeat: Infinity, duration: 1 + (i % 3) * 0.4, ease: "easeInOut" }}
                          className="w-1.5 bg-emerald-400 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Player Controls */}
                    <div className="space-y-2">
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 cursor-pointer overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>04:12</span>
                        <span>18:30</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-2">
                      <button
                        onClick={() => setAudioProgress((p) => Math.max(0, p - 10))}
                        className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        -10s
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-neutral-900" /> : <Play className="w-5 h-5 fill-neutral-900 ml-0.5" />}
                      </button>
                      <button
                        onClick={() => setAudioProgress((p) => Math.min(100, p + 10))}
                        className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        +10s
                      </button>
                    </div>
                  </div>
                )}

                {/* Article / Book Reader View */}
                {!isVideo && !isAudio && (
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Key Curation Insight</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-700 italic leading-relaxed">
                      "{recommendation.reason}"
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
                      <span>Difficulty: <strong className="text-neutral-900 font-semibold">{recommendation.difficulty || "Intermediate"}</strong></span>
                      <span>Target Gap: <strong className="text-neutral-900 font-semibold">Identity Alignment</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Curation Reason Quote */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs text-emerald-900 leading-relaxed">
                <span className="font-bold text-emerald-950 block mb-0.5">Why this resource matches your radar:</span>
                "{recommendation.reason}"
              </div>
            </div>

            {/* Right Side: Live Reflection & Action Log */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-neutral-50/50 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-neutral-900">Log Your Reflection</h3>
                  <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-emerald-500" /> Streak Active
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={handleSubmit} className="font-semibold underline ml-2">Retry</button>
                  </div>
                )}

                {/* Reflection Key Note Textarea */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Your key takeaway or identity action step:
                  </label>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="e.g. I will implement a 90-minute focus block every morning without checking my phone..."
                    rows={3}
                    className="w-full p-3 text-xs text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all resize-none"
                  />
                </div>

                {/* Helpful Rating */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-neutral-800 mb-2">
                    Did this resource add value to your identity?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLiked(true)}
                      className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        liked === true
                          ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> High Signal
                    </button>
                    <button
                      type="button"
                      onClick={() => setLiked(false)}
                      className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        liked === false
                          ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> Low Signal
                    </button>
                  </div>
                </div>

                {/* Mindset Shift Tag Selection */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-neutral-800 mb-2">
                    Select Mindset Shift:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setEmotion(item)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          emotion === item
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit / Complete Button */}
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || liked === null || completedSuccess}
                  className="w-full h-12 bg-[#1a1a1a] hover:bg-black disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging Reflection & Updating Radar…
                    </>
                  ) : completedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      +5% Alignment Claimed!
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Complete & Apply +5% Identity Boost
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
