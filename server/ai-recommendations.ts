import { invokeLLM } from "./_core/llm";
import * as queries from "./queries";
import * as tmdb from "./tmdb";

interface UserSwipePattern {
  likedGenres: Map<number, number>;
  dislikedGenres: Map<number, number>;
  averageRating: number;
  preferredType: "movie" | "tv" | "both";
  totalSwipes: number;
}

/**
 * Analyze user's swipe history to understand preferences
 */
export async function analyzeUserPreferences(userId: number): Promise<UserSwipePattern> {
  const swipes = await queries.getUserSwipes(userId, 100);

  const likedGenres = new Map<number, number>();
  const dislikedGenres = new Map<number, number>();
  let totalRating = 0;
  let ratingCount = 0;
  let movieCount = 0;
  let tvCount = 0;

  for (const swipe of swipes) {
    const genres = swipe.movieGenres as number[] || [];

    if (swipe.direction === "right" || swipe.direction === "up") {
      // Liked
      genres.forEach((genreId) => {
        likedGenres.set(genreId, (likedGenres.get(genreId) || 0) + 1);
      });
      if (swipe.movieRating) {
        totalRating += swipe.movieRating;
        ratingCount++;
      }
    } else if (swipe.direction === "left") {
      // Disliked
      genres.forEach((genreId) => {
        dislikedGenres.set(genreId, (dislikedGenres.get(genreId) || 0) + 1);
      });
    }

    if (swipe.movieType === "movie") movieCount++;
    else tvCount++;
  }

  const averageRating = ratingCount > 0 ? totalRating / ratingCount : 70;
  const preferredType = movieCount > tvCount * 1.5 ? "movie" : tvCount > movieCount * 1.5 ? "tv" : "both";

  return {
    likedGenres,
    dislikedGenres,
    averageRating,
    preferredType,
    totalSwipes: swipes.length,
  };
}

/**
 * Get AI-powered movie recommendations based on user preferences
 */
export async function getAIRecommendations(userId: number, limit: number = 10): Promise<any[]> {
  // Analyze user preferences
  const pattern = await analyzeUserPreferences(userId);

  if (pattern.totalSwipes < 5) {
    // Not enough data, return popular movies
    const popular = await tmdb.discoverMovies({ page: 1 });
    return popular.results.slice(0, limit).map(tmdb.normalizeMedia);
  }

  // Get top liked genres (sorted by frequency)
  const topGenres = Array.from(pattern.likedGenres.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0]);

  // Get all movie and TV genres for context
  const [movieGenres, tvGenres] = await Promise.all([
    tmdb.getMovieGenres(),
    tmdb.getTVGenres(),
  ]);

  const allGenres = [...movieGenres, ...tvGenres];
  const genreNames = topGenres
    .map((id) => allGenres.find((g) => g.id === id)?.name)
    .filter(Boolean);

  // Use AI to get personalized recommendations
  try {
    const prompt = `Based on a user's movie preferences, suggest 5 movies or TV shows they might enjoy.

User Preferences:
- Favorite Genres: ${genreNames.join(", ")}
- Average Rating Preference: ${(pattern.averageRating / 10).toFixed(1)}/10
- Preferred Type: ${pattern.preferredType}
- Total Swipes: ${pattern.totalSwipes}

Please provide 5 specific movie or TV show titles that match these preferences. Focus on popular, well-rated content.
Return ONLY a JSON array of objects with this structure:
[
  {
    "title": "Movie Title",
    "type": "movie" or "tv",
    "reason": "Brief reason why this matches their taste"
  }
]`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a movie recommendation expert. Provide personalized suggestions based on user preferences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string", enum: ["movie", "tv"] },
                    reason: { type: "string" },
                  },
                  required: ["title", "type", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    const aiSuggestions = JSON.parse(content);
    const recommendations = aiSuggestions.recommendations || [];

    // Search for each recommended title on TMDB
    const tmdbResults = await Promise.all(
      recommendations.map(async (rec: any) => {
        try {
          const searchResults = await tmdb.searchMulti(rec.title, 1);
          if (searchResults.results.length > 0) {
            const movie = tmdb.normalizeMedia(searchResults.results[0]);
            return {
              ...movie,
              aiReason: rec.reason,
            };
          }
          return null;
        } catch (error) {
          console.error(`Failed to search for ${rec.title}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls and return
    return tmdbResults.filter((r) => r !== null).slice(0, limit);
  } catch (error) {
    console.error("AI recommendation error:", error);
    // Fallback to genre-based recommendations
    return getFallbackRecommendations(topGenres, pattern, limit);
  }
}

/**
 * Fallback recommendations using TMDB discover API
 */
async function getFallbackRecommendations(
  genres: number[],
  pattern: UserSwipePattern,
  limit: number
): Promise<any[]> {
  const params = {
    page: 1,
    genres: genres.length > 0 ? genres : undefined,
    minRating: Math.floor(pattern.averageRating / 10) * 10,
  };

  let results: any[] = [];

  if (pattern.preferredType === "movie" || pattern.preferredType === "both") {
    const movies = await tmdb.discoverMovies(params);
    results.push(...movies.results);
  }

  if (pattern.preferredType === "tv" || pattern.preferredType === "both") {
    const tvShows = await tmdb.discoverTV(params);
    results.push(...tvShows.results);
  }

  return results.slice(0, limit).map(tmdb.normalizeMedia);
}

/**
 * Get collaborative filtering recommendations based on group matches
 */
export async function getCollaborativeRecommendations(
  userId: number,
  groupId: number,
  limit: number = 10
): Promise<any[]> {
  // Get group matches
  const matches = await queries.getGroupMatches(groupId);

  if (matches.length === 0) {
    return [];
  }

  // Extract genres from matched movies
  const matchedGenres = new Map<number, number>();
  matches.forEach((match) => {
    const genres = match.movieGenres as number[] || [];
    genres.forEach((genreId) => {
      matchedGenres.set(genreId, (matchedGenres.get(genreId) || 0) + 1);
    });
  });

  // Get top genres
  const topGenres = Array.from(matchedGenres.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0]);

  // Get movies with similar genres
  const recommendations = await tmdb.discoverMovies({
    page: 1,
    genres: topGenres,
    minRating: 60,
  });

  // Filter out already matched movies
  const matchedIds = new Set(matches.map((m) => m.movieId));
  const filtered = recommendations.results.filter(
    (movie) => !matchedIds.has(movie.id.toString())
  );

  return filtered.slice(0, limit).map(tmdb.normalizeMedia);
}
