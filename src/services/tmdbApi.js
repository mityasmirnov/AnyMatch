/**
 * TMDB API Service
 * 
 * This service provides integration with the TMDB API.
 * API Key: 9fb0b7dde8a42968698cad396ce2ff0b
 * API Read Access Token: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZmIwYjdkZGU4YTQyOTY4Njk4Y2FkMzk2Y2UyZmYwYiIsIm5iZiI6MTc0NTE1MzY2My4wNSwic3ViIjoiNjgwNGVlN2Y0MjFhMzA5NzVjYWE4NDk3Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.WawEd2l65xnavxfysawlkiC-L0QZacf70xAPFeZuNUA
 * 
 * This file imports and re-exports functionality from modular components
 * to maintain the same interface while keeping files under 500 lines.
 */

// Import from movie module
import { 
  getPopularMovies,
  getMovieDetails,
  searchMovies,
  getMovieGenres,
  getMoviesByGenre,
  getMoviesByMinRating
} from './tmdbApiMovies';

// Import from TV module
import {
  getPopularTVSeries,
  getTVDetails,
  searchTVSeries,
  getTVGenres,
  getTVByGenre,
  getTVByMinRating
} from './tmdbApiTV';

// Import from search module
import {
  searchContent,
  getGenres,
  getContentByGenre,
  getContentByMinRating,
  getRecommendations
} from './tmdbApiSearch';

/**
 * Get details for a specific movie or TV show
 * @param {string} id - ID of the movie or TV show
 * @param {string} type - Type of content ('movie' or 'tv')
 * @returns {Promise<Object>} Content details
 */
const getContentDetails = async (id, type = 'movie') => {
  if (type === 'movie') {
    return getMovieDetails(id);
  } else {
    return getTVDetails(id);
  }
};

// Export all functions
export default {
  getPopularMovies,
  getPopularTVSeries,
  getContentDetails,
  searchContent,
  getGenres,
  getContentByGenre,
  getContentByMinRating,
  getRecommendations
};
