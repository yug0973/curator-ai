import React, { useState } from "react";
import { Recommendation, ReflectionResponse } from "../types/index.js";
import { submitReflection } from "../services/api.js";
import { ThumbsUp, ThumbsDown, X, Loader2 } from "lucide-react";

interface ReflectionModalProps {
  recommendation: Recommendation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: ReflectionResponse) => void;
}

const EMOTIONS = ["Inspired", "Motivated", "Focused", "Confused", "Already knew this"];

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  recommendation, isOpen, onClose, onSuccess,
}) => {
  const [liked, setLiked] = useState<boolean | null>(true);
  const [emotion, setEmotion] = useState("Inspired");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (liked === null) return;
    setLoading(true); setError(null);
    try {
      const res = await submitReflection(recommendation.id, liked, emotion);
      setLoading(false);
      onSuccess(res);
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      setError((err as Error).message || "Failed to submit. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="max-w-md w-full bg-white rounded-xl border border-neutral-200 shadow-xl p-8 relative">
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">Reflection</p>
        <h3 className="text-[18px] font-semibold text-neutral-900 mb-1 pr-8">{recommendation.title}</h3>
        <p className="text-[13px] text-neutral-500 mb-7 line-clamp-2">{recommendation.description}</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={handleSubmit} className="font-medium underline ml-3">Retry</button>
          </div>
        )}

        {/* Helpful? */}
        <div className="mb-6">
          <p className="text-[13px] font-semibold text-neutral-900 mb-3">Did this help you grow?</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setLiked(true)}
              className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-[13px] font-medium transition-colors ${
                liked === true ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}>
              <ThumbsUp className="w-3.5 h-3.5" /> Valuable
            </button>
            <button onClick={() => setLiked(false)}
              className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-[13px] font-medium transition-colors ${
                liked === false ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}>
              <ThumbsDown className="w-3.5 h-3.5" /> Not helpful
            </button>
          </div>
        </div>

        {/* Emotion */}
        <div className="mb-8">
          <p className="text-[13px] font-semibold text-neutral-900 mb-3">How do you feel?</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((item) => (
              <button key={item} onClick={() => setEmotion(item)}
                className={`px-3 h-8 rounded-full border text-[12px] font-medium transition-colors ${
                  emotion === item ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading || liked === null}
          className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-[14px] font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : "Submit reflection"}
        </button>
      </div>
    </div>
  );
};
