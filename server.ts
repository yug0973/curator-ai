import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import crypto from "crypto";
import { CURATED_RESOURCES, CuratedResource } from "./src/data/resources.js";
import { Profile, Recommendation, ReflectionResponse } from "./src/types/index.js";
import { initDb, getUserByEmail, userExists, createUser, updateUser, getAllUsers, recordActivity, getTopStreaks, UserRecord } from "./db.js";
import { initRedis, getSession, setSession, SessionData } from "./redis-sessions.js";

// Gemini is reliable about *what* a real resource is (title/author it has
// seen many times) but not reliable about *where* it lives — it frequently
// invents plausible-looking Amazon/YouTube/article URLs that 404. Rather than
// trust a fabricated link, we build a search URL from the (title + creator)
// it gave us — this always resolves to the real resource instead of a dead
// or wrong one.
// ---------------------------------------------------------------------------
// Gap-theme mastery badges — gamification tied to the app's core identity-gap
// concept rather than generic points. Each of the 5 radar dimensions earns a
// Bronze/Silver/Gold tier purely from that dimension's `current` score, so
// badges track real progress toward the user's aspirational identity instead
// of an arbitrary XP number.
// ---------------------------------------------------------------------------
type BadgeTier = "none" | "bronze" | "silver" | "gold";

function tierForScore(score: number): BadgeTier {
  if (score >= 90) return "gold";
  if (score >= 75) return "silver";
  if (score >= 50) return "bronze";
  return "none";
}

function computeBadges(radarScores: Record<string, { current: number; goal: number }> | undefined): {
  badges: Record<string, BadgeTier>;
  badgeCount: number;
} {
  const badges: Record<string, BadgeTier> = {};
  let badgeCount = 0;
  if (radarScores) {
    Object.entries(radarScores).forEach(([dimension, scores]) => {
      const tier = tierForScore(scores.current);
      badges[dimension] = tier;
      if (tier !== "none") badgeCount++;
    });
  }
  return { badges, badgeCount };
}

function buildResourceSearchUrl(type: string, title: string, creator?: string): string {
  const query = creator ? `${title} ${creator}` : title;
  const encoded = encodeURIComponent(query);
  switch ((type || "").toLowerCase()) {
    case "video":
      return `https://www.youtube.com/results?search_query=${encoded}`;
    case "book":
      return `https://www.google.com/search?tbm=bks&q=${encoded}`;
    case "podcast":
      return `https://www.google.com/search?q=${encoded}+podcast`;
    case "course":
      return `https://www.google.com/search?q=${encoded}+course`;
    default:
      return `https://www.google.com/search?q=${encoded}`;
  }
}

dotenv.config();

// ---------------------------------------------------------------------------
// No-AI fallback profile builder. Used ONLY when Gemini is unavailable
// (missing key, quota exhausted, network error, etc). Previously this
// returned the exact same hardcoded profile for every single user — same
// gap theme, same traits, same radar numbers — no matter what they typed.
// This version actually reads the user's answers so two different people
// (or the same person answering differently) get visibly different results,
// even without AI available.
// ---------------------------------------------------------------------------
const GAP_THEME_KEYWORDS: Record<string, string[]> = {
  Discipline: ["procrastinat", "distract", "lazy", "focus", "discipline", "routine", "habit", "schedule", "consist"],
  Learning: ["learn", "study", "read", "knowledge", "skill", "school", "course", "curious"],
  Confidence: ["confiden", "scared", "fear", "afraid", "anxious", "doubt", "insecure", "shy", "nervous"],
  Leadership: ["lead", "team", "manage", "delegate", "authority", "influence", "communicat"],
  Health: ["health", "sleep", "tired", "energy", "exercise", "diet", "weight", "stress", "fitness"],
};

const GAP_THEME_TRAITS: Record<string, string[]> = {
  Discipline: ["Disciplined Achiever", "Consistent Executor", "Focused Builder"],
  Learning: ["Curious Learner", "Knowledge Seeker", "Growth-Minded Thinker"],
  Confidence: ["Self-Assured Leader", "Bold Communicator", "Resilient Achiever"],
  Leadership: ["Decisive Leader", "Influential Communicator", "Team Builder"],
  Health: ["Energized Achiever", "Balanced High-Performer", "Vital & Focused"],
};

// Deterministic string hash so the same answers always produce the same
// (but answer-dependent) numbers — not random, not identical for everyone.
function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function detectGapTheme(goal: string, blocker: string): string {
  const combined = `${goal} ${blocker}`.toLowerCase();
  let bestTheme = "Discipline";
  let bestScore = 0;
  for (const [theme, keywords] of Object.entries(GAP_THEME_KEYWORDS)) {
    const score = keywords.filter((k) => combined.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }
  return bestTheme;
}

function buildFallbackProfile(userAnswers: { goal: string; blocker: string }): Profile {
  const gapTheme = detectGapTheme(userAnswers.goal || "", userAnswers.blocker || "");
  const traits = GAP_THEME_TRAITS[gapTheme] || GAP_THEME_TRAITS.Discipline;
  const seed = hashText(`${userAnswers.goal}|${userAnswers.blocker}`);

  const dimensions = ["Discipline", "Learning", "Confidence", "Leadership", "Health"];
  const radarScores: Record<string, { current: number; goal: number }> = {};
  dimensions.forEach((dim, i) => {
    // Small deterministic per-dimension variation from the seed so the
    // chart isn't a flat identical pentagon every time.
    const variance = (seed >> (i * 4)) % 20; // 0-19
    const isGapDim = dim === gapTheme;
    const current = isGapDim ? 20 + variance : 45 + variance;
    const goal = isGapDim ? 85 + (variance % 10) : 75 + (variance % 15);
    radarScores[dim] = { current: Math.min(current, 95), goal: Math.min(Math.max(goal, current + 15), 100) };
  });

  return {
    aspirationalTraits: traits,
    behaviorTraits: [
      userAnswers.blocker ? userAnswers.blocker.slice(0, 40) : "Undefined Blocker",
      "Working toward: " + (userAnswers.goal ? userAnswers.goal.slice(0, 35) : "Growth"),
    ],
    gapTheme,
    radarScores,
    roadmap: {
      steps: [
        {
          phase: 1,
          title: "Blocker Deconstruction",
          duration: "Days 1-7",
          actionableInstruction: `Start resolving your primary blocker: "${userAnswers.blocker || "procrastination"}". Set a timer for 10 minutes and perform the easiest subtask first to build inertia.`,
          triggerEvent: "When starting a complex task, open a clean notepad page immediately.",
          completed: false,
        },
        {
          phase: 2,
          title: "Goal Alignment Protocol",
          duration: "Days 8-20",
          actionableInstruction: `Take daily action toward your goal: "${userAnswers.goal || "personal growth"}". Break it into 15-minute micro-tasks you can complete today.`,
          triggerEvent: "Every morning after coffee, identify ONE micro-task that moves you toward your goal.",
          completed: false,
        },
        {
          phase: 3,
          title: "Aspirational Identity Lock",
          duration: "Days 21-30",
          actionableInstruction: `Establish a weekly review to lock-in your goal: "${userAnswers.goal || "growth"}". Match your daily activities against who you aspire to become.`,
          triggerEvent: "Every Sunday at 6 PM, review your radar alignment map and set three micro-goals.",
          completed: false,
        },
      ],
    },
    habits: [
      {
        id: "h_1",
        title: `45-min Deep Focus Block toward: "${userAnswers.goal || "Your Goal"}"`,
        category: "Discipline",
        completed: false,
      },
      {
        id: "h_2",
        title: `Read 10 pages of curated materials on gap: "${userAnswers.blocker || "Focus"}"`,
        category: "Learning",
        completed: false,
      },
      {
        id: "h_3",
        title: "Log reflection on daily behavioral blocker",
        category: "Confidence",
        completed: false,
      },
      {
        id: "h_4",
        title: "30-min metabolic energy recovery / exercise",
        category: "Health",
        completed: false,
      },
    ],
  };
}

const app = express();
const PORT = 3000;

// Enable CORS explicitly
app.use((req, res, next) => {
  const origin = req.headers.origin || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-session-id");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// User accounts now live in PostgreSQL (see db.ts) instead of an in-memory
// Map. initDb() creates the table and seeds the two demo accounts; it's
// awaited in startServer() before the app starts accepting requests.

// Admin stats: recent reflections
interface ReflectionRecord {
  userEmail: string;
  userName: string;
  recommendationTitle: string;
  liked: boolean;
  emotion: string;
  timestamp: string;
}
const recentReflections: ReflectionRecord[] = [
  {
    userEmail: "user@curator.ai",
    userName: "John Doe",
    recommendationTitle: "Atomic Habits",
    liked: true,
    emotion: "Inspired",
    timestamp: "12:04 PM",
  }
];

// Auth middleware helper — token is the user's email, looked up in Postgres.
const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "Missing or invalid authorization header. Please log in." });
  }
  const token = authHeader.substring(7);
  try {
    const user = await getUserByEmail(token);
    if (!user) {
      return res.status(401).json({ error: true, message: "Session expired or invalid user token." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("[authMiddleware] Postgres lookup failed:", err);
    return res.status(500).json({ error: true, message: "Server error while verifying session." });
  }
};

// Onboarding/demo session state now lives in Redis (see redis-sessions.ts)
// instead of an in-memory Map, so it survives restarts and expires cleanly
// via TTL instead of silently vanishing on every redeploy.

// Initialize Gemini SDK safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("Gemini init error:", err);
    return null;
  }
};

