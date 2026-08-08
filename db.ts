// ---------------------------------------------------------------------------
// PostgreSQL-backed user store.
//
// This replaces the old in-memory `Map<string, UserRecord>` (which was later
// patched to also dump itself to a `data/users.json` file on every write).
// That JSON-file approach worked for a single instance but doesn't survive
// container rebuilds/redeploys without a persistent volume, and doesn't work
// at all once you run more than one server instance. Postgres gives real,
// concurrent-safe, durable storage for accounts and their saved
// profile/roadmap/recommendations state.
// ---------------------------------------------------------------------------
import pg from "pg";
import type { Profile, Recommendation } from "./src/types/index.js";

const { Pool } = pg;

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  alignmentScore: number;
  profile?: Profile;
  recommendations: Recommendation[];
  picture?: string;
  bio?: string;
  authProvider?: "password" | "google";
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD, in UTC
  streakFreezesAvailable: number;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/curator_ai",
  connectionTimeoutMillis: 3000,
});

pool.on("error", (err) => {
  // A dropped idle connection shouldn't crash the whole server.
  console.error("[Postgres] Unexpected error on idle client:", err.message);
});

function rowToUser(row: any): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    isAdmin: row.is_admin,
    alignmentScore: row.alignment_score,
    profile: row.profile ?? undefined,
    recommendations: row.recommendations ?? [],
    picture: row.picture ?? undefined,
    bio: row.bio ?? undefined,
    authProvider: row.auth_provider ?? undefined,
    currentStreak: row.current_streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    lastActiveDate: row.last_active_date
      ? (row.last_active_date instanceof Date
          ? row.last_active_date.toISOString().slice(0, 10)
          : String(row.last_active_date).slice(0, 10))
      : null,
    streakFreezesAvailable: row.streak_freezes_available ?? 1,
  };
}

/**
 * Creates the users table if it doesn't exist yet, and seeds the two demo
 * accounts (admin@curator.ai / user@curator.ai) the app has always shipped
 * with — but only if they aren't already present, so re-running this on
 * every boot never overwrites real saved progress.
 */
let isPostgresAvailable = false;
const inMemoryUsers = new Map<string, UserRecord>();

