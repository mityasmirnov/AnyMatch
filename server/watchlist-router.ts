import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import * as watchlistQueries from "./watchlist-queries";

export const watchlistRouter = router({
  /**
   * Add movie to watchlist
   */
  add: protectedProcedure
    .input(
      z.object({
        movieId: z.string(),
        movieTitle: z.string(),
        moviePoster: z.string().nullable(),
        movieType: z.enum(["movie", "tv"]),
        movieGenres: z.array(z.number()).optional(),
        movieRating: z.number().optional(),
        movieYear: z.number().optional(),
        addedFrom: z.enum(["swipe", "match", "search", "browse"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await watchlistQueries.addToWatchlist({
        userId: ctx.user.id,
        ...input,
      });
      return result;
    }),

  /**
   * Get user's watchlist
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return watchlistQueries.getUserWatchlist(ctx.user.id);
  }),

  /**
   * Check if movie is in watchlist
   */
  check: protectedProcedure
    .input(z.object({ movieId: z.string() }))
    .query(async ({ input, ctx }) => {
      const inWatchlist = await watchlistQueries.isInWatchlist(ctx.user.id, input.movieId);
      return { inWatchlist };
    }),

  /**
   * Remove from watchlist
   */
  remove: protectedProcedure
    .input(z.object({ movieId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await watchlistQueries.removeFromWatchlist(ctx.user.id, input.movieId);
      return { success: true };
    }),

  /**
   * Mark as watched/unwatched
   */
  toggleWatched: protectedProcedure
    .input(
      z.object({
        movieId: z.string(),
        watched: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await watchlistQueries.markAsWatched(ctx.user.id, input.movieId, input.watched);
      return { success: true };
    }),

  /**
   * Get watchlist count
   */
  count: protectedProcedure.query(async ({ ctx }) => {
    const count = await watchlistQueries.getWatchlistCount(ctx.user.id);
    return { count };
  }),
});