// =========================================================
// AUTH ENDPOINTS
// =========================================================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: "Name, email and password are required." });
    }
    if (await userExists(email)) {
      return res.status(400).json({ error: true, message: "Email already registered." });
    }
    const newUser: UserRecord = {
      id: "user_" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      password,
      isAdmin: false,
      alignmentScore: 70,
      recommendations: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakFreezesAvailable: 1,
    };
    await createUser(newUser);
    return res.json({
      token: email,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin, profile: newUser.profile, alignmentScore: newUser.alignmentScore }
    });
  } catch (error) {
    console.error("Error in /api/auth/signup:", error);
    return res.status(500).json({ error: true, message: "Server error during signup." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: true, message: "Email and password are required." });
    }
    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: true, message: "Invalid email or password." });
    }
    return res.json({
      token: email,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, profile: user.profile, alignmentScore: user.alignmentScore }
    });
  } catch (error) {
    console.error("Error in /api/auth/login:", error);
    return res.status(500).json({ error: true, message: "Server error during login." });
  }
});

// =========================================================
// AUTH: Google Sign-In
// =========================================================
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: true, message: "Missing Google credential." });
    }
    if (!googleClient || !GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        error: true,
        message: "Google Sign-In is not configured on the server. Set GOOGLE_CLIENT_ID in .env.",
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.warn("Google token verification failed:", verifyError);
      return res.status(401).json({ error: true, message: "Invalid or expired Google credential." });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ error: true, message: "Google account has no verified email." });
    }

    const email = payload.email;
    let user = await getUserByEmail(email);

    if (!user) {
      user = {
        id: "user_" + Math.random().toString(36).substring(2, 9),
        name: payload.name || email.split("@")[0],
        email,
        password: "",
        isAdmin: false,
        alignmentScore: 70,
        recommendations: [],
        picture: payload.picture,
        authProvider: "google",
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakFreezesAvailable: 1,
      };
      await createUser(user);
    } else {
      // Keep profile fresh with latest Google name/picture on every sign-in
      user.name = payload.name || user.name;
      user.picture = payload.picture || user.picture;
      user.authProvider = "google";
      await updateUser(user);
    }

    return res.json({
      token: email,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        picture: user.picture,
        profile: user.profile,
        alignmentScore: user.alignmentScore,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/google:", error);
    return res.status(500).json({ error: true, message: "Google sign-in failed. Please try again." });
  }
});

// =========================================================
// FEATURE 1: POST /api/onboarding
// =========================================================
app.post("/api/onboarding", async (req, res) => {
  try {
    const { answers } = req.body || {};
    if (!answers || !answers.goal || !answers.blocker) {
      return res.status(400).json({
        error: true,
        message: "Missing onboarding answers. Please answer all questions.",
      });
    }

    const goal = answers.goal || "";
    const blocker = answers.blocker || "";

    let profile: Profile | null = null;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `
Analyse this user's personal growth onboarding responses:
- Future Self / Goal: "${goal}"
- Main Blocker / Challenge: "${blocker}"

Extract a structured personal growth profile JSON:
1. aspirationalTraits: 3 concise traits of who they want to become based on their goal (e.g., ["Disciplined", "Curious", "Leader"]).
2. behaviorTraits: 2-3 current behavior patterns, struggles, or blockers (e.g., ["Procrastinates", "Distracted", "Lacks focus"]).
3. gapTheme: A single primary theme representing their biggest growth opportunity (must be one of: "Discipline", "Learning", "Confidence", "Leadership", "Health").
4. radarScores: A map of 5 identity dimensions (must include Discipline, Learning, Confidence, Leadership, Health) with "current" (0-100) and "goal" (0-100) numerical scores reflecting where they are vs where they want to be based on their goal and blocker.

Return strictly JSON matching this structure.
`;

        const responsePromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                aspirationalTraits: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                behaviorTraits: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                gapTheme: {
                  type: Type.STRING,
                  enum: ["Discipline", "Learning", "Confidence", "Leadership", "Health"],
                },
                radarScores: {
                  type: Type.OBJECT,
                  properties: {
                    Discipline: {
                      type: Type.OBJECT,
                      properties: {
                        current: { type: Type.NUMBER },
                        goal: { type: Type.NUMBER },
                      },
                      required: ["current", "goal"],
                    },
                    Learning: {
                      type: Type.OBJECT,
                      properties: {
                        current: { type: Type.NUMBER },
                        goal: { type: Type.NUMBER },
                      },
                      required: ["current", "goal"],
                    },
                    Confidence: {
                      type: Type.OBJECT,
                      properties: {
                        current: { type: Type.NUMBER },
                        goal: { type: Type.NUMBER },
                      },
                      required: ["current", "goal"],
                    },
                    Leadership: {
                      type: Type.OBJECT,
                      properties: {
                        current: { type: Type.NUMBER },
                        goal: { type: Type.NUMBER },
                      },
                      required: ["current", "goal"],
                    },
                    Health: {
                      type: Type.OBJECT,
                      properties: {
                        current: { type: Type.NUMBER },
                        goal: { type: Type.NUMBER },
                      },
                      required: ["current", "goal"],
                    },
                  },
                  required: ["Discipline", "Learning", "Confidence", "Leadership", "Health"],
                },
              },
              required: ["aspirationalTraits", "behaviorTraits", "gapTheme", "radarScores"],
            },
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API call timed out")), 5000)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.aspirationalTraits && parsed.gapTheme && parsed.radarScores) {
            profile = parsed;
          }
        }
      } catch (geminiError) {
        console.warn("Gemini onboarding extraction failed or timed out, using fallback:", geminiError);
      }
    }

    // Fallback profile if Gemini is unavailable or failed
    if (!profile) {
      const isAI = goal.toLowerCase().includes("ai") || goal.toLowerCase().includes("engineer") || goal.toLowerCase().includes("code");
      const gapTheme = blocker.toLowerCase().includes("procrastinat") || blocker.toLowerCase().includes("phone") || blocker.toLowerCase().includes("distract")
        ? "Discipline"
        : isAI ? "Learning" : "Confidence";

      profile = {
        aspirationalTraits: [
          isAI ? "Systemic Builder" : "Focused Innovator",
          "Relentless Executor",
          "Mindful Leader",
        ],
        behaviorTraits: [
          blocker ? blocker.slice(0, 40) : "Lack of focus",
          goal ? "Working toward: " + goal.slice(0, 30) : "Growth mindset",
        ],
        gapTheme: gapTheme,
        radarScores: {
          Discipline: { current: gapTheme === "Discipline" ? 30 : 45, goal: 90 },
          Learning: { current: isAI ? 65 : 55, goal: 95 },
          Confidence: { current: 50, goal: 85 },
          Leadership: { current: 25, goal: 80 },
          Health: { current: 40, goal: 75 },
        },
      };
    }

    // Sync to user if authenticated
    const authHeader = req.headers["authorization"];
    let userEmail = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const userRecord = await getUserByEmail(token);
      if (userRecord) {
        userRecord.profile = profile;
        userRecord.alignmentScore = 70;
        userEmail = userRecord.email;
        await updateUser(userRecord);
        await recordActivity(userEmail);
      }
    }

    // Generate new sessionId
    const sessionId = crypto.randomUUID();
    await setSession(sessionId, {
      userEmail,
      profile,
      recommendations: [],
      alignmentScore: 70,
    });

    return res.json({ sessionId, profile });
  } catch (error) {
    console.error("Error in /api/onboarding:", error);
    return res.status(500).json({
      error: true,
      message: "Something went wrong during onboarding. Please try again.",
    });
  }
});

