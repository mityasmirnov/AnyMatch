/**
 * Movie API Service
 * 
 * This service provides a unified interface for movie data.
 * Since the OMDB API key is invalid, we're using TMDB API as the primary source.
 * 
 * TMDB API Key: 9fb0b7dde8a42968698cad396ce2ff0b
 */

import tmdbApi from './tmdbApi';

/**
 * Get a list of popular movies
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page
 * @returns {Promise<Array>} Array of movie objects
 */
export const getPopularMovies = async (page = 1, limit = 10) => {
  try {
    return await tmdbApi.getPopularMovies(page, limit);
  } catch (error) {
    console.error('Error in getPopularMovies:', error);
    // Return empty results in case of error
    return {
      results: [],
      page,
      total_pages: 0,
      total_results: 0
    };
  }
};

/**
 * Get a list of popular TV series
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page
 * @returns {Promise<Array>} Array of TV series objects
 */
export const getPopularTVSeries = async (page = 1, limit = 10) => {
  try {
    return await tmdbApi.getPopularTVSeries(page, limit);
  } catch (error) {
    console.error('Error in getPopularTVSeries:', error);
    // Return empty results in case of error
    return {
      results: [],
      page,
      total_pages: 0,
      total_results: 0
    };
  }
};

/**
 * Get details for a specific movie or TV show
 * @param {string} id - ID of the movie or TV show
 * @param {string} type - Type of content ('movie' or 'tv')
 * @returns {Promise<Object>} Content details
 */
export const getContentDetails = async (id, type = 'movie') => {
  try {
    return await tmdbApi.getContentDetails(id, type);
  } catch (error) {
    console.error('Error in getContentDetails:', error);
    throw error;
  }
};

/**
 * Search for movies and TV shows
 * @param {string} query - Search query
 * @param {string} type - Type of content to search ('movie', 'tv', or 'all')
 * @param {number} page - Page number
 * @returns {Promise<Array>} Search results
 */
export const searchContent = async (query, type = 'all', page = 1) => {
  try {
    return await tmdbApi.searchContent(query, type, page);
  } catch (error) {
    console.error('Error in searchContent:', error);
    // Return empty results in case of error
    return {
      results: [],
      total_results: 0
    };
  }
};

/**
 * Get a list of all available genres
 * @returns {Promise<Array>} Array of genre objects
 */
export const getGenres = async () => {
  try {
    return await tmdbApi.getGenres();
  } catch (error) {
    console.error('Error in getGenres:', error);
    // Return empty array in case of error
    return [];
  }
};

/**
 * Get content filtered by genre
 * @param {number} genreId - ID of the genre to filter by
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByGenre = async (genreId, type = 'all') => {
  try {
    return await tmdbApi.getContentByGenre(genreId, type);
  } catch (error) {
    console.error('Error in getContentByGenre:', error);
    // Return empty results in case of error
    return {
      results: [],
      total_results: 0
    };
  }
};

/**
 * Get content filtered by minimum rating
 * @param {number} minRating - Minimum rating threshold
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByMinRating = async (minRating, type = 'all') => {
  try {
    return await tmdbApi.getContentByMinRating(minRating, type);
  } catch (error) {
    console.error('Error in getContentByMinRating:', error);
    // Return empty results in case of error
    return {
      results: [],
      total_results: 0
    };
  }
};

/**
 * Get random content recommendations
 * @param {number} count - Number of recommendations to return
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Recommended content
 */
export const getRecommendations = async (count = 5, type = 'all') => {
  try {
    return await tmdbApi.getRecommendations(count, type);
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    // Return empty results in case of error
    return {
      results: [],
      total_results: 0
    };
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
