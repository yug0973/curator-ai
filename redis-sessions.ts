// ---------------------------------------------------------------------------
// Redis-backed onboarding/demo session store.
//
// This replaces the old in-memory `Map<string, SessionData>`. That Map was
// never persisted anywhere, so every server restart silently dropped every
// active session — the exact "session expired or invalid" symptom this app
// was built to fix for the *users* Map never got fixed for *sessions*.
// Redis gives us a real store that survives restarts, and its native TTL
// support means an expired session now fails with a real, honest "please
// onboard again" instead of quietly resetting on every deploy.
// ---------------------------------------------------------------------------
import { createClient, type RedisClientType } from "redis";
import type { Profile, Recommendation } from "./src/types/index.js";

export interface SessionData {
  userEmail?: string;
  profile: Profile;
  recommendations: Recommendation[]; // cached so IDs stay stable
  alignmentScore: number;
}

// How long an onboarding/demo session stays alive with no activity.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const inMemorySessions = new Map<string, SessionData>();
let isRedisAvailable = false;

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: false,
  }
});

redisClient.on("error", (err) => {
  console.error("[Redis] Client error:", err.message || err);
});

let connected = false;

export async function initRedis(): Promise<void> {
  if (connected) return;
  try {
    await redisClient.connect();
    connected = true;
    isRedisAvailable = true;
    console.log("[Redis] Connected");
  } catch (err: any) {
    console.warn("[Redis] Connection failed. Falling back to in-memory session store:", err.message || err);
    isRedisAvailable = false;
  }
}

function sessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

export async function getSession(sessionId: string): Promise<SessionData | undefined> {
  if (!isRedisAvailable) {
    return inMemorySessions.get(sessionId);
  }
  try {
    const raw = await redisClient.get(sessionKey(sessionId));
    if (!raw) return undefined;
    return JSON.parse(raw) as SessionData;
  } catch (err) {
    console.error("[Redis] Failed to get session, falling back to memory:", err);
    return inMemorySessions.get(sessionId);
  }
}

/** Writes (or refreshes the TTL of) a session. Since SessionData objects are
 * mutated in place by route handlers before being written back, always call
 * this after mutating a session you got from getSession(). */
export async function setSession(sessionId: string, data: SessionData): Promise<void> {
  if (!isRedisAvailable) {
    inMemorySessions.set(sessionId, data);
    return;
  }
  try {
    await redisClient.set(sessionKey(sessionId), JSON.stringify(data), {
      EX: SESSION_TTL_SECONDS,
    });
  } catch (err) {
    console.error("[Redis] Failed to set session, saving to memory:", err);
    inMemorySessions.set(sessionId, data);
  }
}