const TOPIC_SUGGESTIONS = {
  goal: [
    "🚀 Tech Founder & Systems Architect",
    "🧘 Mindful & Disciplined Leader",
    "🎨 High-Impact Creative Director",
    "⚡ Focused High-Performance Engineer",
  ],
  goodHabit: [
    "📚 Daily deep reading (30 mins)",
    "🏃 Morning workouts & hydration",
    "🧘 Meditation & evening journaling",
    "⚡ Focused 90-min deep work blocks",
  ],
  badHabit: [
    "📱 Nighttime social media doomscrolling",
    "☕ Reactive email & notification checking",
    "⏳ Procrastinating complex leverage work",
    "💤 Irregular sleep schedule & late browsing",
  ],
  blocker: [
    "🧠 Overthinking and fear of failure",
    "🎯 Distractions and difficulty keeping focus",
    "⏰ Poor time structure & lack of routine",
    "🔋 Energy slumps and decision fatigue",
  ],
};

// =========================================================
// FEATURE 1.5: POST /api/onboarding/chat [NEW]
// =========================================================
app.post("/api/onboarding/chat", async (req, res) => {
  try {
    const { messages, currentTopic, followUpCount: rawFollowUpCount } = req.body || {};
    if (!messages || !currentTopic) {
      return res.status(400).json({ error: true, message: "Missing conversation state." });
    }

    const latestUserMessage = messages[messages.length - 1];
    if (!latestUserMessage || latestUserMessage.sender !== "user") {
      return res.status(400).json({ error: true, message: "Missing user message." });
    }

    const userResponse = latestUserMessage.text || "";
    const ai = getGeminiClient();

    // At most one depth-probing follow-up per topic, so the conversation
    // can never loop forever waiting for a "good enough" answer.
    const MAX_FOLLOWUPS = 1;
    const followUpCount = Math.max(0, Number(rawFollowUpCount) || 0);
    const followUpAvailable = followUpCount < MAX_FOLLOWUPS;

    let validationResult: { isValid: boolean; nextTopic: string; reply: string; needsFollowUp?: boolean } = {
      isValid: false,
      nextTopic: currentTopic,
      reply: "",
    };

    console.log(`[Onboarding Chat] Topic: ${currentTopic}, followUpCount: ${followUpCount}, User Input: "${userResponse}", Gemini Key Present: ${!!process.env.GEMINI_API_KEY}`);

    if (ai) {
      try {
        const validationPrompt = `
You are the Peak AI conversational onboarding agent. You ask sharp, specific
questions — not a form. Your job is to get answers with real substance, not
generic filler, without dragging the conversation out.

Evaluate the user's latest response for the topic "${currentTopic}".

The topics are:
- "goal": Who do they want to become? What's their main aspiration? (e.g. career, mindset, skill)
- "blocker": What is holding them back? Their main obstacle or challenge?

Full conversation so far (oldest to newest):
${messages.map((m: any) => `${m.sender === "ai" ? "AI" : "User"}: ${m.text}`).join("\n")}

User's latest response: "${userResponse}"

Classify this response into exactly one status:

1. "invalid" — the response is not a real attempt to answer:
   - Too short (under ~5 characters), a single word like "a", "x", "no", "none".
   - Keyboard mash or garbage (e.g. "asdf", "abc++", "re=").
   - Completely off-topic (e.g. asked about goals, they say "apples").

2. "followup"${followUpAvailable ? "" : " — NOT AVAILABLE this turn, do not use it, treat borderline answers as \"advance\" instead"} — the response is valid and on-topic, but shallow, generic, or vague:
   generic buzzwords with no personal specifics ("be successful", "be better",
   "stop procrastinating", "laziness"), no concrete detail, name, number,
   timeframe, or example that makes it clearly THEIRS. ${followUpAvailable ? `Only use this if a
   sharper follow-up would meaningfully improve the profile we build from it — and
   only once per topic (this is the first and only chance for this topic).` : ""}

3. "advance" — the response is valid and specific enough to build a real profile
   from (has a concrete detail, example, name, or number), OR it's a reasonable
   answer and depth-probing is not available this turn.

Behavior per status:

- If "invalid":
  - isValid = false, nextTopic = "${currentTopic}" (same topic).
  - reply: polite, brief, explains it was too short/off-topic/garbled, and
    re-asks the original question for this topic in your own words.

- If "followup":
  - isValid = true, nextTopic = "${currentTopic}" (same topic, stay here).
  - needsFollowUp = true.
  - reply: FIRST briefly acknowledge what they said (don't repeat it verbatim),
    THEN ask ONE sharp, personalized follow-up question that references their
    actual words and pushes for a concrete specific — e.g. a real example, a
    number, a timeframe, a name, or "what does that look like day to day".
    Keep it warm and short (1-2 sentences). Do NOT ask a generic "tell me more".

- If "advance":
  - isValid = true, needsFollowUp = false.
  - If currentTopic is "goal", nextTopic is "blocker".
  - If currentTopic is "blocker", nextTopic is "complete".
  - reply: write this yourself, in your own words, every time — do NOT reuse
    a stock phrase. First react specifically to what THEY just said (quote or
    paraphrase a real detail from their answer, not a generic "nice!"), then
    ask the next topic's question in a fresh way. The next topic's question
    should cover:
      * blocker → what's mainly holding them back right now (obstacles, challenges, habits)
      * complete → no question, just a short closing line that you have
        enough to map their identity radar chart
    Vary your sentence structure and opening word from turn to turn (check
    the conversation history above and do NOT start your reply the same way
    twice, and do NOT phrase the question identically to how it was asked
    earlier in the conversation). Sound like a sharp, attentive person
    reacting in real time, not a form reading out its next field.

Return strictly JSON:
{
  "isValid": boolean,
  "needsFollowUp": boolean,
  "nextTopic": "goal" | "goodHabit" | "badHabit" | "blocker" | "complete",
  "reply": "text"
}
`;

        const response = await ai.models.generateContent({
          // This call fires on every single onboarding turn, so latency
          // matters most here — Flash-Lite is built for exactly this: a
          // short classify-and-reply task, at a fraction of the latency of
          // the full Flash model used for the heavier profile/recommendation
          // calls elsewhere in this file.
          model: "gemini-3.5-flash-lite",
          contents: validationPrompt,
          config: {
            // Higher temperature here on purpose — this call writes
            // conversational phrasing, not facts, so we want variety
            // instead of the same wording every turn.
            temperature: 0.9,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValid: { type: Type.BOOLEAN },
                needsFollowUp: { type: Type.BOOLEAN },
                nextTopic: { type: Type.STRING },
                reply: { type: Type.STRING },
              },
              required: ["isValid", "needsFollowUp", "nextTopic", "reply"],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          // Hard safety net: never allow a follow-up loop past the cap,
          // regardless of what the model decided.
          if (parsed.needsFollowUp && !followUpAvailable) {
            parsed.needsFollowUp = false;
          }
          validationResult = parsed;
          console.log(`[Onboarding Chat] Gemini Validation Decided: isValid=${validationResult.isValid}, needsFollowUp=${validationResult.needsFollowUp}, nextTopic=${validationResult.nextTopic}`);
        }
      } catch (geminiError) {
        console.warn("Gemini validation failed, using fallback:", geminiError);
      }
    }

    // Fallback validation logic if Gemini is offline/disabled
    if (!validationResult.reply) {
      const clean = userResponse.trim();
      const isSuggestion = Object.values(TOPIC_SUGGESTIONS).flat().some(
        (s) => s.toLowerCase() === clean.toLowerCase()
      );

      // Check validation rules
      let isCoherent = true;
      if (clean.length < 5) isCoherent = false;
      if (/[=+$*%#@]/.test(clean)) isCoherent = false;
      if (clean.toLowerCase().includes("asdf") || clean.toLowerCase().includes("qwerty")) isCoherent = false;

      // Crude shallowness heuristic for the no-AI fallback: short word count
      // and no digits/specific-sounding tokens.
      const wordCount = clean.split(/\s+/).filter(Boolean).length;
      const looksShallow = isCoherent && !isSuggestion && wordCount < 4 && !/\d/.test(clean);

      if (!isCoherent && !isSuggestion) {
        validationResult = {
          isValid: false,
          nextTopic: currentTopic,
          reply: `I'd love to help you map your identity, but that response seems a bit brief or invalid. Could you tell me more about your ${currentTopic === "goal" ? "aspirations" : currentTopic === "goodHabit" ? "daily routines" : currentTopic === "badHabit" ? "distractions" : "obstacles"}?`,
        };
      } else if (looksShallow && followUpAvailable) {
        const probes: Record<string, string> = {
          goal: "Got it — can you make that concrete? Give me one specific example of what that looks like in your daily life.",
          goodHabit: "Nice — how often do you actually do it, and what triggers it?",
          badHabit: "Understood — when does it usually happen, and what tends to set it off?",
          blocker: "That's real — can you give me one recent moment where that got in your way?",
        };
        validationResult = {
          isValid: true,
          nextTopic: currentTopic,
          needsFollowUp: true,
          reply: probes[currentTopic as keyof typeof probes] || "Can you be a bit more specific?",
        };
      } else {
        const flow = {
          goal: { next: "goodHabit", prompt: "What daily habit or quality are you proud of?" },
          goodHabit: { next: "badHabit", prompt: "What habit or distraction do you want to change?" },
          badHabit: { next: "blocker", prompt: "What main obstacle is holding you back right now?" },
          blocker: { next: "complete", prompt: "Fascinating. Let's build your identity chart!" },
        };
        const step = flow[currentTopic as keyof typeof flow];
        validationResult = {
          isValid: true,
          needsFollowUp: false,
          nextTopic: (step ? step.next : "complete") as any,
          reply: step ? step.prompt : "Proceeding...",
        };
      }
      console.log(`[Onboarding Chat] Fallback Heuristic Decided: isValid=${validationResult.isValid}, needsFollowUp=${validationResult.needsFollowUp}, nextTopic=${validationResult.nextTopic}`);
    }

    if (validationResult.nextTopic === "complete" && validationResult.isValid) {
      // Re-compile the onboarding answers from the messages log to build the profile
      const userAnswers = {
        goal: "",
        blocker: "",
      };

      // Find user responses
      const userResponses = messages
        .filter((m: any) => m.sender === "user")
        .map((m: any) => m.text);

      // Append the latest validated response
      userResponses.push(userResponse);

      userAnswers.goal = userResponses[0] || "";
      userAnswers.blocker = userResponses[1] || "";

      let profile: Profile | null = null;
      if (ai) {
        try {
          const extractionPrompt = `
Analyse this user's personal growth onboarding responses:
- Future Self / Goal: "${userAnswers.goal}"
- Main Blocker / Challenge: "${userAnswers.blocker}"

Extract a structured personal growth profile JSON:
1. aspirationalTraits: 3 concise traits of who they want to become based on their goal (e.g., ["Disciplined", "Curious", "Leader"]).
2. behaviorTraits: 2-3 current behavior patterns, struggles or blockers (e.g., ["Procrastinates", "Distracted", "Overwhelmed"]).
3. gapTheme: A single primary theme representing their biggest growth opportunity (must be one of: "Discipline", "Learning", "Confidence", "Leadership", "Health").
4. radarScores: A map of 5 identity dimensions (must include Discipline, Learning, Confidence, Leadership, Health) with "current" (0-100) and "goal" (0-100) numerical scores reflecting where they are vs where they want to be based on their goal and blocker.
5. roadmap: A 3-step actionable behavior-change roadmap. Must contain exactly 3 steps:
   - Step 1 (phase = 1, duration = "Days 1-7"): Blocker Deconstruction. Action plan focusing on resolving their blocker: "${userAnswers.blocker}".
   - Step 2 (phase = 2, duration = "Days 8-20"): Goal Alignment. Daily micro-actions toward their goal: "${userAnswers.goal}".
   - Step 3 (phase = 3, duration = "Days 21-30"): Identity Lock. Weekly review to align with their goal: "${userAnswers.goal}".
   Each step must have a title, actionableInstruction, triggerEvent, and completed = false.
6. habits: An array of exactly 4 daily habits custom-tailored to help them build their goal: "${userAnswers.goal}" and overcome blocker: "${userAnswers.blocker}". Each habit must have: id (h_1, h_2, h_3, h_4), title, category (must match one of Discipline, Learning, Confidence, Leadership, Health), and completed = false.

Return strictly JSON matching this structure.
`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: extractionPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  aspirationalTraits: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  behaviorTraits: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  gapTheme: { type: Type.STRING },
                  radarScores: {
                    type: Type.OBJECT,
                    properties: {
                      Discipline: {
                        type: Type.OBJECT,
                        properties: {
                          current: { type: Type.NUMBER },
                          goal: { type: Type.NUMBER },
                        },
                        required: ["current", "goal"],
                      },
                      Learning: {
                        type: Type.OBJECT,
                        properties: {
                          current: { type: Type.NUMBER },
                          goal: { type: Type.NUMBER },
                        },
                        required: ["current", "goal"],
                      },
                      Confidence: {
                        type: Type.OBJECT,
                        properties: {
                          current: { type: Type.NUMBER },
                          goal: { type: Type.NUMBER },
                        },
                        required: ["current", "goal"],
                      },
                      Leadership: {
                        type: Type.OBJECT,
                        properties: {
                          current: { type: Type.NUMBER },
                          goal: { type: Type.NUMBER },
                        },
                        required: ["current", "goal"],
                      },
                      Health: {
                        type: Type.OBJECT,
                        properties: {
                          current: { type: Type.NUMBER },
                          goal: { type: Type.NUMBER },
                        },
                        required: ["current", "goal"],
                      },
                    },
                    required: ["Discipline", "Learning", "Confidence", "Leadership", "Health"],
                  },
                  roadmap: {
                    type: Type.OBJECT,
                    properties: {
                      steps: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            phase: { type: Type.NUMBER },
                            title: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            actionableInstruction: { type: Type.STRING },
                            triggerEvent: { type: Type.STRING },
                            completed: { type: Type.BOOLEAN },
                          },
                          required: ["phase", "title", "duration", "actionableInstruction", "triggerEvent", "completed"],
                        },
                      },
                    },
                    required: ["steps"],
                  },
                  habits: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        category: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN },
                      },
                      required: ["id", "title", "category", "completed"],
                    },
                  },
                },
                required: ["aspirationalTraits", "behaviorTraits", "gapTheme", "radarScores", "roadmap", "habits"],
              },
            },
          });

          if (response.text) {
            profile = JSON.parse(response.text);
          }
        } catch (err) {
          console.warn("AI Profile compilation failed:", err);
        }
      }

      if (!profile) {
        // Fallback — builds from the user's actual answers instead of
        // returning the same fixed profile to everyone.
        profile = buildFallbackProfile(userAnswers);
      }

      // Sync to user if authenticated
      const authHeader = req.headers["authorization"];
      let userEmail = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const userRecord = await getUserByEmail(token);
        if (userRecord) {
          userRecord.profile = profile;
          userRecord.alignmentScore = 70;
          userEmail = userRecord.email;
          await updateUser(userRecord);
          await recordActivity(userEmail);
        }
      }

      const sessionId = crypto.randomUUID();
      await setSession(sessionId, {
        userEmail,
        profile,
        recommendations: [],
        alignmentScore: 70,
      });

      return res.json({
        isComplete: true,
        nextTopic: "complete",
        reply: validationResult.reply,
        isValid: true,
        sessionId,
        profile,
      });
    }

    return res.json({
      isComplete: false,
      nextTopic: validationResult.nextTopic,
      reply: validationResult.reply,
      isValid: validationResult.isValid,
      needsFollowUp: !!validationResult.needsFollowUp,
    });
  } catch (error) {
    console.error("Error in onboarding chat:", error);
    return res.status(500).json({ error: true, message: "Server error during onboarding." });
  }
});

