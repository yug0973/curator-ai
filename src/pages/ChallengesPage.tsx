import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Challenge, UserChallenge, User } from "../types/index.js";
import { Trophy, CheckCircle2, Calendar, Target, Flame } from "lucide-react";

interface ChallengesPageProps {
  user: User | null;
  gapTheme?: string | null;
}

// Predefined challenges by gap theme
const CHALLENGES: Challenge[] = [
  {
    id: "discipline_30",
    title: "30-Day Discipline Challenge",
    description: "Build unbreakable discipline through daily consistency practices",
    gapTheme: "Discipline",
    duration: 30,
    tasks: [
      "Wake up at the same time every day",
      "Complete 1 deep work session (90 mins)",
      "Exercise for 30 minutes",
      "No social media scrolling",
      "Read for 20 minutes before bed",
    ],
    points: 500,
    badge: "🎯 Discipline Master",
  },
  {
    id: "learning_21",
    title: "21-Day Learning Sprint",
    description: "Master a new skill through deliberate practice and consistent study",
    gapTheme: "Learning",
    duration: 21,
    tasks: [
      "Study your chosen topic for 1 hour",
      "Complete 1 hands-on practice exercise",
      "Teach what you learned to someone",
      "Take notes and review yesterday's learning",
      "Build something with your new knowledge",
    ],
    points: 350,
    badge: "📚 Fast Learner",
  },
  {
    id: "confidence_14",
    title: "14-Day Confidence Builder",
    description: "Step outside your comfort zone and build authentic self-belief",
    gapTheme: "Confidence",
    duration: 14,
    tasks: [
      "Do one thing that scares you",
      "Have a meaningful conversation with a stranger",
      "Share your opinion publicly",
      "Compliment 3 people genuinely",
      "Practice power posing for 2 minutes",
    ],
    points: 250,
    badge: "💪 Confident Self",
  },
  {
    id: "leadership_30",
    title: "30-Day Leadership Practice",
    description: "Develop leadership skills through daily action and reflection",
    gapTheme: "Leadership",
    duration: 30,
    tasks: [
      "Lead a team meeting or discussion",
      "Mentor someone for 15 minutes",
      "Make a tough decision",
      "Give constructive feedback",
      "Reflect on your leadership style",
    ],
    points: 500,
    badge: "👑 Leader",
  },
  {
    id: "health_28",
    title: "28-Day Health Reset",
    description: "Transform your physical and mental health through daily habits",
    gapTheme: "Health",
    duration: 28,
    tasks: [
      "Drink 8 glasses of water",
      "Exercise for 45 minutes",
      "Sleep 7-8 hours",
      "Eat 5 servings of vegetables",
      "Meditate for 10 minutes",
    ],
    points: 450,
    badge: "🏃 Health Champion",
  },
];

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ user, gapTheme }) => {
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    // Load active challenges from localStorage
    try {
      const stored = localStorage.getItem(`peak_challenges_${user?.email}`);
      if (stored) {
        setActiveChallenges(JSON.parse(stored));
      }
    } catch {
      // non-fatal
    }
  }, [user?.email]);

  const saveActiveChallenges = (challenges: UserChallenge[]) => {
    setActiveChallenges(challenges);
    try {
      localStorage.setItem(`peak_challenges_${user?.email}`, JSON.stringify(challenges));
    } catch {
      // non-fatal
    }
  };

  const startChallenge = (challenge: Challenge) => {
    const newChallenge: UserChallenge = {
      challengeId: challenge.id,
      startDate: new Date().toISOString(),
      completedTasks: [],
      isCompleted: false,
    };
    saveActiveChallenges([...activeChallenges, newChallenge]);
    setSelectedChallenge(null);
  };

  const toggleTask = (challengeId: string, dayIndex: number) => {
    const updated = activeChallenges.map((c) => {
      if (c.challengeId === challengeId) {
        const completed = c.completedTasks.includes(dayIndex)
          ? c.completedTasks.filter((d) => d !== dayIndex)
          : [...c.completedTasks, dayIndex];
        return { ...c, completedTasks: completed };
      }
      return c;
    });
    saveActiveChallenges(updated);
  };

  const getDaysElapsed = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const getChallengeProgress = (userChallenge: UserChallenge): number => {
    const challenge = CHALLENGES.find((c) => c.id === userChallenge.challengeId);
    if (!challenge) return 0;
    return Math.round((userChallenge.completedTasks.length / challenge.duration) * 100);
  };

  // Filter challenges by gap theme if provided
  const relevantChallenges = gapTheme
    ? CHALLENGES.filter((c) => c.gapTheme === gapTheme)
    : CHALLENGES;

  const activeChallengeFull = activeChallenges.map((uc) => ({
    userChallenge: uc,
    challenge: CHALLENGES.find((c) => c.id === uc.challengeId)!,
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative max-w-6xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 h-6 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 tracking-wide uppercase mb-6">
            <Flame className="w-3 h-3" />
            Community Challenges
          </div>
          <h1 className="text-[40px] font-semibold tracking-[-0.03em] text-neutral-900 mb-3">
            Growth Challenges
          </h1>
          <p className="text-[15px] text-neutral-500 max-w-xl">
            Join structured 14-30 day challenges designed to close your identity gap through daily action.
          </p>
        </div>

        {/* Active Challenges */}
        {activeChallengeFull.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[20px] font-semibold text-neutral-900 mb-6">Your Active Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeChallengeFull.map(({ userChallenge, challenge }) => {
                const daysElapsed = getDaysElapsed(userChallenge.startDate);
                const progress = getChallengeProgress(userChallenge);
                const currentDay = Math.min(daysElapsed, challenge.duration);

                return (
                  <motion.div
                    key={userChallenge.challengeId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-neutral-200 rounded-xl p-6 bg-white hover:border-neutral-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[16px] font-semibold text-neutral-900 mb-1">{challenge.title}</h3>
                        <p className="text-[12px] text-neutral-500">Day {currentDay} of {challenge.duration}</p>
                      </div>
                      <div className="text-[24px]">{challenge.badge.split(" ")[0]}</div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[12px] text-neutral-500 mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-neutral-900 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Today's tasks */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-3">
                        Today's Tasks
                      </p>
                      {challenge.tasks.map((task, idx) => {
                        const isCompleted = userChallenge.completedTasks.includes(currentDay - 1);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleTask(userChallenge.challengeId, currentDay - 1)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              isCompleted
                                ? "bg-neutral-50 border-neutral-900"
                                : "bg-white border-neutral-200 hover:border-neutral-400"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isCompleted ? "border-neutral-900 bg-neutral-900" : "border-neutral-300"
                              }`}
                            >
                              {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-[13px] ${isCompleted ? "text-neutral-500 line-through" : "text-neutral-900"}`}>
                              {task}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px] text-neutral-500">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{challenge.points} points</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">{challenge.badge}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Challenges */}
        <div>
          <h2 className="text-[20px] font-semibold text-neutral-900 mb-6">
            {gapTheme ? `${gapTheme} Challenges` : "All Challenges"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantChallenges
              .filter((c) => !activeChallenges.some((ac) => ac.challengeId === c.id))
              .map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-neutral-200 rounded-xl p-6 bg-white hover:border-neutral-400 transition-all cursor-pointer"
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <div className="text-[32px] mb-4">{challenge.badge.split(" ")[0]}</div>
                  <h3 className="text-[16px] font-semibold text-neutral-900 mb-2">{challenge.title}</h3>
                  <p className="text-[13px] text-neutral-500 leading-relaxed mb-4">{challenge.description}</p>

                  <div className="flex items-center gap-4 text-[12px] text-neutral-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{challenge.duration} days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>{challenge.tasks.length} tasks/day</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] text-neutral-500">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{challenge.points} points</span>
                    </div>
                    <button className="text-[12px] font-medium text-neutral-900 hover:underline">
                      Start Challenge →
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* Challenge Details Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full bg-white rounded-xl border border-neutral-200 shadow-xl p-8"
          >
            <div className="text-[48px] mb-4 text-center">{selectedChallenge.badge.split(" ")[0]}</div>
            <h3 className="text-[24px] font-semibold text-neutral-900 mb-2 text-center">
              {selectedChallenge.title}
            </h3>
            <p className="text-[14px] text-neutral-500 text-center mb-6">{selectedChallenge.description}</p>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-3">
                Daily Tasks
              </p>
              <ul className="space-y-2">
                {selectedChallenge.tasks.map((task, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between mb-6 text-[13px]">
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-4 h-4" />
                <span>{selectedChallenge.duration} days</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Trophy className="w-4 h-4" />
                <span>{selectedChallenge.points} points</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex-1 h-11 border border-neutral-200 hover:border-neutral-400 text-neutral-600 hover:text-neutral-900 text-[14px] font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => startChallenge(selectedChallenge)}
                className="flex-1 h-11 bg-neutral-900 hover:bg-neutral-800 text-white text-[14px] font-medium rounded-lg transition-colors"
              >
                Start Challenge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
