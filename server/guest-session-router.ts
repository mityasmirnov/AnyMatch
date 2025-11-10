import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as guestQueries from "./guest-session-queries";

export const guestSessionRouter = router({
  /**
   * Create a new guest session
   */
  create: publicProcedure.mutation(async () => {
    const session = await guestQueries.createGuestSession();
    return {
      sessionId: session.id,
      sessionCode: session.sessionCode,
    };
  }),

  /**
   * Join an existing guest session
   */
  join: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().length(6),
      })
    )
    .mutation(async ({ input }) => {
      const session = await guestQueries.getGuestSessionByCode(input.sessionCode);
      
      if (!session) {
        throw new Error("Invalid or expired session code");
      }

      return {
        sessionId: session.id,
        sessionCode: session.sessionCode,
      };
    }),

  /**
   * Record a guest swipe
   */
  swipe: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        guestIdentifier: z.string(),
        movieId: z.string(),
        movieTitle: z.string(),
        moviePoster: z.string().nullable(),
        movieType: z.enum(["movie", "tv"]),
        movieGenres: z.array(z.number()).nullable(),
        movieRating: z.number().nullable(),
        direction: z.enum(["left", "right", "up", "down"]),
      })
    )
    .mutation(async ({ input }) => {
      await guestQueries.recordGuestSwipe({
        sessionId: input.sessionId,
        guestIdentifier: input.guestIdentifier,
        movieId: input.movieId,
        movieTitle: input.movieTitle,
        moviePoster: input.moviePoster,
        movieType: input.movieType,
        movieGenres: input.movieGenres,
        movieRating: input.movieRating,
        direction: input.direction,
      });

      // Check for matches
      const matches = await guestQueries.findGuestMatches(input.sessionId);
      const currentMatches = matches.map(m => m.movieId);
      const justMatched = currentMatches.includes(input.movieId);

      return {
        success: true,
        matched: justMatched,
      };
    }),

  /**
   * Get matches for a guest session
   */
  getMatches: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await guestQueries.findGuestMatches(input.sessionId);
    }),

  /**
   * Get participant count for a session
   */
  getParticipantCount: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await guestQueries.getGuestSessionParticipantCount(input.sessionId);
    }),

  /**
   * Get session info
   */
  getSession: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().length(6),
      })
    )
    .query(async ({ input }) => {
      const session = await guestQueries.getGuestSessionByCode(input.sessionCode);
      
      if (!session) {
        return null;
      }

      const participantCount = await guestQueries.getGuestSessionParticipantCount(session.id);

      return {
        sessionId: session.id,
        sessionCode: session.sessionCode,
        expiresAt: session.expiresAt,
        participantCount,
      };
    }),
});