// =========================================================

// =========================================================
// FEATURE 2: GET /api/recommendations?gapTheme={gapTheme}
// =========================================================
app.get("/api/recommendations", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    if (!sessionId) {
      return res.status(401).json({
        error: true,
        message: "Missing session ID. Please onboard first.",
      });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: true,
        message: "Session not found or expired. Please onboard again.",
      });
    }

    const gapTheme = (req.query.gapTheme as string) || session.profile.gapTheme || "Discipline";
    const ai = getGeminiClient();

    const TOTAL_COUNT = 6;
    const ANCHOR_COUNT = 2; // pulled from the verified curated library (real, checked URLs)
    const AI_COUNT = TOTAL_COUNT - ANCHOR_COUNT; // freshly generated, personalized

    // Curated resources matching this gapTheme, ranked — these have real,
    // human-verified URLs, so they anchor the list in accuracy.
    const matchedCurated = CURATED_RESOURCES.filter((resItem) =>
      resItem.tags.some((t) => t.toLowerCase().includes(gapTheme.toLowerCase())) ||
      resItem.title.toLowerCase().includes(gapTheme.toLowerCase()) ||
      resItem.description.toLowerCase().includes(gapTheme.toLowerCase())
    );
    let curatedPool: CuratedResource[] = matchedCurated.length > 0 ? matchedCurated : CURATED_RESOURCES;

    let recommendations: Recommendation[] = [];

    if (ai && session.profile) {
      try {
        // Give the model the widest identity gaps, not just labels — more
        // context in, more accurately targeted resources out.
        const radarGaps = Object.entries(session.profile.radarScores || {})
          .map(([dim, s]) => ({ dim, gap: s.goal - s.current }))
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 3)
          .map((g) => `${g.dim} (${g.gap} pt gap)`)
          .join(", ");

        const anchorTitles = curatedPool.slice(0, ANCHOR_COUNT).map((r) => r.title);

        // Ask for a small buffer above what we need — some candidates will
        // get filtered out by confidence, and we'd rather over-generate and
        // filter than fall short and pad with generic curated items.
        const CANDIDATE_COUNT = AI_COUNT + 2;

        const recommendationPrompt = `
You are the Peak AI personalization engine. Accuracy matters more than
volume — a wrong or half-remembered resource is worse than one fewer resource.

Generate up to ${CANDIDATE_COUNT} REAL, well-known, high-impact self-development resources (real books, real widely-known YouTube videos/channels, real published articles, real online courses, or real podcast episodes) to help this user bridge their identity gap.

User Profile:
- Aspirational identity traits: "${session.profile.aspirationalTraits.join(", ")}"
- Identified primary gap theme: "${gapTheme}"
- Widest current-vs-goal radar gaps: ${radarGaps || "not available"}
- Current behavior struggles: "${session.profile.behaviorTraits.join(", ")}"

Rules:
1. ONLY suggest resources you are confident actually exist, with the title, author/creator, and general content you remember being accurate. If you are not certain, leave it out entirely rather than guessing.
2. For each item, honestly self-rate "confidence" as "high" (certain this exact title/creator pairing is real and correct) or "medium" (fairly sure, some detail might be slightly off). If you'd rate something below "medium", do not include it at all.
3. Do NOT duplicate or closely overlap with these resources already being shown to the user: ${anchorTitles.length > 0 ? anchorTitles.join("; ") : "none"}.
4. Do NOT invent a URL — you will not be asked for one. Instead provide "creator" (the author for a book, channel/publisher for a video, or publication for an article) so we can link to it reliably.
5. Prioritize specificity: prefer a well-known book with a real author over a vague article; prefer a real named YouTube channel/creator over a generic description.
6. It is fine to return fewer than ${CANDIDATE_COUNT} items if you don't have that many you're truly confident about — do not pad with guesses to hit the count.

For each resource, return:
1. id: unique string (e.g. ai_1, ai_2)
2. title: Real title of the resource
3. creator: The real author, channel, publisher, or platform (e.g. "James Clear", "Huberman Lab", "Harvard Business Review")
4. description: Brief, accurate summary of what the resource actually covers and teaches — no invented specifics.
5. type: "Book", "Video", "Article", "Course", or "Podcast"
6. reason: A 1-sentence personalized justification explaining why this resource is curated for THIS user's specific gap, referencing their gap theme or radar gap directly.
7. confidence: "high" or "medium" as defined above.

Return strictly JSON:
{
  "recommendations": [
    {
      "id": "string",
      "title": "string",
      "creator": "string",
      "description": "string",
      "type": "Book" | "Video" | "Article" | "Course" | "Podcast",
      "reason": "string",
      "confidence": "high" | "medium"
    }
  ]
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: recommendationPrompt,
          config: {
            // Lower temperature = less creative invention, more reliance on
            // well-known real resources — directly targets the "not
            // accurate" complaint rather than just the URL problem.
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      creator: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      confidence: { type: Type.STRING },
                    },
                    required: ["id", "title", "creator", "description", "type", "reason", "confidence"],
                  },
                },
              },
              required: ["recommendations"],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          const aiItems = (parsed.recommendations || []) as any[];

          // Drop anything the model itself wasn't confident about — accuracy
          // over volume. A shortfall here gets backfilled from the verified
          // curated library below, never with a low-confidence guess.
          const confidentItems = aiItems.filter(
            (item) => item && (item.confidence === "high" || item.confidence === "medium")
          );

          const aiRecommendations: Recommendation[] = confidentItems.slice(0, AI_COUNT).map((item, i) => ({
            id: `ai_${crypto.randomUUID().slice(0, 8)}_${i}`,
            title: item.title,
            description: item.description,
            type: item.type,
            url: buildResourceSearchUrl(item.type, item.title, item.creator),
            reason: item.reason,
          }));

          // Anchor with verified curated resources first, avoiding title overlap
          const aiTitlesLower = aiRecommendations.map((r) => r.title.toLowerCase());
          const anchors = curatedPool
            .filter((r) => !aiTitlesLower.some((t) => t.includes(r.title.toLowerCase()) || r.title.toLowerCase().includes(t)))
            .slice(0, ANCHOR_COUNT)
            .map((resItem) => ({
              id: resItem.id,
              title: resItem.title,
              description: resItem.description,
              type: resItem.type,
              url: resItem.url,
              reason: resItem.defaultReason,
            }));

          recommendations = [...anchors, ...aiRecommendations];

          // If low confidence filtered out too many AI items, top up with
          // more verified curated resources instead of shipping a short list.
          if (recommendations.length < TOTAL_COUNT) {
            const usedTitlesLower = recommendations.map((r) => r.title.toLowerCase());
            const usedIds = new Set(recommendations.map((r) => r.id));
            const topUp = CURATED_RESOURCES.filter(
              (r) => !usedIds.has(r.id) && !usedTitlesLower.includes(r.title.toLowerCase())
            )
              .slice(0, TOTAL_COUNT - recommendations.length)
              .map((resItem) => ({
                id: resItem.id,
                title: resItem.title,
                description: resItem.description,
                type: resItem.type,
                url: resItem.url,
                reason: resItem.defaultReason,
              }));
            recommendations = [...recommendations, ...topUp];
          }
        }
      } catch (geminiError) {
        console.warn("Gemini dynamic recommendations failed, using fallback:", geminiError);
      }
    }

    // Fallback: fully curated (verified URLs) if Gemini failed, was disabled, or returned nothing
    // Ensure diverse content types (books, videos, courses) for better user experience
    if (recommendations.length === 0) {
      let selectedResources: CuratedResource[] = [];
      
      // Try to get a mix of content types
      const videos = curatedPool.filter(r => r.type === 'Video');
      const books = curatedPool.filter(r => r.type === 'Book');
      const courses = curatedPool.filter(r => r.type === 'Course');
      const others = curatedPool.filter(r => !['Video', 'Book', 'Course'].includes(r.type));
      
      // Aim for 3 videos, 2 books, 1 course/other
      selectedResources.push(...videos.slice(0, 3));
      selectedResources.push(...books.slice(0, 2));
      selectedResources.push(...courses.slice(0, 1));
      
      // Fill remaining slots if needed
      if (selectedResources.length < TOTAL_COUNT) {
        const usedIds = new Set(selectedResources.map(r => r.id));
        const remaining = curatedPool.filter(r => !usedIds.has(r.id));
        selectedResources.push(...remaining.slice(0, TOTAL_COUNT - selectedResources.length));
      }
      
      // If still not enough, pull from all resources
      if (selectedResources.length < TOTAL_COUNT) {
        const usedIds = new Set(selectedResources.map(r => r.id));
        const remaining = CURATED_RESOURCES.filter(r => !usedIds.has(r.id));
        selectedResources.push(...remaining.slice(0, TOTAL_COUNT - selectedResources.length));
      }

      recommendations = selectedResources.slice(0, TOTAL_COUNT).map((resItem) => ({
        id: resItem.id,
        title: resItem.title,
        description: resItem.description,
        type: resItem.type,
        url: resItem.url,
        reason: resItem.defaultReason,
      }));
    }

    // Cache in session
    session.recommendations = recommendations;
    await setSession(sessionId, session);
    return res.json(recommendations);
  } catch (error) {
    console.error("Error in /api/recommendations:", error);
    return res.status(500).json({
      error: true,
      message: "Unable to fetch recommendations. Please try again.",
    });
  }
});

// =========================================================
// FEATURE 3: POST /api/reflection
app.post("/api/reflection", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    if (!sessionId) {
      return res.status(401).json({
        error: true,
        message: "Missing session ID. Please onboard first.",
      });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: true,
        message: "Session not found or expired. Please onboard again.",
      });
    }

    const { recommendationId, liked, emotion } = req.body || {};
    const ai = getGeminiClient();

    if (!recommendationId) {
      return res.status(400).json({
        error: true,
        message: "Missing recommendationId.",
      });
    }

    // Verify recommendationId exists in curated list or active recommendations
    const exists =
      session.recommendations.some((r) => r.id === recommendationId) ||
      CURATED_RESOURCES.some((r) => r.id === recommendationId);

    if (!exists) {
      return res.status(404).json({
        error: true,
        message: "Recommendation not found.",
      });
    }

    // Adjust alignmentScore
    if (liked) {
      session.alignmentScore = Math.min(99, session.alignmentScore + 2);
    } else {
      session.alignmentScore = Math.max(10, session.alignmentScore - 1);
    }

    // Prepare radarScores (default if missing)
    let baseRadar = session.profile.radarScores;
    const gapTheme = session.profile.gapTheme || "Discipline";

    // Nudge matching radar dimension's current value
    const updatedRadar: Record<string, { current: number; goal: number }> = {};

    Object.keys(baseRadar).forEach((key) => {
      const dimension = baseRadar[key];
      let newCurrent = dimension.current;

      if (key.toLowerCase() === gapTheme.toLowerCase() || (liked && emotion === "Inspired")) {
        newCurrent = liked ? Math.min(dimension.goal, dimension.current + 3) : Math.max(10, dimension.current - 1);
      } else if (liked) {
        newCurrent = Math.min(dimension.goal, dimension.current + 1);
      }

      updatedRadar[key] = {
        current: newCurrent,
        goal: dimension.goal,
      };
    });

    // Update in session
    session.profile.radarScores = updatedRadar;

    // Sync alignmentScore and updatedRadar back to the user record in Postgres
    const authHeader = req.headers["authorization"];
    let userEmail = session.userEmail || "anonymous@curator.ai";
    let userName = "Anonymous";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const userRecord = await getUserByEmail(token);
      if (userRecord) {
        userRecord.alignmentScore = session.alignmentScore;
        userEmail = userRecord.email;
        userName = userRecord.name;
        // If Postgres has no profile yet, sync the full session profile now
        if (!userRecord.profile) {
          userRecord.profile = session.profile;
        } else {
          userRecord.profile.radarScores = updatedRadar;
          userRecord.profile.gapTheme = session.profile.gapTheme;
        }
        await updateUser(userRecord);
        await recordActivity(userRecord.email);
      }
    }

    await setSession(sessionId, session);

    // Add to recent reflections
    const matchedRec = session.recommendations.find((r) => r.id === recommendationId) || CURATED_RESOURCES.find((r) => r.id === recommendationId);
    recentReflections.push({
      userEmail,
      userName,
      recommendationTitle: matchedRec?.title || "Curated Moment",
      liked: !!liked,
      emotion: emotion || "Inspired",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    let feedback = `Your reflection on "${matchedRec?.title || 'this resource'}" is logged. Keep pushing towards your potential!`;
    if (ai && session.profile) {
      try {
        const feedbackPrompt = `
You are the Peak AI personal growth coach.
The user just reflected on a resource:
- Title: "${matchedRec?.title || 'Curated Resource'}"
- Liked Status: ${liked ? "Helped them a lot" : "Not relevant right now"}
- Selected Emotion: "${emotion}"

Write a warm, concise, 1-sentence coach response validating their feeling and encouraging them to keep mapping their identity.
`;
        const feedbackResp = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: feedbackPrompt,
        });
        if (feedbackResp.text && feedbackResp.text.trim()) {
          feedback = feedbackResp.text.trim();
        }
      } catch (err) {
        // fallback exists
      }
    }

    const response: ReflectionResponse = {
      alignmentScore: session.alignmentScore,
      updatedRadar: updatedRadar,
      feedback: feedback,
    };

    return res.json(response);
  } catch (error) {
    console.error("Error in /api/reflection:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to submit reflection. Please try again.",
    });
  }
});

// =========================================================
// FEATURE 3.5: POST /api/roadmap/step [NEW]
// =========================================================
app.post("/api/roadmap/step", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    if (!sessionId) {
      return res.status(401).json({ error: true, message: "Missing session ID." });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: true, message: "Session not found." });
    }

    const { stepPhase, reflectionText } = req.body || {};
    if (!stepPhase || !reflectionText) {
      return res.status(400).json({ error: true, message: "Missing stepPhase or reflectionText." });
    }

    let step: any = null;
    if (session.profile && session.profile.roadmap && session.profile.roadmap.steps) {
      step = session.profile.roadmap.steps.find((s: any) => s.phase === stepPhase);
    }

    if (!step) {
      return res.status(404).json({ error: true, message: "Roadmap step not found." });
    }

    const ai = getGeminiClient();
    let validationResult = {
      isValid: false,
      feedback: "",
    };

    if (ai) {
      try {
        const validationPrompt = `
You are the Peak AI personal growth coach.
Validate the user's reflection/proof of effort for this roadmap milestone.

Milestone:
- Phase: ${step.phase}
- Title: "${step.title}"
- Action Instruction: "${step.actionableInstruction}"
- Trigger Event: "${step.triggerEvent}"

User's response/reflection: "${reflectionText}"

Determine if this reflection shows a real, honest, and coherent attempt at practicing the trigger or action.
Mark it as invalid (isValid = false) if it is:
1. Too brief (e.g. less than 10 characters, or single words/phrases like "yes", "done", "i did it", "completed").
2. Total gibberish or random letters/keyboard mashing (e.g. "re=" or "asdfasdf").
3. Completely off-topic or avoids explaining how they actually resolved the urge.

If it is valid:
- Set isValid = true.
- Generate a warm, encouraging feedback response (feedback) praising their effort and highlighting how this directly aligns with building their aspirational self.

If it is invalid:
- Set isValid = false.
- Generate a polite critique (feedback) explaining why the response is insufficient, and ask them to reflect a bit more deeply on how they handled the urge or challenge.

Return strictly JSON:
{
  "isValid": boolean,
  "feedback": "AI Coach feedback text"
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: validationPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValid: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING },
              },
              required: ["isValid", "feedback"],
            },
          },
        });

        if (response.text) {
          validationResult = JSON.parse(response.text);
        }
      } catch (geminiError) {
        console.warn("Gemini roadmap validation failed, using fallback:", geminiError);
      }
    }

    // Fallback heuristic validation if Gemini fails/offline
    if (!validationResult.feedback) {
      const clean = reflectionText.trim();
      let isCoherent = true;
      if (clean.length < 15) isCoherent = false;
      if (/[=+$*%#@]/.test(clean)) isCoherent = false;
      if (clean.toLowerCase().includes("asdf") || clean.toLowerCase().includes("qwerty")) isCoherent = false;
      if (clean.toLowerCase() === "done" || clean.toLowerCase() === "completed" || clean.toLowerCase() === "yes") isCoherent = false;

      if (!isCoherent) {
        validationResult = {
          isValid: false,
          feedback: "Your reflection is too short or doesn't describe the action. Please explain in a brief sentence how you practiced this behavioral trigger.",
        };
      } else {
        validationResult = {
          isValid: true,
          feedback: "Great effort in practicing this trigger. Your reflection is valid! Keep pushing toward your aspirational self.",
        };
      }
    }

    if (!validationResult.isValid) {
      return res.json({
        isValid: false,
        feedback: validationResult.feedback,
        alignmentScore: session.alignmentScore,
        updatedRadar: session.profile.radarScores,
      });
    }

    // Mark the step as completed in session roadmap since it is valid
    step.completed = true;

    // Boost alignmentScore
    session.alignmentScore = Math.min(99, session.alignmentScore + 5);

    // Prepare radarScores (default if missing)
    let baseRadar = session.profile.radarScores;
    const gapTheme = session.profile.gapTheme || "Discipline";

    // Nudge matching radar dimension's current value by +8 points!
    const updatedRadar: Record<string, { current: number; goal: number }> = {};
    Object.keys(baseRadar).forEach((key) => {
      const dimension = baseRadar[key];
      let newCurrent = dimension.current;

      if (key.toLowerCase() === gapTheme.toLowerCase()) {
        newCurrent = Math.min(dimension.goal, dimension.current + 8);
      } else {
        newCurrent = Math.min(dimension.goal, dimension.current + 2);
      }

      updatedRadar[key] = {
        current: newCurrent,
        goal: dimension.goal,
      };
    });

    // Update in session
    session.profile.radarScores = updatedRadar;

    // Sync to user if authenticated
    const authHeader = req.headers["authorization"];
    let streakResult: Awaited<ReturnType<typeof recordActivity>> = undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const userRecord = await getUserByEmail(token);
      if (userRecord) {
        userRecord.alignmentScore = session.alignmentScore;
        if (userRecord.profile) {
          userRecord.profile.radarScores = updatedRadar;
          if (userRecord.profile.roadmap && userRecord.profile.roadmap.steps) {
            const userStep = userRecord.profile.roadmap.steps.find((s: any) => s.phase === stepPhase);
            if (userStep) {
              userStep.completed = true;
            }
          }
        }
        await updateUser(userRecord);
        streakResult = await recordActivity(userRecord.email);
      }
    }

    await setSession(sessionId, session);

    return res.json({
      isValid: true,
      feedback: validationResult.feedback,
      alignmentScore: session.alignmentScore,
      updatedRadar: updatedRadar,
      streak: streakResult
        ? {
            currentStreak: streakResult.currentStreak,
            longestStreak: streakResult.longestStreak,
            usedFreeze: streakResult.usedFreeze,
          }
        : null,
    });
  } catch (error) {
    console.error("Error in /api/roadmap/step:", error);
    return res.status(500).json({ error: true, message: "Failed to update roadmap step." });
  }
});

