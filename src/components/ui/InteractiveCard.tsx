import React, { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableTilt?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = "",
  glowColor = "rgba(6, 182, 212, 0.2)",
  enableTilt = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth 3D tilt springs
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * -6; // max -6 deg
      const tiltY = ((x - centerX) / centerX) * 6;  // max 6 deg

      rotateX.set(tiltX);
      rotateY.set(tiltY);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (enableTilt) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1412]/80 p-6 transition-all duration-300 ${
        isHovered ? "border-cyan-500/40 shadow-xl shadow-cyan-950/30" : ""
      } ${className}`}
      {...props}
    >
      {/* 21st.dev Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 40%)`,
        }}
      />

      {/* Card Content with 3D depth */}
      <div style={{ transform: "translateZ(10px)" }}>{children}</div>
    </motion.div>
  );
};
