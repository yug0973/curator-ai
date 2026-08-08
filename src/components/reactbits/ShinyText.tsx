import React from "react";

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  className = "",
}) => {
  return (
    <span
      className={`relative inline-block bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-shiny-shine ${className}`}
    >
      {text}
    </span>
  );
};