// =========================================================
// FEATURE 4: GET /api/history — the signed-in user's own reflection log
// and roadmap milestone timeline
// =========================================================
app.get("/api/history", authMiddleware, async (req: any, res) => {
  const user: UserRecord = req.user;

  // If user has no profile in Postgres, check their Redis session
  let profile = user.profile;
  const sessionId = req.headers["x-session-id"] as string;
  if (!profile && sessionId) {
    const session = await getSession(sessionId);
    if (session?.profile) {
      // Sync the session profile to Postgres so future requests work
      user.profile = session.profile;
      await updateUser(user);
      profile = session.profile;
    }
  }

  const reflections = recentReflections
    .filter((r) => r.userEmail === user.email)
    .slice()
    .reverse();

  const roadmapSteps = profile?.roadmap?.steps
    ? profile.roadmap.steps.slice().sort((a: any, b: any) => a.phase - b.phase)
    : [];

  return res.json({
    reflections,
    roadmapSteps,
    alignmentScore: user.alignmentScore,
    streak: {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakFreezesAvailable: user.streakFreezesAvailable,
      lastActiveDate: user.lastActiveDate,
    },
  });
});

// =========================================================
// FEATURE: GET /api/leaderboard/streaks — top current streaks, signed-in
// users only (email is shown, so this is authenticated rather than public).
// =========================================================
app.get("/api/leaderboard/streaks", authMiddleware, async (req: any, res) => {
  try {
    const top = await getTopStreaks(10);
    return res.json({ leaderboard: top });
  } catch (error) {
    console.error("Error in /api/leaderboard/streaks:", error);
    return res.status(500).json({ error: true, message: "Failed to load leaderboard." });
  }
});

