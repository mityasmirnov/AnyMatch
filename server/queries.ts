import { eq, and, inArray, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  userPreferences,
  groups,
  groupMembers,
  swipes,
  matches,
  savedMovies,
  notifications,
  InsertUserPreference,
  InsertGroup,
  InsertGroupMember,
  InsertSwipe,
  InsertMatch,
  InsertSavedMovie,
  InsertNotification,
} from "../drizzle/schema";

// ============= User Preferences =============

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result[0] || null;
}

export async function upsertUserPreferences(data: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userPreferences).values(data).onDuplicateKeyUpdate({
    set: {
      favoriteGenres: data.favoriteGenres,
      dislikedGenres: data.dislikedGenres,
      preferredContentType: data.preferredContentType,
      minRating: data.minRating,
      updatedAt: new Date(),
    },
  });
}

// ============= Groups =============

export async function createGroup(data: InsertGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(groups).values(data);
  return result[0].insertId;
}

export async function getGroupByJoinCode(joinCode: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(groups).where(eq(groups.joinCode, joinCode)).limit(1);
  return result[0] || null;
}

export async function getGroupById(groupId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return result[0] || null;
}

export async function getUserGroups(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      group: groups,
      membership: groupMembers,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))
    .orderBy(desc(groupMembers.joinedAt));

  return result.map((r) => ({ ...r.group, role: r.membership.role }));
}

export async function updateGroupFilters(groupId: number, filters: {
  minRating?: number;
  filterGenres?: number[];
  filterType?: "movie" | "tv" | "both";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(groups).set(filters).where(eq(groups.id, groupId));
}

// ============= Group Members =============

export async function addGroupMember(data: InsertGroupMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(groupMembers).values(data);
}

export async function getGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
}

export async function isUserInGroup(userId: number, groupId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
    .limit(1);

  return result.length > 0;
}

// ============= Swipes =============

export async function recordSwipe(data: InsertSwipe) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(swipes).values(data).onDuplicateKeyUpdate({
    set: {
      direction: data.direction,
      createdAt: new Date(),
    },
  });
}

export async function getUserSwipes(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(swipes).where(eq(swipes.userId, userId)).orderBy(desc(swipes.createdAt)).limit(limit);
}

export async function getSwipedMovieIds(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({ movieId: swipes.movieId }).from(swipes).where(eq(swipes.userId, userId));
  return result.map((r) => r.movieId);
}

export async function getUserSwipeForMovie(userId: number, movieId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(swipes)
    .where(and(eq(swipes.userId, userId), eq(swipes.movieId, movieId)))
    .limit(1);

  return result[0] || null;
}

export async function deleteSwipe(userId: number, movieId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(swipes).where(and(eq(swipes.userId, userId), eq(swipes.movieId, movieId)));
}

// ============= Matches =============

export async function createMatch(data: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(matches).values(data).onDuplicateKeyUpdate({
    set: {
      matchedBy: data.matchedBy,
      matchedAt: new Date(),
    },
  });
}

export async function getGroupMatches(groupId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(matches).where(eq(matches.groupId, groupId)).orderBy(desc(matches.matchedAt));
}

export async function markMatchAsWatched(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(matches).set({ watched: true, watchedAt: new Date() }).where(eq(matches.id, matchId));
}

/**
 * Check if a movie has been liked by all members of a group
 */
export async function checkForMatch(groupId: number, movieId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get all group members
  const members = await getGroupMembers(groupId);
  const memberIds = members.map((m) => m.userId);

  if (memberIds.length === 0) return false;

  // Get all right swipes for this movie from group members
  const rightSwipes = await db
    .select()
    .from(swipes)
    .where(
      and(
        eq(swipes.movieId, movieId),
        inArray(swipes.userId, memberIds),
        eq(swipes.direction, "right")
      )
    );

  // Check if all members have swiped right
  return rightSwipes.length === memberIds.length;
}

// ============= Saved Movies =============

export async function saveMovie(data: InsertSavedMovie) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(savedMovies).values(data);
}

export async function getUserSavedMovies(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(savedMovies).where(eq(savedMovies.userId, userId)).orderBy(desc(savedMovies.savedAt));
}

export async function removeSavedMovie(userId: number, movieId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(savedMovies).where(and(eq(savedMovies.userId, userId), eq(savedMovies.movieId, movieId)));
}

// ============= Notifications =============

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
}

// ============= Helper Functions =============

/**
 * Generate a unique 6-character join code
 */
export async function generateUniqueJoinCode(): Promise<string> {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking characters
  let code: string;
  let exists = true;

  while (exists) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const existing = await getGroupByJoinCode(code);
    exists = existing !== null;
  }

  return code!;
}
