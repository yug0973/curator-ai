export interface RadarDimension {
  current: number;
  goal: number;
}

export interface Profile {
  aspirationalTraits: string[];
  behaviorTraits: string[];
  gapTheme: string;
  radarScores: Record<string, RadarDimension>;
  roadmap?: Roadmap;
  habits?: DailyHabit[];
}

export interface OnboardingResponse {
  sessionId: string;
  profile: Profile;
}

export interface OnboardingAnswers {
  goal: string;
  goodHabit: string;
  badHabit: string;
  blocker: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  reason: string;
}

export interface ReflectionResponse {
  alignmentScore: number;
  updatedRadar: Record<string, RadarDimension>;
  feedback?: string;
}

export interface ApiError {
  error: true;
  message: string;
}

export interface DailyHabit {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  profile?: Profile;
  alignmentScore?: number;
  picture?: string;
  bio?: string;
  points?: number;
  badges?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ReflectionRecord {
  userEmail: string;
  userName: string;
  recommendationTitle: string;
  liked: boolean;
  emotion: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  gapThemeDistribution: Record<string, number>;
  averageAlignmentScore: number;
  recentReflections: ReflectionRecord[];
  allUsers: {
    name: string;
    email: string;
    gapTheme?: string;
    alignmentScore?: number;
  }[];
}

export interface ChatMessage {
  sender: "ai" | "user";
  text: string;
}

export interface OnboardingChatRequest {
  messages: ChatMessage[];
  currentTopic: "goal" | "goodHabit" | "badHabit" | "blocker";
  // How many depth-probing follow-ups have already been asked on this
  // topic. Capped at 1 server-side so the conversation can't loop forever.
  followUpCount?: number;
}

export interface OnboardingChatResponse {
  isComplete: boolean;
  nextTopic: "goal" | "goodHabit" | "badHabit" | "blocker";
  reply: string;
  isValid: boolean;
  // True when the answer was valid but shallow/generic — the AI is asking
  // a sharper, personalized follow-up on the SAME topic instead of moving
  // on. The client should keep currentTopic unchanged and bump its local
  // followUpCount when this is true.
  needsFollowUp?: boolean;
  sessionId?: string;
  profile?: Profile;
}

export interface RoadmapStep {
  phase: number;
  title: string;
  duration: string;
  actionableInstruction: string;
  triggerEvent: string;
  completed: boolean;
}

export interface Roadmap {
  steps: RoadmapStep[];
}

export interface RoadmapStepCompletionResponse {
  isValid: boolean;
  feedback: string;
  alignmentScore: number;
  updatedRadar: Record<string, RadarDimension>;
}

export interface HistoryResponse {
  reflections: ReflectionRecord[];
  roadmapSteps: RoadmapStep[];
  alignmentScore: number;
}

export interface InsightsResponse {
  alignmentScore: number;
  gapTheme: string | null;
  widestGapDimension: string | null;
  widestGapValue: number | null;
  totalReflections: number;
  likedCount: number;
  dislikedCount: number;
  topEmotion: string | null;
  roadmapCompleted: number;
  roadmapTotal: number;
  habits: DailyHabit[];
  radarScores: Record<string, RadarDimension>;
  narrative: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  gapTheme: string;
  duration: number; // days
  tasks: string[];
  points: number;
  badge: string;
}

export interface UserChallenge {
  challengeId: string;
  startDate: string;
  completedTasks: number[];
  isCompleted: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedDate: string;
  tags: string[];
  readTime: number;
  coverImage?: string;
}