// =========================================================
// FEATURE 5: GET /api/insights — derived analytics + AI narrative
// summarizing the signed-in user's growth trajectory
// =========================================================
app.get("/api/insights", authMiddleware, async (req: any, res) => {
  try {
    const user: UserRecord = req.user;

    // If user has no profile in Postgres, check their Redis session
    let profile = user.profile;
    const sessionId = req.headers["x-session-id"] as string;
    if (!profile && sessionId) {
      const session = await getSession(sessionId);
      if (session?.profile) {
        user.profile = session.profile;
        user.alignmentScore = session.alignmentScore ?? user.alignmentScore;
        await updateUser(user);
        profile = session.profile;
      }
    }

    const userReflections = recentReflections.filter((r) => r.userEmail === user.email);
    const likedCount = userReflections.filter((r) => r.liked).length;
    const dislikedCount = userReflections.length - likedCount;

    const emotionCounts: Record<string, number> = {};
    userReflections.forEach((r) => {
      emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1;
    });
    const topEmotion =
      Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const roadmapSteps = profile?.roadmap?.steps || [];
    const roadmapCompleted = roadmapSteps.filter((s: any) => s.completed).length;
    const roadmapTotal = roadmapSteps.length;

    // Biggest current-vs-goal gap dimension
    let widestGapDimension: string | null = null;
    let widestGapValue = -1;
    if (profile?.radarScores) {
      Object.entries(profile.radarScores).forEach(([dim, scores]: [string, any]) => {
        const gap = scores.goal - scores.current;
        if (gap > widestGapValue) {
          widestGapValue = gap;
          widestGapDimension = dim;
        }
      });
    }

    const { badges, badgeCount } = computeBadges(profile?.radarScores);

    const stats = {
      alignmentScore: user.alignmentScore,
      gapTheme: profile?.gapTheme || null,
      widestGapDimension,
      widestGapValue: widestGapValue >= 0 ? widestGapValue : null,
      totalReflections: userReflections.length,
      likedCount,
      dislikedCount,
      topEmotion,
      roadmapCompleted,
      roadmapTotal,
      habits: profile?.habits || [],
      radarScores: profile?.radarScores || {},
      streak: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        streakFreezesAvailable: user.streakFreezesAvailable,
      },
      badges,
      badgeCount,
    };

    let narrative = "";
    const ai = getGeminiClient();
    if (ai && profile) {
      try {
        const insightsPrompt = `
You are the Peak AI growth coach writing a short personalized insight for a user's dashboard.

User data:
- Alignment score: ${stats.alignmentScore}%
- Aspirational traits: ${(profile.aspirationalTraits || []).join(", ")}
- Current growth gap theme: ${stats.gapTheme}
- Widest current-vs-goal gap dimension: ${stats.widestGapDimension} (${stats.widestGapValue} points)
- Roadmap progress: ${stats.roadmapCompleted}/${stats.roadmapTotal} milestones completed
- Reflections logged: ${stats.totalReflections} (${stats.likedCount} resonated, ${stats.dislikedCount} didn't)
- Most common reflection emotion: ${stats.topEmotion || "not enough data yet"}

Write 2-3 warm, specific, encouraging sentences synthesizing this into one insight about their trajectory toward their aspirational identity. Be concrete, not generic. No greeting, no sign-off, just the insight text.
`;
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: insightsPrompt,
        });
        if (response.text && response.text.trim()) {
          narrative = response.text.trim();
        }
      } catch (err) {
        console.warn("Gemini insights narrative failed, using fallback:", err);
      }
    }

    if (!narrative) {
      if (!profile) {
        narrative = "Complete onboarding to start generating personalized insights about your growth trajectory.";
      } else if (stats.totalReflections === 0 && stats.roadmapCompleted === 0) {
        narrative = `You're mapped toward becoming ${((profile.aspirationalTraits || [])[0] || "your aspirational self")}. Your biggest opportunity right now is ${stats.widestGapDimension || stats.gapTheme}. Engage with a recommendation or roadmap step to start building momentum.`;
      } else {
        narrative = `You're at ${stats.alignmentScore}% alignment with ${stats.roadmapCompleted}/${stats.roadmapTotal} roadmap milestones done. ${stats.likedCount > stats.dislikedCount ? "Most of what you've engaged with has resonated" : "Your reflections show mixed resonance so far"} — keep closing the gap in ${stats.widestGapDimension || stats.gapTheme} for the fastest movement toward your goal identity.`;
      }
    }

    return res.json({ ...stats, narrative });
  } catch (error) {
    console.error("Error in /api/insights:", error);
    return res.status(500).json({ error: true, message: "Failed to compute insights." });
  }
});

