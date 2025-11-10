import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as tmdb from "./tmdb";
import * as queries from "./queries";

// ============= Movies Router =============

export const moviesRouter = router({
  /**
   * Get movie/TV genres
   */
  getGenres: protectedProcedure.query(async () => {
    const [movieGenres, tvGenres] = await Promise.all([
      tmdb.getMovieGenres(),
      tmdb.getTVGenres(),
    ]);
    return { movieGenres, tvGenres };
  }),

  /**
   * Discover movies/TV with filters
   */
  discover: protectedProcedure
    .input(
      z.object({
        type: z.enum(["movie", "tv", "both"]).default("both"),
        page: z.number().default(1),
        genres: z.array(z.number()).optional(),
        minRating: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      // Get user's already swiped movies to filter them out
      const swipedIds = await queries.getSwipedMovieIds(userId);
      
      const params = {
        page: input.page,
        genres: input.genres,
        minRating: input.minRating,
      };

      let results: tmdb.TMDBMovie[] = [];

      if (input.type === "movie" || input.type === "both") {
        const movieData = await tmdb.discoverMovies(params);
        results.push(...movieData.results);
      }

      if (input.type === "tv" || input.type === "both") {
        const tvData = await tmdb.discoverTV(params);
        results.push(...tvData.results);
      }

      // Filter out already swiped movies
      const filtered = results.filter((item) => !swipedIds.includes(item.id.toString()));

      // Normalize and return
      return filtered.map(tmdb.normalizeMedia);
    }),

  /**
   * Get movie/TV details
   */
  getDetails: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["movie", "tv"]),
      })
    )
    .query(async ({ input }) => {
      if (input.type === "movie") {
        return tmdb.getMovieDetails(input.id);
      } else {
        return tmdb.getTVDetails(input.id);
      }
    }),

  /**
   * Search movies/TV
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        page: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const data = await tmdb.searchMulti(input.query, input.page);
      return data.results.map(tmdb.normalizeMedia);
    }),
});

// ============= Preferences Router =============

export const preferencesRouter = router({
  /**
   * Get user preferences
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    return queries.getUserPreferences(ctx.user.id);
  }),

  /**
   * Update user preferences
   */
  update: protectedProcedure
    .input(
      z.object({
        favoriteGenres: z.array(z.number()).optional(),
        dislikedGenres: z.array(z.number()).optional(),
        preferredContentType: z.enum(["movie", "tv", "both"]).optional(),
        minRating: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await queries.upsertUserPreferences({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),
});

// ============= Groups Router =============

export const groupsRouter = router({
  /**
   * Create a new group
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const joinCode = await queries.generateUniqueJoinCode();
      const groupId = await queries.createGroup({
        name: input.name,
        joinCode,
        createdBy: ctx.user.id,
      });

      // Add creator as owner
      await queries.addGroupMember({
        groupId,
        userId: ctx.user.id,
        role: "owner",
      });

      return { groupId, joinCode };
    }),

  /**
   * Join a group by code
   */
  join: protectedProcedure
    .input(
      z.object({
        joinCode: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const group = await queries.getGroupByJoinCode(input.joinCode);
      if (!group) {
        throw new Error("Group not found");
      }

      // Check if already a member
      const isMember = await queries.isUserInGroup(ctx.user.id, group.id);
      if (isMember) {
        return { groupId: group.id, alreadyMember: true };
      }

      await queries.addGroupMember({
        groupId: group.id,
        userId: ctx.user.id,
        role: "member",
      });

      return { groupId: group.id, alreadyMember: false };
    }),

  /**
   * Get user's groups
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return queries.getUserGroups(ctx.user.id);
  }),

  /**
   * Get group details
   */
  get: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input, ctx }) => {
      const group = await queries.getGroupById(input.groupId);
      if (!group) {
        throw new Error("Group not found");
      }

      const isMember = await queries.isUserInGroup(ctx.user.id, group.id);
      if (!isMember) {
        throw new Error("Not a member of this group");
      }

      const members = await queries.getGroupMembers(group.id);
      return { ...group, members };
    }),

  /**
   * Update group filters
   */
  updateFilters: protectedProcedure
    .input(
      z.object({
        groupId: z.number(),
        minRating: z.number().optional(),
        filterGenres: z.array(z.number()).optional(),
        filterType: z.enum(["movie", "tv", "both"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const isMember = await queries.isUserInGroup(ctx.user.id, input.groupId);
      if (!isMember) {
        throw new Error("Not a member of this group");
      }

      const { groupId, ...filters } = input;
      await queries.updateGroupFilters(groupId, filters);
      return { success: true };
    }),

  /**
   * Get group matches
   */
  getMatches: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input, ctx }) => {
      const isMember = await queries.isUserInGroup(ctx.user.id, input.groupId);
      if (!isMember) {
        throw new Error("Not a member of this group");
      }

      return queries.getGroupMatches(input.groupId);
    }),
});