export async function initDb(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id               TEXT PRIMARY KEY,
        name             TEXT NOT NULL,
        email            TEXT UNIQUE NOT NULL,
        password         TEXT NOT NULL DEFAULT '',
        is_admin         BOOLEAN NOT NULL DEFAULT false,
        alignment_score  INTEGER NOT NULL DEFAULT 70,
        profile          JSONB,
        recommendations  JSONB NOT NULL DEFAULT '[]'::jsonb,
        picture          TEXT,
        bio              TEXT,
        auth_provider    TEXT,
        current_streak         INTEGER NOT NULL DEFAULT 0,
        longest_streak          INTEGER NOT NULL DEFAULT 0,
        last_active_date        DATE,
        streak_freezes_available INTEGER NOT NULL DEFAULT 1,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // Migration safety: if the table already existed from a previous deploy
    // (before streaks existed), add the new columns without touching data.
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freezes_available INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    `);

    isPostgresAvailable = true;
    console.log("[Postgres] users table ready");
    await seedDemoUsers();
  } catch (err: any) {
    console.warn("[Postgres] Connection failed. Falling back to in-memory user store:", err.message || err);
    isPostgresAvailable = false;
    seedDemoUsersInMemory();
  }
}

function seedDemoUsersInMemory(): void {
  const demoUsers: UserRecord[] = [
    {
      id: "user_admin",
      name: "Admin Curator",
      email: "admin@curator.ai",
      password: "password",
      isAdmin: true,
      alignmentScore: 78,
      recommendations: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakFreezesAvailable: 1,
    },
    {
      id: "user_default",
      name: "John Doe",
      email: "user@curator.ai",
      password: "password",
      isAdmin: false,
      alignmentScore: 70,
      recommendations: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakFreezesAvailable: 1,
    },
  ];
  for (const u of demoUsers) {
    if (!inMemoryUsers.has(u.email)) {
      inMemoryUsers.set(u.email, u);
    }
  }
}

async function seedDemoUsers(): Promise<void> {
  const demoUsers: UserRecord[] = [
    {
      id: "user_admin",
      name: "Admin Curator",
      email: "admin@curator.ai",
      password: "password",
      isAdmin: true,
      alignmentScore: 78,
      recommendations: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakFreezesAvailable: 1,
    },
    {
      id: "user_default",
      name: "John Doe",
      email: "user@curator.ai",
      password: "password",
      isAdmin: false,
      alignmentScore: 70,
      recommendations: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakFreezesAvailable: 1,
    },
  ];

  for (const demoUser of demoUsers) {
    const existing = await getUserByEmail(demoUser.email);
    if (!existing) {
      await createUser(demoUser);
      console.log(`[Postgres] Seeded demo user ${demoUser.email}`);
    }
  }
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  if (!isPostgresAvailable) {
    return inMemoryUsers.get(email);
  }
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) return undefined;
  return rowToUser(result.rows[0]);
}

export async function userExists(email: string): Promise<boolean> {
  if (!isPostgresAvailable) {
    return inMemoryUsers.has(email);
  }
  const result = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  return (result.rowCount ?? 0) > 0;
}

export async function createUser(user: UserRecord): Promise<void> {
  if (!isPostgresAvailable) {
    inMemoryUsers.set(user.email, user);
    return;
  }
  await pool.query(
    `INSERT INTO users
       (id, name, email, password, is_admin, alignment_score, profile, recommendations, picture, bio, auth_provider,
        current_streak, longest_streak, last_active_date, streak_freezes_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (email) DO NOTHING`,
    [
      user.id,
      user.name,
      user.email,
      user.password,
      user.isAdmin,
      user.alignmentScore,
      user.profile ? JSON.stringify(user.profile) : null,
      JSON.stringify(user.recommendations || []),
      user.picture || null,
      user.bio || null,
      user.authProvider || null,
      user.currentStreak ?? 0,
      user.longestStreak ?? 0,
      user.lastActiveDate ?? null,
      user.streakFreezesAvailable ?? 1,
    ]
  );
}

/** Full upsert of a user record — used any time we mutate fields on an
 * already-fetched UserRecord (profile, alignmentScore, roadmap progress, etc)
 * and need to write it back. */
export async function updateUser(user: UserRecord): Promise<void> {
  if (!isPostgresAvailable) {
    inMemoryUsers.set(user.email, user);
    return;
  }
  await pool.query(
    `UPDATE users SET
       name = $2,
       password = $3,
       is_admin = $4,
       alignment_score = $5,
       profile = $6,
       recommendations = $7,
       picture = $8,
       bio = $9,
       auth_provider = $10,
       current_streak = $11,
       longest_streak = $12,
       last_active_date = $13,
       streak_freezes_available = $14
     WHERE email = $1`,
    [
      user.email,
      user.name,
      user.password,
      user.isAdmin,
      user.alignmentScore,
      user.profile ? JSON.stringify(user.profile) : null,
      JSON.stringify(user.recommendations || []),
      user.picture || null,
      user.bio || null,
      user.authProvider || null,
      user.currentStreak ?? 0,
      user.longestStreak ?? 0,
      user.lastActiveDate ?? null,
      user.streakFreezesAvailable ?? 1,
    ]
  );
}

export async function getAllUsers(): Promise<UserRecord[]> {
  if (!isPostgresAvailable) {
    return Array.from(inMemoryUsers.values());
  }
  const result = await pool.query("SELECT * FROM users ORDER BY email ASC");
  return result.rows.map(rowToUser);
}

export async function countUsers(): Promise<number> {
  if (!isPostgresAvailable) {
    return inMemoryUsers.size;
  }
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM users");
  return result.rows[0].count as number;
}

export async function getTopStreaks(limit: number = 10): Promise<Array<{ name: string; email: string; currentStreak: number; longestStreak: number }>> {
  if (!isPostgresAvailable) {
    const list = Array.from(inMemoryUsers.values())
      .sort((a, b) => b.currentStreak - a.currentStreak || b.longestStreak - a.longestStreak)
      .slice(0, limit);
    return list.map(u => ({
      name: u.name,
      email: u.email,
      currentStreak: u.currentStreak,
      longestStreak: u.longestStreak,
    }));
  }
  const result = await pool.query(
    "SELECT name, email, current_streak, longest_streak FROM users ORDER BY current_streak DESC, longest_streak DESC LIMIT $1",
    [limit]
  );
  return result.rows.map((row) => ({
    name: row.name,
    email: row.email,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
  }));
}

// ---------------------------------------------------------------------------
// Streak tracking.
//
// A "streak" counts consecutive calendar days (UTC) on which the user did a
// meaningful action — completing onboarding, submitting a reflection, or
// completing a roadmap step. Rules:
//   - Same day as last activity: no change (already counted today).
//   - Exactly one day after last activity: streak continues, +1.
//   - Exactly two days after (one day missed) AND a freeze is available:
//     the freeze is consumed and the streak continues instead of breaking.
//   - Anything else (bigger gap, or no freeze left): streak resets to 1.
// ---------------------------------------------------------------------------
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime()) / msPerDay);
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  streakFreezesAvailable: number;
  usedFreeze: boolean;
  streakBroken: boolean;
}

/** Call once per meaningful user action per day. Safe to call multiple times
 * the same day — only the first call of the day advances the streak. */
export async function recordActivity(email: string): Promise<StreakResult | undefined> {
  const user = await getUserByEmail(email);
  if (!user) return undefined;

  const today = todayUTC();

  if (user.lastActiveDate === today) {
    // Already recorded today — no-op, just report current state.
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakFreezesAvailable: user.streakFreezesAvailable,
      usedFreeze: false,
      streakBroken: false,
    };
  }

  let newStreak: number;
  let usedFreeze = false;
  let streakBroken = false;
  let freezesLeft = user.streakFreezesAvailable;

  if (!user.lastActiveDate) {
    newStreak = 1;
  } else {
    const gap = daysBetween(user.lastActiveDate, today);
    if (gap === 1) {
      newStreak = user.currentStreak + 1;
    } else if (gap === 2 && freezesLeft > 0) {
      newStreak = user.currentStreak + 1;
      freezesLeft -= 1;
      usedFreeze = true;
    } else {
      newStreak = 1;
      streakBroken = user.currentStreak > 0;
    }
  }

  const newLongest = Math.max(user.longestStreak, newStreak);

  user.currentStreak = newStreak;
  user.longestStreak = newLongest;
  user.lastActiveDate = today;
  user.streakFreezesAvailable = freezesLeft;
  await updateUser(user);

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    streakFreezesAvailable: freezesLeft,
    usedFreeze,
    streakBroken,
  };
}
