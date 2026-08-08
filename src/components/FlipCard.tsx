import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FlipCardProps {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  imageSrc: string;
  badge: string;
  delay?: number;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  step,
  title,
  subtitle,
  description,
  icon: Icon,
  imageSrc,
  badge,
  delay = 0,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const flickControls = useAnimation();

  // Mouse position tracking for tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 100,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 100,
    damping: 15,
  });

  // Flick animation effect - triggers periodically
  useEffect(() => {
    const triggerFlick = () => {
      flickControls.start({
        rotateZ: [0, -2, 2, -1, 1, 0],
        transition: {
          duration: 0.5,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          ease: "easeInOut"
        }
      });
    };

    // Initial flick after component mounts
    const initialTimeout = setTimeout(triggerFlick, delay * 1000 + 1000);

    // Periodic flick every 8 seconds
    const flickInterval = setInterval(triggerFlick, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(flickInterval);
    };
  }, [delay, flickControls]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return; // Disable tilt when flipped

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="w-full flex justify-center"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={flickControls}
        className="relative w-full max-w-sm h-[420px]"
      >
        <motion.div
          ref={cardRef}
          className="relative w-full h-full cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.02 }}
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          style={{
            transformStyle: "preserve-3d",
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
          }}
        >
        {/* Front Face */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90 p-6 flex flex-col justify-between">
            {/* Top Row */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-200 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-sm">
                {step}
              </span>
              <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                {badge}
              </span>
              <h3 className="text-2xl font-bold text-white leading-tight">
                {title}
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Click hint */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-white/60 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <span>Click to flip</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-cyan-500/10 via-black to-emerald-500/10 backdrop-blur-xl border border-white/10"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="w-full h-full p-8 flex flex-col justify-between">
            {/* Back Top */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    {step}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {title}
                  </h3>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Description */}
              <div className="space-y-3">
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  {badge}
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Back Bottom */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Click again to flip back</span>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
