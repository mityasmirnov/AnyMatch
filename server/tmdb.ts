import { ENV } from "./_core/env";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Check if API keys are configured
if (!TMDB_API_KEY || !TMDB_ACCESS_TOKEN) {
  console.error("[TMDB] Missing API credentials:", {
    hasApiKey: !!TMDB_API_KEY,
    hasAccessToken: !!TMDB_ACCESS_TOKEN,
  });
}

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * Make authenticated request to TMDB API
 */
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Add API key to params
  params.api_key = TMDB_API_KEY!;
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[TMDB] API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get movie genres
 */
export async function getMovieGenres(): Promise<TMDBGenre[]> {
  const data = await tmdbFetch<{ genres: TMDBGenre[] }>("/genre/movie/list");
  return data.genres;
}

/**
 * Get TV genres
 */
export async function getTVGenres(): Promise<TMDBGenre[]> {
  const data = await tmdbFetch<{ genres: TMDBGenre[] }>("/genre/tv/list");
  return data.genres;
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>("/movie/popular", { page: page.toString() });
}

/**
 * Get popular TV shows
 */
export async function getPopularTV(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>("/tv/popular", { page: page.toString() });
}

/**
 * Discover movies with filters
 */
export async function discoverMovies(params: {
  page?: number;
  genres?: number[];
  minRating?: number;
  sortBy?: string;
}): Promise<TMDBResponse<TMDBMovie>> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sortBy || "popularity.desc",
  };

  if (params.genres && params.genres.length > 0) {
    queryParams.with_genres = params.genres.join(",");
  }

  if (params.minRating) {
    queryParams["vote_average.gte"] = (params.minRating / 10).toString();
  }

  return tmdbFetch<TMDBResponse<TMDBMovie>>("/discover/movie", queryParams);
}

/**
 * Discover TV shows with filters
 */
export async function discoverTV(params: {
  page?: number;
  genres?: number[];
  minRating?: number;
  sortBy?: string;
}): Promise<TMDBResponse<TMDBMovie>> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sortBy || "popularity.desc",
  };

  if (params.genres && params.genres.length > 0) {
    queryParams.with_genres = params.genres.join(",");
  }

  if (params.minRating) {
    queryParams["vote_average.gte"] = (params.minRating / 10).toString();
  }

  return tmdbFetch<TMDBResponse<TMDBMovie>>("/discover/tv", queryParams);
}

/**
 * Get movie details (includes credits, videos, and watch providers)
 */
export async function getMovieDetails(movieId: number) {
  return tmdbFetch(`/movie/${movieId}`, { append_to_response: "credits,videos,watch/providers" });
}

/**
 * Get TV show details (includes credits, videos, and watch providers)
 */
export async function getTVDetails(tvId: number) {
  return tmdbFetch(`/tv/${tvId}`, { append_to_response: "credits,videos,watch/providers" });
}

/**
 * Get watch providers for a movie (standalone)
 */
export async function getMovieWatchProviders(movieId: number) {
  const data = await tmdbFetch<any>(`/movie/${movieId}/watch/providers`);
  return data.results;
}

/**
 * Get watch providers for a TV show (standalone)
 */
export async function getTVWatchProviders(tvId: number) {
  const data = await tmdbFetch<any>(`/tv/${tvId}/watch/providers`);
  return data.results;
}

/**
 * Search movies and TV shows
 */
export async function searchMulti(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>("/search/multi", {
    query,
    page: page.toString(),
  });
}

/**
 * Get recommendations based on a movie
 */
export async function getMovieRecommendations(movieId: number, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/recommendations`, {
    page: page.toString(),
  });
}

/**
 * Get recommendations based on a TV show
 */
export async function getTVRecommendations(tvId: number, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>(`/tv/${tvId}/recommendations`, {
    page: page.toString(),
  });
}

/**
 * Get poster URL
 */
export function getPosterUrl(path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Get backdrop URL
 */
export function getBackdropUrl(path: string | null, size: "w300" | "w780" | "w1280" | "original" = "w1280"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Normalize movie/TV data to common format
 */
export function normalizeMedia(item: TMDBMovie): {
  id: string;
  title: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  genres: number[];
  type: "movie" | "tv";
  releaseDate: string;
} {
  return {
    id: item.id.toString(),
    title: item.title || item.name || "Unknown",
    overview: item.overview,
    poster: getPosterUrl(item.poster_path),
    backdrop: getBackdropUrl(item.backdrop_path),
    rating: Math.round(item.vote_average * 10), // Store as integer (0-100)
    genres: item.genre_ids || [],
    type: item.media_type || (item.title ? "movie" : "tv"),
    releaseDate: item.release_date || item.first_air_date || "",
  };
}
