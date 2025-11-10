import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, uniqueIndex } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  photoUrl: text("photoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User genre preferences for personalized recommendations
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  favoriteGenres: json("favoriteGenres").$type<number[]>(),
  dislikedGenres: json("dislikedGenres").$type<number[]>(),
  preferredContentType: mysqlEnum("preferredContentType", ["movie", "tv", "both"]).default("both").notNull(),
  minRating: int("minRating").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex("user_id_idx").on(table.userId),
}));

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Groups for collaborative movie matching
 */
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  joinCode: varchar("joinCode", { length: 10 }).notNull().unique(),
  createdBy: int("createdBy").notNull(),
  matchThreshold: int("matchThreshold").default(100).notNull(),
  minRating: int("minRating").default(0),
  filterGenres: json("filterGenres").$type<number[]>(),
  filterType: mysqlEnum("filterType", ["movie", "tv", "both"]).default("both").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Group membership tracking
 */
export const groupMembers = mysqlTable("group_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  groupUserIdx: uniqueIndex("group_user_idx").on(table.groupId, table.userId),
}));

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

/**
 * User swipes on movies/TV shows
 */
export const swipes = mysqlTable("swipes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  movieId: varchar("movieId", { length: 50 }).notNull(),
  movieTitle: text("movieTitle").notNull(),
  moviePoster: text("moviePoster"),
  movieType: mysqlEnum("movieType", ["movie", "tv"]).notNull(),
  movieGenres: json("movieGenres").$type<number[]>(),
  movieRating: int("movieRating").default(0),
  direction: mysqlEnum("direction", ["left", "right", "up", "down"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userMovieIdx: uniqueIndex("user_movie_idx").on(table.userId, table.movieId),
}));

export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = typeof swipes.$inferInsert;

/**
 * Matched movies within groups
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  movieId: varchar("movieId", { length: 50 }).notNull(),
  movieTitle: text("movieTitle").notNull(),
  moviePoster: text("moviePoster"),
  movieType: mysqlEnum("movieType", ["movie", "tv"]).notNull(),
  movieGenres: json("movieGenres").$type<number[]>(),
  movieRating: int("movieRating").default(0),
  matchedBy: json("matchedBy").$type<number[]>().notNull(),
  watched: boolean("watched").default(false).notNull(),
  watchedAt: timestamp("watchedAt"),
  matchedAt: timestamp("matchedAt").defaultNow().notNull(),
}, (table) => ({
  groupMovieIdx: uniqueIndex("group_movie_idx").on(table.groupId, table.movieId),
}));

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Saved movies (private save for later)
 */
export const savedMovies = mysqlTable("saved_movies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  movieId: varchar("movieId", { length: 50 }).notNull(),
  movieTitle: text("movieTitle").notNull(),
  moviePoster: text("moviePoster"),
  movieType: mysqlEnum("movieType", ["movie", "tv"]).notNull(),
  movieGenres: json("movieGenres").$type<number[]>(),
  movieRating: int("movieRating").default(0),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
}, (table) => ({
  userMovieIdx: uniqueIndex("user_saved_movie_idx").on(table.userId, table.movieId),
}));

export type SavedMovie = typeof savedMovies.$inferSelect;
export type InsertSavedMovie = typeof savedMovies.$inferInsert;

/**
 * Notifications for matches and group activity
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["match", "super_like", "group_invite"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: varchar("relatedId", { length: 50 }),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;