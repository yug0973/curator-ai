import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-lg mx-auto my-6 p-5 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-900 shadow-sm backdrop-blur-sm transition-all animate-fadeIn">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-950">Something went wrong</h4>
          <p className="text-sm text-rose-700/90 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-rose-800 bg-rose-100/90 hover:bg-rose-200/90 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
