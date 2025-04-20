/**
 * TMDB API Service - Search and Recommendations
 * 
 * This service provides search and recommendation functionality for TMDB API integration.
 */

import { makeRequest, transformMovieData, transformTVData } from './tmdbApiCore';

/**
 * Search for all content (movies and TV)
 * @param {string} query - Search query
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */
export const searchContent = async (query, type = 'all', page = 1) => {
  if (type === 'movie') {
    const data = await makeRequest('/search/movie', {
      query,
      page: page.toString(),
      language: 'en-US',
      include_adult: 'false'
    });
    
    return {
      results: data.results.map(movie => transformMovieData(movie)),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  } else if (type === 'tv') {
    const data = await makeRequest('/search/tv', {
      query,
      page: page.toString(),
      language: 'en-US',
      include_adult: 'false'
    });
    
    return {
      results: data.results.map(tv => transformTVData(tv)),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  } else {
    // For 'all', use the multi-search endpoint
    const data = await makeRequest('/search/multi', {
      query,
      page: page.toString(),
      language: 'en-US',
      include_adult: 'false'
    });
    
    // Filter to only include movies and TV shows
    const filteredResults = data.results.filter(
      item => item.media_type === 'movie' || item.media_type === 'tv'
    );
    
    // Transform to match our app's format
    return {
      results: filteredResults.map(item => {
        if (item.media_type === 'movie') {
          return transformMovieData(item);
        } else {
          return transformTVData(item);
        }
      }),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  }
};

/**
 * Get a list of all available genres
 * @returns {Promise<Array>} Array of genre objects
 */
export const getGenres = async () => {
  const [movieGenres, tvGenres] = await Promise.all([
    makeRequest('/genre/movie/list', { language: 'en-US' }),
    makeRequest('/genre/tv/list', { language: 'en-US' })
  ]);
  
  // Combine and deduplicate genres
  const allGenres = [...movieGenres.genres];
  
  // Add TV genres that don't exist in movie genres
  tvGenres.genres.forEach(tvGenre => {
    if (!allGenres.some(genre => genre.id === tvGenre.id)) {
      allGenres.push(tvGenre);
    }
  });
  
  return allGenres;
};

/**
 * Get content filtered by genre
 * @param {number} genreId - ID of the genre to filter by
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByGenre = async (genreId, type = 'all') => {
  let results = [];
  
  if (type === 'movie' || type === 'all') {
    const movieData = await makeRequest('/discover/movie', {
      with_genres: genreId.toString(),
      language: 'en-US',
      sort_by: 'popularity.desc',
      include_adult: 'false'
    });
    
    results = [
      ...results,
      ...movieData.results.map(movie => transformMovieData(movie))
    ];
  }
  
  if (type === 'tv' || type === 'all') {
    const tvData = await makeRequest('/discover/tv', {
      with_genres: genreId.toString(),
      language: 'en-US',
      sort_by: 'popularity.desc',
      include_adult: 'false'
    });
    
    results = [
      ...results,
      ...tvData.results.map(tv => transformTVData(tv))
    ];
  }
  
  return {
    results,
    total_results: results.length
  };
};

/**
 * Get content filtered by minimum rating
 * @param {number} minRating - Minimum rating threshold
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByMinRating = async (minRating, type = 'all') => {
  let results = [];
  
  if (type === 'movie' || type === 'all') {
    const movieData = await makeRequest('/discover/movie', {
      'vote_average.gte': minRating.toString(),
      language: 'en-US',
      sort_by: 'popularity.desc',
      include_adult: 'false'
    });
    
    results = [
      ...results,
      ...movieData.results.map(movie => transformMovieData(movie))
    ];
  }
  
  if (type === 'tv' || type === 'all') {
    const tvData = await makeRequest('/discover/tv', {
      'vote_average.gte': minRating.toString(),
      language: 'en-US',
      sort_by: 'popularity.desc',
      include_adult: 'false'
    });
    
    results = [
      ...results,
      ...tvData.results.map(tv => transformTVData(tv))
    ];
  }
  
  return {
    results,
    total_results: results.length
  };
};

/**
 * Get random content recommendations
 * @param {number} count - Number of recommendations to return
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Recommended content
 */
export const getRecommendations = async (count = 5, type = 'all') => {
  let results = [];
  
  if (type === 'movie' || type === 'all') {
    const movieData = await makeRequest('/movie/popular', {
      language: 'en-US',
      page: '1'
    });
    
    results = [
      ...results,
      ...movieData.results.map(movie => transformMovieData(movie))
    ];
  }
  
  if (type === 'tv' || type === 'all') {
    const tvData = await makeRequest('/tv/popular', {
      language: 'en-US',
      page: '1'
    });
    
    results = [
      ...results,
      ...tvData.results.map(tv => transformTVData(tv))
    ];
  }
  
  // Shuffle the array
  const shuffled = [...results].sort(() => 0.5 - Math.random());
  
  // Get first n elements
  const limitedResults = shuffled.slice(0, count);
  
  return {
    results: limitedResults,
    total_results: limitedResults.length
  };
};
