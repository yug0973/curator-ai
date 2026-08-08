"use client";

import React, { useState } from 'react';
import { LiquidMetal } from '@paper-design/shaders-react';
import { Button } from './button.js';
import { Badge } from './badge.js';
import { Card } from './card.js';
import { motion } from 'framer-motion';
import { SimpleTypewriter } from '../reactbits/SimpleTypewriter.js';

// Coordinates the two-line sequential typing effect with a single cursor
const SequentialHeading: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [line1Complete, setLine1Complete] = useState(false);
  const [line2Complete, setLine2Complete] = useState(false);

  return (
    <div role="heading" aria-level={1} className="max-w-4xl mx-auto text-center">
      {/* Line 1 — white text, cursor disappears when complete */}
      <div
        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.15] tracking-tight mb-2"
        style={{ textShadow: '0 4px 25px rgba(0,0,0,0.95)' }}
      >
        <SimpleTypewriter
          text="Break the Attention Trap."
          typingSpeed={75}
          initialDelay={0}
          showCursor={!line1Complete}
          cursorColor="white"
          textColor="white"
          className="font-extrabold"
          onComplete={() => setLine1Complete(true)}
        />
      </div>

      {/* Line 2 — cyan text, cursor appears only after line 1 */}
      <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.15] tracking-tight">
        {line1Complete && (
          <SimpleTypewriter
            text="Curate Your Highest Self."
            typingSpeed={75}
            initialDelay={100}
            showCursor={true}
            cursorColor="#5eead4"
            textColor="#5eead4"
            className="font-extrabold"
            onComplete={() => {
              setLine2Complete(true);
              onComplete?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

export interface LiquidMetalHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  onPrimaryCtaClick: () => void;
  onSecondaryCtaClick?: () => void;
  features?: string[];
}

export default function LiquidMetalHero({
  badge,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  features = [],
}: LiquidMetalHeroProps) {
  const [headingDone, setHeadingDone] = useState(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1
    }
  };

  const cubeSize = 270;
  const halfSize = cubeSize / 2;

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-black text-white pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      {/* 3D Rotating Dark Obsidian Liquid Metal Cube */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] pointer-events-none z-0 flex items-center justify-center"
        style={{ perspective: 1200 }}
      >
        <motion.div 
          animate={{ 
            rotateX: [18, -18, 18],
            rotateY: [0, 360],
            rotateZ: [-6, 6, -6],
            y: [-10, 10, -10]
          }}
          transition={{ 
            rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 16, repeat: Infinity, ease: "linear" },
            rotateZ: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ 
            width: cubeSize, 
            height: cubeSize, 
            transformStyle: "preserve-3d",
            position: "relative"
          }}
        >
          {/* Front Face */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] bg-black"
            style={{ transform: `translateZ(${halfSize}px)` }}
          >
            <LiquidMetal
              colorBack="#000000"
              colorTint="#0ea5e9"
              shape="none"
              scale={1}
              speed={1.4}
              distortion={0.35}
              softness={0.2}
              contour={0.4}
              repetition={2.2}
              shiftRed={0.5}
              shiftBlue={-0.5}
              angle={45}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Back Face */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] bg-black"
            style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
          >
            <LiquidMetal
              colorBack="#000000"
              colorTint="#0ea5e9"
              shape="none"
              scale={1}
              speed={1.4}
              distortion={0.35}
              softness={0.2}
              contour={0.4}
              repetition={2.2}
              shiftRed={0.5}
              shiftBlue={-0.5}
              angle={135}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Right Face */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] bg-black"
            style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
          >
            <LiquidMetal
              colorBack="#000000"
              colorTint="#0ea5e9"
              shape="none"
              scale={1}
              speed={1.4}
              distortion={0.35}
              softness={0.2}
              contour={0.4}
              repetition={2.2}
              shiftRed={0.5}
              shiftBlue={-0.5}
              angle={225}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Left Face */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] bg-black"
            style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
          >
            <LiquidMetal
              colorBack="#000000"
              colorTint="#0ea5e9"
              shape="none"
              scale={1}
              speed={1.4}
              distortion={0.35}
              softness={0.2}
              contour={0.4}
              repetition={2.2}
              shiftRed={0.5}
              shiftBlue={-0.5}
              angle={315}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Top Face */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] bg-black"
            style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
          >
            <LiquidMetal
              colorBack="#000000"
              colorTint="#0ea5e9"
              shape="none"
              scale={1}
              speed={1.4}
              distortion={0.35}
              softness={0.2}
              contour={0.4}
              repetition={2.2}
              shiftRed={0.5}
              shiftBlue={-0.5}
              angle={0}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Bottom Face */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] bg-black"
            style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
          >
            <LiquidMetal
              colorBack="#000000"
              colorTint="#0ea5e9"
              shape="none"
              scale={1}
              speed={1.4}
              distortion={0.35}
              softness={0.2}
              contour={0.4}
              repetition={2.2}
              shiftRed={0.5}
              shiftBlue={-0.5}
              angle={180}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div 
          className="text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {badge && (
            <motion.div 
              className="flex justify-center"
              variants={itemVariants}
            >
              <Badge 
                variant="secondary" 
                className="bg-zinc-900/90 text-zinc-100 border-zinc-700/80 hover:bg-zinc-800 transition-colors duration-300 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full shadow-lg"
              >
                {badge}
              </Badge>
            </motion.div>
          )}
          
          <motion.div 
            className="space-y-6 sm:space-y-8 text-center"
            variants={itemVariants}
          >
            {/* Main heading with sequential TextType effect */}
            <motion.div
              variants={itemVariants}
            >
              <SequentialHeading onComplete={() => setHeadingDone(true)} />
            </motion.div>
            
            <motion.div 
              className="max-w-3xl mx-auto pt-2 sm:pt-4"
              variants={itemVariants}
              animate={{ opacity: headingDone ? 1 : 0, y: headingDone ? 0 : 10 }}
              transition={{ duration: 0.6 }}
            >
              <p className="inline-block bg-black/85 backdrop-blur-2xl border border-white/20 px-6 sm:px-8 py-3.5 rounded-full text-zinc-100 font-medium text-base sm:text-lg shadow-[0_8px_32px_rgba(0,0,0,0.9)] leading-relaxed">
                {subtitle}
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2 relative z-20"
            variants={buttonVariants}
            animate={{ opacity: headingDone ? 1 : 0, y: headingDone ? 0 : 10 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Button 
                onClick={onPrimaryCtaClick}
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-2xl text-base sm:text-lg px-8 py-6 font-semibold rounded-xl cursor-pointer"
              >
                {primaryCtaLabel}
              </Button>
            </motion.div>
            
            {secondaryCtaLabel && onSecondaryCtaClick && (
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button 
                  onClick={onSecondaryCtaClick}
                  variant="outline"
                  size="lg"
                  className="bg-zinc-950/80 border-zinc-700/80 text-white hover:bg-zinc-900 hover:border-zinc-500 transition-all duration-300 backdrop-blur-md text-base sm:text-lg px-8 py-6 font-semibold rounded-xl cursor-pointer"
                >
                  {secondaryCtaLabel}
                </Button>
              </motion.div>
            )}
          </motion.div>
          
          {features.length > 0 && (
            <motion.div 
              className="pt-12 max-w-4xl mx-auto"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-zinc-900/70 border-zinc-800/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {features.map((feature, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-center justify-center text-center px-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.6 + (index * 0.1)
                          }}
                        >
                          <p className="text-zinc-200 font-semibold text-base sm:text-lg">
                            {feature}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
