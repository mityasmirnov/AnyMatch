/**
 * TMDB API Service - TV Shows
 * 
 * This service provides TV show-related functionality for TMDB API integration.
 */

import { makeRequest, transformTVData, transformTVDetails } from './tmdbApiCore';

/**
 * Get a list of popular TV series
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page (not used in TMDB, but kept for interface consistency)
 * @returns {Promise<Object>} Popular TV series
 */
export const getPopularTVSeries = async (page = 1, limit = 10) => {
  const data = await makeRequest('/tv/popular', {
    page: page.toString(),
    language: 'en-US'
  });
  
  // Transform to match our app's format
  return {
    results: data.results.map(tv => transformTVData(tv)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};

/**
 * Get details for a specific TV show
 * @param {string} id - TV show ID
 * @returns {Promise<Object>} TV show details
 */
export const getTVDetails = async (id) => {
  const data = await makeRequest(`/tv/${id}`, {
    language: 'en-US',
    append_to_response: 'credits,keywords'
  });
  
  return transformTVDetails(data);
};

/**
 * Search for TV series
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */
export const searchTVSeries = async (query, page = 1) => {
  const data = await makeRequest('/search/tv', {
    query,
    page: page.toString(),
    language: 'en-US',
    include_adult: 'false'
  });
  
  // Transform to match our app's format
  return {
    results: data.results.map(tv => transformTVData(tv)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};

/**
 * Get TV show genres
 * @returns {Promise<Array>} Array of genre objects
 */
export const getTVGenres = async () => {
  const data = await makeRequest('/genre/tv/list', { 
    language: 'en-US' 
  });
  
  return data.genres;
};

/**
 * Get TV shows filtered by genre
 * @param {number} genreId - ID of the genre to filter by
 * @returns {Promise<Object>} Filtered TV shows
 */
export const getTVByGenre = async (genreId) => {
  const data = await makeRequest('/discover/tv', {
    with_genres: genreId.toString(),
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false'
  });
  
  return {
    results: data.results.map(tv => transformTVData(tv)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};

/**
 * Get TV shows filtered by minimum rating
 * @param {number} minRating - Minimum rating threshold
 * @returns {Promise<Object>} Filtered TV shows
 */
export const getTVByMinRating = async (minRating) => {
  const data = await makeRequest('/discover/tv', {
    'vote_average.gte': minRating.toString(),
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false'
  });
  
  return {
    results: data.results.map(tv => transformTVData(tv)),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  };
};
