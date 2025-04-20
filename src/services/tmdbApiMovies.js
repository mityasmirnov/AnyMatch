/**
 * TMDB API Service - Movies
 * 
 * This service provides movie-related functionality for TMDB API integration.
 */

import { makeRequest, transformMovieData, transformMovieDetails, TMDB_IMAGE_BASE_URL } from './tmdbApiCore';

/**
 * Get a list of popular movies
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page (not used in TMDB, but kept for interface consistency)
 * @returns {Promise<Object>} Popular movies
 */
export const getPopularMovies = async (page = 1, limit = 10) => {
  const data = await makeRequest('/movie/popular', {
    page: page.toString(),
    language: 'en-US'
  });
  
  // Transform to match our app's format
  return {
    results: data.results.map(movie => transformMovieData(movie)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};

/**
 * Get details for a specific movie
 * @param {string} id - Movie ID
 * @returns {Promise<Object>} Movie details
 */
export const getMovieDetails = async (id) => {
  const data = await makeRequest(`/movie/${id}`, {
    language: 'en-US',
    append_to_response: 'credits,keywords'
  });
  
  return transformMovieDetails(data);
};

/**
 * Search for movies
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */
export const searchMovies = async (query, page = 1) => {
  const data = await makeRequest('/search/movie', {
    query,
    page: page.toString(),
    language: 'en-US',
    include_adult: 'false'
  });
  
  // Transform to match our app's format
  return {
    results: data.results.map(movie => transformMovieData(movie)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};

/**
 * Get movie genres
 * @returns {Promise<Array>} Array of genre objects
 */
export const getMovieGenres = async () => {
  const data = await makeRequest('/genre/movie/list', { 
    language: 'en-US' 
  });
  
  return data.genres;
};

/**
 * Get movies filtered by genre
 * @param {number} genreId - ID of the genre to filter by
 * @returns {Promise<Object>} Filtered movies
 */
export const getMoviesByGenre = async (genreId) => {
  const data = await makeRequest('/discover/movie', {
    with_genres: genreId.toString(),
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false'
  });
  
  return {
    results: data.results.map(movie => transformMovieData(movie)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};

/**
 * Get movies filtered by minimum rating
 * @param {number} minRating - Minimum rating threshold
 * @returns {Promise<Object>} Filtered movies
 */
export const getMoviesByMinRating = async (minRating) => {
  const data = await makeRequest('/discover/movie', {
    'vote_average.gte': minRating.toString(),
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false'
  });
  
  return {
    results: data.results.map(movie => transformMovieData(movie)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};
