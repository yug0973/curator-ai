import React from "react";
import { Sparkles } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Analyzing your identity gap...",
  subtitle = "Synthesizing aspirational traits and curating growth trajectories",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-12 animate-fadeIn">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-xl bg-mist/60 border border-mist flex items-center justify-center text-blaze animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      </div>

      <h3 className="font-display text-2xl font-semibold text-parchment tracking-tight">{title}</h3>
      <p className="text-sm text-fog max-w-sm mt-1.5 leading-relaxed">{subtitle}</p>

      {/* Skeleton bar */}
      <div className="w-48 h-1 bg-mist rounded-full overflow-hidden mt-6">
        <div className="h-full bg-blaze rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  );
};
