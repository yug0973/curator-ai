import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const FloatingIsland: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 blur-2xl rounded-full" />
        
        {/* Main island - wider with space-between */}
        <div className="relative flex items-center justify-between px-10 py-3.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl w-[680px]">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Compass className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-white leading-none tracking-tight">
                Peak
              </span>
              <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest mt-0.5">
                Human Potential
              </span>
            </div>
          </div>

          {/* CTA Button - pushed to the far right */}
          <button
            onClick={() => navigate("/auth")}
            className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            <span>Start Your Route</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
