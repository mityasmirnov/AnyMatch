import { eq, and, sql, gt } from "drizzle-orm";
import { getDb } from "./db";
import { guestSessions, guestSwipes, type InsertGuestSession, type InsertGuestSwipe } from "../drizzle/schema";

/**
 * Generate a random 6-digit session code
 */
export function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a new guest session with 24-hour expiration
 */
export async function createGuestSession(): Promise<{ id: number; sessionCode: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sessionCode = generateSessionCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  const result = await db.insert(guestSessions).values({
    sessionCode,
    expiresAt,
  });

  return {
    id: Number((result as any).insertId),
    sessionCode,
  };
}

/**
 * Get a guest session by code (only if not expired)
 */
export async function getGuestSessionByCode(sessionCode: string) {
  const db = await getDb();
  if (!db) return null;

  const sessions = await db
    .select()
    .from(guestSessions)
    .where(
      and(
        eq(guestSessions.sessionCode, sessionCode),
        gt(guestSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return sessions.length > 0 ? sessions[0] : null;
}

/**
 * Record a guest swipe
 */
export async function recordGuestSwipe(swipe: Omit<InsertGuestSwipe, "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(guestSwipes).values(swipe);
}

/**
 * Get all swipes for a guest session
 */
export async function getGuestSessionSwipes(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guestSwipes)
    .where(eq(guestSwipes.sessionId, sessionId));
}

/**
 * Get swipes for a specific guest in a session
 */
export async function getGuestSwipes(sessionId: number, guestIdentifier: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guestSwipes)
    .where(
      and(
        eq(guestSwipes.sessionId, sessionId),
        eq(guestSwipes.guestIdentifier, guestIdentifier)
      )
    );
}

/**
 * Find matches in a guest session
 * Returns movies that all participants liked (swiped right or up)
 */
export async function findGuestMatches(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all swipes for the session
  const swipes = await getGuestSessionSwipes(sessionId);

  // Get unique guest identifiers
  const guestSet = new Set(swipes.map((s: any) => s.guestIdentifier));
  const guests = Array.from(guestSet);
  
  if (guests.length < 2) {
    // Need at least 2 guests to have matches
    return [];
  }

  // Group swipes by movie
  const movieSwipes = new Map<string, typeof swipes>();
  for (const swipe of swipes) {
    if (!movieSwipes.has(swipe.movieId)) {
      movieSwipes.set(swipe.movieId, []);
    }
    movieSwipes.get(swipe.movieId)!.push(swipe);
  }

  // Find movies where all guests liked it
  const matches: Array<{
    movieId: string;
    movieTitle: string;
    moviePoster: string | null;
    movieType: "movie" | "tv";
    movieGenres: number[] | null;
    movieRating: number | null;
    matchedBy: string[];
  }> = [];

  for (const [movieId, swipesForMovie] of Array.from(movieSwipes.entries())) {
    // Check if all guests swiped on this movie
    const guestsWhoSwiped = new Set(swipesForMovie.map((s: any) => s.guestIdentifier));
    
    // Check if all swipes were positive (right or up)
    const allLiked = swipesForMovie.every((s: any) => s.direction === "right" || s.direction === "up");
    
    // Match if all guests who swiped liked it and at least 2 guests swiped
    if (allLiked && guestsWhoSwiped.size >= 2) {
      const firstSwipe = swipesForMovie[0];
      matches.push({
        movieId,
        movieTitle: firstSwipe.movieTitle,
        moviePoster: firstSwipe.moviePoster,
        movieType: firstSwipe.movieType,
        movieGenres: firstSwipe.movieGenres as number[] | null,
        movieRating: firstSwipe.movieRating,
        matchedBy: Array.from(guestsWhoSwiped) as string[],
      });
    }
  }

  return matches;
}

/**
 * Get participant count for a session
 */
export async function getGuestSessionParticipantCount(sessionId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const swipes = await getGuestSessionSwipes(sessionId);
  const uniqueGuests = new Set(swipes.map(s => s.guestIdentifier));
  return uniqueGuests.size;
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions() {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(guestSessions)
    .where(sql`${guestSessions.expiresAt} < NOW()`);
}