// ============= Swipes Router =============

export const swipesRouter = router({
  /**
   * Record a swipe
   */
  swipe: protectedProcedure
    .input(
      z.object({
        movieId: z.string(),
        movieTitle: z.string(),
        moviePoster: z.string().nullable(),
        movieType: z.enum(["movie", "tv"]),
        movieGenres: z.array(z.number()),
        movieRating: z.number(),
        direction: z.enum(["left", "right", "up", "down"]),
        groupId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { groupId, ...swipeData } = input;

      // Record the swipe
      await queries.recordSwipe({
        userId: ctx.user.id,
        ...swipeData,
      });

      // If it's a right swipe and user is in a group, check for matches
      if (input.direction === "right" && groupId) {
        const isMatch = await queries.checkForMatch(groupId, input.movieId);

        if (isMatch) {
          // Get all members who liked it
          const members = await queries.getGroupMembers(groupId);
          const memberIds = members.map((m) => m.userId);

          // Create match
          await queries.createMatch({
            groupId,
            movieId: input.movieId,
            movieTitle: input.movieTitle,
            moviePoster: input.moviePoster,
            movieType: input.movieType,
            movieGenres: input.movieGenres,
            movieRating: input.movieRating,
            matchedBy: memberIds,
          });

          // Notify all members
          for (const memberId of memberIds) {
            if (memberId !== ctx.user.id) {
              await queries.createNotification({
                userId: memberId,
                type: "match",
                title: "New Match!",
                message: `Your group matched on "${input.movieTitle}"`,
                relatedId: groupId.toString(),
              });
            }
          }

          return { success: true, matched: true };
        }
      }

      // If it's a super like (up swipe), notify group members
      if (input.direction === "up" && groupId) {
        const members = await queries.getGroupMembers(groupId);
        for (const member of members) {
          if (member.userId !== ctx.user.id) {
            await queries.createNotification({
              userId: member.userId,
              type: "super_like",
              title: "Super Like!",
              message: `${ctx.user.name || "Someone"} super liked "${input.movieTitle}"`,
              relatedId: input.movieId,
            });
          }
        }
      }

      return { success: true, matched: false };
    }),

  /**
   * Undo last swipe
   */
  undo: protectedProcedure.mutation(async ({ ctx }) => {
    const swipes = await queries.getUserSwipes(ctx.user.id, 1);
    if (swipes.length === 0) {
      throw new Error("No swipes to undo");
    }

    await queries.deleteSwipe(ctx.user.id, swipes[0].movieId);
    return { success: true, movie: swipes[0] };
  }),

  /**
   * Get user's swipe history
   */
  history: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      return queries.getUserSwipes(ctx.user.id, input.limit);
    }),
});

// ============= Saved Movies Router =============

export const savedRouter = router({
  /**
   * Save a movie for later
   */
  save: protectedProcedure
    .input(
      z.object({
        movieId: z.string(),
        movieTitle: z.string(),
        moviePoster: z.string().nullable(),
        movieType: z.enum(["movie", "tv"]),
        movieGenres: z.array(z.number()),
        movieRating: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await queries.saveMovie({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),

  /**
   * Get saved movies
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return queries.getUserSavedMovies(ctx.user.id);
  }),

  /**
   * Remove saved movie
   */
  remove: protectedProcedure
    .input(z.object({ movieId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await queries.removeSavedMovie(ctx.user.id, input.movieId);
      return { success: true };
    }),
});

// ============= Notifications Router =============

export const notificationsRouter = router({
  /**
   * Get user notifications
   */
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      return queries.getUserNotifications(ctx.user.id, input.limit);
    }),

  /**
   * Mark notification as read
   */
  markRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await queries.markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await queries.markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  }),
});