// =========================================================
// ADMIN & DASHBOARD STATS ENDPOINTS
// =========================================================
app.get("/api/admin/stats", authMiddleware, async (req: any, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: true, message: "Access denied. Admins only." });
  }

  try {
    const allUsers = await getAllUsers();

    const distribution: Record<string, number> = {
      Discipline: 0,
      Learning: 0,
      Confidence: 0,
      Leadership: 0,
      Health: 0,
    };
    let totalScoreSum = 0;
    let usersWithScore = 0;
    const allUsersList: any[] = [];

    allUsers.forEach((u) => {
      if (u.profile?.gapTheme) {
        distribution[u.profile.gapTheme] = (distribution[u.profile.gapTheme] || 0) + 1;
      }
      totalScoreSum += u.alignmentScore;
      usersWithScore++;
      allUsersList.push({
        name: u.name,
        email: u.email,
        gapTheme: u.profile?.gapTheme || "Not Mapped Yet",
        alignmentScore: u.alignmentScore,
      });
    });

    const averageAlignmentScore = usersWithScore > 0 ? Math.round(totalScoreSum / usersWithScore) : 70;

    return res.json({
      totalUsers: allUsers.length,
      gapThemeDistribution: distribution,
      averageAlignmentScore,
      recentReflections: recentReflections.slice(-10).reverse(),
      allUsers: allUsersList,
    });
  } catch (error) {
    console.error("Error in /api/admin/stats:", error);
    return res.status(500).json({ error: true, message: "Failed to compute admin stats." });
  }
});

