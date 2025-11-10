import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { watchlist, type InsertWatchlist } from "../drizzle/schema";

/**
 * Add movie to watchlist with duplicate prevention
 * Returns { added: boolean, alreadyExists: boolean }
 */
export async function addToWatchlist(data: InsertWatchlist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already in watchlist
  const existing = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, data.userId), eq(watchlist.movieId, data.movieId)))
    .limit(1);

  if (existing.length > 0) {
    return { added: false, alreadyExists: true };
  }

  await db.insert(watchlist).values(data);
  return { added: true, alreadyExists: false };
}

/**
 * Get user's watchlist
 */
export async function getUserWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(watchlist)
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.createdAt));
}

/**
 * Check if movie is in watchlist
 */
export async function isInWatchlist(userId: number, movieId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)))
    .limit(1);

  return result.length > 0;
}

/**
 * Remove from watchlist
 */
export async function removeFromWatchlist(userId: number, movieId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)));
}

/**
 * Mark movie as watched
 */
export async function markAsWatched(userId: number, movieId: string, watched: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(watchlist)
    .set({ watched })
    .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)));
}

/**
 * Get watchlist count
 */
export async function getWatchlistCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(watchlist)
    .where(eq(watchlist.userId, userId));

  return result.length;
}
