import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Compass, ShieldCheck, Flame, Play, VolumeX, CheckCircle2 } from "lucide-react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    try {
      const savedProfile = localStorage.getItem("peak_profile");
      if (savedProfile && JSON.parse(savedProfile)?.gapTheme) {
        navigate("/identity");
        return;
      }
    } catch {}
    navigate("/auth");
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const curatedItems = [
    {
      id: "c1",
      title: "Mindset Rewiring & Dopamine Protocol",
      category: "Peak Performance",
      image: "/hero_mindset.png",
      tag: "15 min read",
      author: "Dr. Andrew Huberman Method",
      score: "98% Match",
      desc: "Reclaim deep mental clarity and break cognitive fatigue loops through intentional attention design."
    },
    {
      id: "c2",
      title: "Energy Architecture & Movement Flow",
      category: "Physical Vitality",
      image: "/hero_wellness.png",
      tag: "20 min workout",
      author: "Peak Physiology Protocol",
      score: "95% Match",
      desc: "Optimizing circadian rhythm, zone 2 cardiovascular capacity, and recovery rituals for sustainable energy."
    },
    {
      id: "c3",
      title: "The 3605 Journaling & Reflection Method",
      category: "Mindfulness & Growth",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      tag: "5 min daily",
      author: "Curated Reflection Systems",
      score: "99% Match",
      desc: "Structured daily prompts to align your actions with your aspirational identity radar every evening."
    },
    {
      id: "c4",
      title: "Stoic Resilience & Emotional Mastery",
      category: "Emotional Intelligence",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      tag: "10 min audio",
      author: "Marcus Aurelius Meditations",
      score: "94% Match",
      desc: "Transform external stressors into stepping stones for fortitude, emotional balance, and unwavering composure."
    }
  ];

  const communityMembers = [
    { name: "Ricky McClure", location: "New York", streak: "42 Day Streak", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", tag: "Identity Aligned" },
    { name: "Cheryl Hills", location: "San Francisco", streak: "89 Day Streak", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", tag: "Focus Master" },
    { name: "Dora Hermiston", location: "London", streak: "61 Day Streak", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", tag: "Mindset Pioneer" },
    { name: "Lowell Kuphal", location: "Tokyo", streak: "112 Day Streak", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", tag: "Energy Leader" }
  ];

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-neutral-900 font-sans antialiased overflow-x-hidden">
      {/* Subtle Grid Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Modern Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[999] bg-white/90 backdrop-blur-md border-b border-neutral-200/60 transition-all">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors">
                Peak
              </span>
            </a>
            <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-neutral-600">
              <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it works?</a>
              <a href="#recommendations" className="hover:text-neutral-900 transition-colors">Curated Feed</a>
              <a href="#community" className="hover:text-neutral-900 transition-colors">Community</a>
              <a href="#journal" className="hover:text-neutral-900 transition-colors flex items-center gap-1.5">
                <span className="font-serif italic font-semibold text-neutral-800">3605</span> Journal
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleStart}
              className="text-[15px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors px-4 py-2 cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={handleStart}
              className="text-[15px] font-medium bg-[#1a1a1a] text-white hover:bg-black transition-all px-6 py-2.5 rounded-full shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
            >
              Start Here
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for sticky header */}
      <div className="h-20" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-8 pt-12 md:pt-16 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Hero Left Content */}
          <div className="flex flex-col items-start max-w-[620px] text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-[12px] font-medium text-neutral-700 tracking-wide uppercase mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your Personal Growth Companion</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[40px] sm:text-[52px] lg:text-[60px] font-bold tracking-[-0.03em] leading-[1.08] text-neutral-900 mb-6"
            >
              Become the self <br className="hidden sm:block" />
              you imagine
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[17px] sm:text-[19px] leading-[1.55] text-neutral-600 max-w-[540px] mb-8"
            >
              We are a guide, curating a unique personalized path to your highest self through AI media, intentional protocols, and daily identity alignment.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={handleStart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-black text-white font-medium text-[16px] px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Start Here
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleStart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 font-medium text-[16px] px-7 py-3.5 rounded-full transition-all cursor-pointer"
              >
                I want to be better
              </button>
            </motion.div>

            {/* Signal Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-6 sm:gap-8 mt-12 pt-8 border-t border-neutral-200/70 text-[13px] text-neutral-600"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong className="text-neutral-900 font-semibold">2 min</strong> onboarding</span>
              </div>
              <div className="w-px h-4 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong className="text-neutral-900 font-semibold">3 daily</strong> high-signal drops</span>
              </div>
              <div className="w-px h-4 bg-neutral-300 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong className="text-neutral-900 font-semibold">5</strong> growth vectors</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual Stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full lg:w-[580px] h-[480px] sm:h-[520px] flex items-center justify-center"
          >
            {/* Main Visual Card 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-0 left-4 sm:left-8 w-[240px] sm:w-[280px] h-[320px] sm:h-[360px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-neutral-900 z-20 group"
            >
              <img
                src="/hero_mindset.png"
                alt="Mindset Curation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-semibold">Curated Focus</span>
                <h3 className="text-lg font-bold leading-snug mt-1">Cognitive Flow & Deep Work</h3>
                <p className="text-xs text-neutral-300 mt-1 line-clamp-2">Mastering high-leverage focus systems daily.</p>
              </div>
            </motion.div>

            {/* Main Visual Card 2 */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-2 right-4 sm:right-6 w-[230px] sm:w-[270px] h-[300px] sm:h-[340px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-neutral-800 z-30 group"
            >
              <img
                src="/hero_wellness.png"
                alt="Energy Architecture"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 font-semibold">Vitality & Power</span>
                <h3 className="text-lg font-bold leading-snug mt-1">Physical Energy Protocol</h3>
                <p className="text-xs text-neutral-300 mt-1 line-clamp-2">Optimized movement, sleep, and metabolic strength.</p>
              </div>
            </motion.div>

            {/* Floating Identity Alignment Overlay Card */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-12 right-0 sm:right-2 z-40 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-neutral-200/90 max-w-[210px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  94%
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Identity Score</div>
                  <div className="text-[11px] text-neutral-500">Mindset + Vitality</div>
                </div>
              </div>
              <div className="mt-2.5 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "94%" }} />
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-8 py-20 border-t border-neutral-200/60">
        <div className="text-center max-w-[600px] mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">Methodology</span>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mt-1">How Peak Works</h2>
          <p className="text-sm text-neutral-600 mt-2">Get started in minutes, see measurable growth in days.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Identity Radar Analysis</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Answer 4 quick onboarding questions to analyze your current routines, goal vectors, and gap themes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              Takes 90 seconds <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Daily Curation Feed</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Receive 3 high-signal media protocols, articles, and workouts tailored specifically to close your identity gap.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              Zero noise, maximum leverage <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Evening Reflection (3605)</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Reflect on your daily progress to nudge your identity alignment score in real-time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              Real-time alignment tracking <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Video Banner Section */}
      <section className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-8 py-10">
        <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl bg-neutral-950 flex items-center justify-center text-center p-8">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80"
            alt="Ambient Growth Media"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="relative z-20 max-w-[700px] flex flex-col items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-3">Daily Ambient Curation</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              "Replace mindless scrolling with intentional evolution."
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base mb-8 max-w-[560px]">
              Every morning, Peak delivers three high-signal resources matched precisely to your gap analysis.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-white text-neutral-900 font-medium px-6 py-3 rounded-full hover:bg-neutral-100 transition-colors shadow-lg cursor-pointer text-sm"
            >
              <Play className="w-4 h-4 fill-neutral-900" />
              Explore Today's Recommendations
            </button>
          </div>
        </div>
      </section>

      {/* Peak Recommends Carousel */}
      <section id="recommendations" className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">Featured Drops</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mt-1">Peak Recommends</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCarousel("left")}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleStart}
              className="ml-2 text-xs font-semibold bg-[#1a1a1a] text-white hover:bg-black px-4 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {curatedItems.map((item) => (
            <div
              key={item.id}
              onClick={handleStart}
              className="flex-none w-[280px] sm:w-[320px] bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                    {item.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    {item.score}
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[12px] text-neutral-400 font-mono">{item.tag}</span>
                  <h3 className="text-lg font-bold text-neutral-900 mt-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-neutral-100 mt-auto">
                <span className="text-[12px] font-medium text-neutral-500">{item.author}</span>
                <span className="text-xs font-semibold text-neutral-900 group-hover:underline flex items-center gap-1">
                  Start <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Showcase Section */}
      <section id="community" className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-8 py-20 border-t border-neutral-200/60">
        <div className="text-center max-w-[600px] mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">Community Evolution</span>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mt-1">People on the Journey</h2>
          <p className="text-sm text-neutral-600 mt-2">
            Join individuals transforming their routine through deliberate growth curation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {communityMembers.map((member, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30"
                />
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{member.name}</h3>
                  <span className="text-xs text-neutral-500">{member.location}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-100">
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-emerald-500" />
                  {member.streak}
                </span>
                <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-mono text-[11px]">
                  {member.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* "3605 Journal" Special Section */}
      <section id="journal" className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-8 py-20">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-[560px]">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">Daily Reflection System</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4">
              The <span className="font-serif italic font-normal text-amber-300 text-4xl sm:text-5xl">3605</span> Daily Journal
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-8">
              End every evening with 3 focused prompts designed to align your daily actions with your target identity radar score.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold px-6 py-3 rounded-full hover:bg-neutral-100 transition-colors shadow-lg cursor-pointer text-sm"
            >
              Start Journaling Today
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full lg:w-[420px] bg-neutral-800/90 border border-neutral-700/80 p-6 rounded-2xl shadow-2xl backdrop-blur-md text-neutral-200 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <span className="text-amber-300 font-serif italic text-base">Evening Reflection #3605</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Active</span>
            </div>
            <div>
              <p className="text-neutral-400 text-[11px]">1. What principal goal did you advance today?</p>
              <p className="text-white mt-1">"Completed deep focus block on core architecture."</p>
            </div>
            <div>
              <p className="text-neutral-400 text-[11px]">2. Identity Alignment Rating:</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 flex-1 bg-neutral-700 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[90%]" />
                </div>
                <span className="text-emerald-400 font-bold">90%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-200 bg-white">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-neutral-900">Peak</span>
              <span className="text-xs text-neutral-500">© 2026 Peak. Built for intentional living.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-500">
              <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it works?</a>
              <a href="#recommendations" className="hover:text-neutral-900 transition-colors">Curated Feed</a>
              <a href="#community" className="hover:text-neutral-900 transition-colors">Community</a>
              <button onClick={handleStart} className="hover:text-neutral-900 transition-colors cursor-pointer">Sign in</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