app.post("/api/admin/resources", authMiddleware, (req: any, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: true, message: "Access denied. Admins only." });
  }

  const { title, description, type, url, tags } = req.body || {};
  if (!title || !description || !type || !url || !tags) {
    return res.status(400).json({ error: true, message: "All resource properties (title, description, type, url, tags) are required." });
  }

  const newResource: CuratedResource = {
    id: "rec_custom_" + Math.random().toString(36).substring(2, 9),
    title,
    description,
    type: type as any,
    url,
    tags: Array.isArray(tags) ? tags : [tags],
    difficulty: "Intermediate",
    defaultReason: `This was specially added by Curator Admins to help target ${type} learners.`,
  };

  CURATED_RESOURCES.unshift(newResource);
  return res.json({ success: true });
});

// =========================================================
// USER PROFILE UPDATE ENDPOINT
// =========================================================
app.post("/api/profile/update", authMiddleware, async (req: any, res) => {
  try {
    const { bio, picture } = req.body || {};
    const userEmail = req.user.email;

    const user = await getUserByEmail(userEmail);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }

    if (bio !== undefined) {
      user.bio = bio;
    }
    if (picture !== undefined) {
      user.picture = picture;
    }

    await updateUser(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Error in /api/profile/update:", error);
    return res.status(500).json({ error: true, message: "Failed to update profile." });
  }
});

// =========================================================
// VITE MIDDLEWARE & SERVER STARTUP
// =========================================================
async function startServer() {
  await initDb();
  await initRedis();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Peak] Express + Vite server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
