/**
 * OMDB API Service
 * 
 * This service provides integration with the OMDB API.
 * API Key: ca037129
 * Daily Limit: 1,000 requests
 */

// API configuration
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com/'; // Changed from http to https

// Track API usage to know when to switch to TMDB
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

// Reset counter if it's a new day
const checkAndResetCounter = () => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyRequestCount = 0;
    lastResetDate = today;
  }
};

// Check if we've reached the daily limit
export const hasReachedDailyLimit = () => {
  checkAndResetCounter();
  return dailyRequestCount >= 1000;
};

// Increment the request counter
const incrementRequestCount = () => {
  checkAndResetCounter();
  dailyRequestCount++;
};

/**
 * Make a request to the OMDB API
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
const makeRequest = async (params) => {
  if (hasReachedDailyLimit()) {
    throw new Error('OMDB API daily limit reached');
  }

  // Add API key to params
  const queryParams = new URLSearchParams({
    apikey: OMDB_API_KEY,
    ...params
  });

  try {
    incrementRequestCount();
    const response = await fetch(`${OMDB_BASE_URL}?${queryParams.toString()}`);
    const data = await response.json();

    if (data.Response === 'False') {
      throw new Error(data.Error || 'Unknown error from OMDB API');
    }

    return data;
  } catch (error) {
    console.error('OMDB API error:', error);
    throw error;
  }
};

/**
 * Search for movies by title
 * @param {string} query - Search query
 * @param {number} page - Page number (1-based)
 * @returns {Promise<Object>} Search results
 */
export const searchMovies = async (query, page = 1) => {
  const data = await makeRequest({
    s: query,
    type: 'movie',
    page: page.toString()
  });

  // Transform to match our app's format
  return {
    results: data.Search ? data.Search.map(movie => ({
      id: movie.imdbID,
      title: movie.Title,
      coverUrl: movie.Poster !== 'N/A' ? movie.Poster : null,
      releaseDate: movie.Year,
      type: 'movie'
    })) : [],
    page,
    total_pages: Math.ceil(parseInt(data.totalResults || 0) / 10),
    total_results: parseInt(data.totalResults || 0)
  };
};

/**
 * Search for TV series by title
 * @param {string} query - Search query
 * @param {number} page - Page number (1-based)
 * @returns {Promise<Object>} Search results
 */
export const searchTVSeries = async (query, page = 1) => {
  const data = await makeRequest({
    s: query,
    type: 'series',
    page: page.toString()
  });

  // Transform to match our app's format
  return {
    results: data.Search ? data.Search.map(series => ({
      id: series.imdbID,
      title: series.Title,
      coverUrl: series.Poster !== 'N/A' ? series.Poster : null,
      releaseDate: series.Year,
      type: 'tv'
    })) : [],
    page,
    total_pages: Math.ceil(parseInt(data.totalResults || 0) / 10),
    total_results: parseInt(data.totalResults || 0)
  };
};

/**
 * Get details for a specific movie or TV show
 * @param {string} id - IMDB ID
 * @returns {Promise<Object>} Content details
 */
export const getContentDetails = async (id) => {
  const data = await makeRequest({
    i: id,
    plot: 'full'
  });

  // Map genres to IDs (approximate mapping)
  const genreMap = {
    'Action': 28,
    'Adventure': 12,
    'Animation': 16,
    'Comedy': 35,
    'Crime': 80,
    'Documentary': 99,
    'Drama': 18,
    'Family': 10751,
    'Fantasy': 14,
    'History': 36,
    'Horror': 27,
    'Music': 10402,
    'Mystery': 9648,
    'Romance': 10749,
    'Science Fiction': 878,
    'TV Movie': 10770,
    'Thriller': 53,
    'War': 10752,
    'Western': 37
  };

  const genres = data.Genre ? data.Genre.split(', ') : [];
  const genreIds = genres.map(genre => genreMap[genre] || 0).filter(id => id !== 0);

  // Transform to match our app's format
  return {
    id: data.imdbID,
    title: data.Title,
    coverUrl: data.Poster !== 'N/A' ? data.Poster : null,
    genre: data.Genre,
    genreIds,
    description: data.Plot,
    rating: parseFloat(data.imdbRating) || 0,
    releaseDate: data.Released !== 'N/A' ? data.Released : data.Year,
    runtime: parseInt(data.Runtime) || 0,
    type: data.Type === 'series' ? 'tv' : 'movie',
    // Additional fields from OMDB
    director: data.Director,
    actors: data.Actors,
    awards: data.Awards,
    // We don't have platform data from OMDB, so use empty array
    platforms: []
  };
};

/**
 * Search for all content (movies and TV)
 * @param {string} query - Search query
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */
export const searchContent = async (query, type = 'all', page = 1) => {
  if (type === 'movie') {
    return searchMovies(query, page);
  } else if (type === 'tv') {
    return searchTVSeries(query, page);
  } else {
    // For 'all', we need to make two requests and combine results
    // OMDB doesn't support searching both types at once
    const [movieResults, tvResults] = await Promise.all([
      searchMovies(query, page),
      searchTVSeries(query, page)
    ]);

    // Combine and sort by title
    const combinedResults = [
      ...movieResults.results,
      ...tvResults.results
    ].sort((a, b) => a.title.localeCompare(b.title));

    return {
      results: combinedResults,
      total_results: combinedResults.length
    };
  }
};

/**
 * Get popular movies (OMDB doesn't have this feature, so we use predefined popular titles)
 * @param {number} page - Page number
 * @param {number} limit - Number of results per page
 * @returns {Promise<Object>} Popular movies
 */
export const getPopularMovies = async (page = 1, limit = 10) => {
  // Popular movie titles to search for
  const popularTitles = [
    'Inception', 'The Dark Knight', 'Pulp Fiction', 'The Godfather',
    'The Shawshank Redemption', 'Fight Club', 'Forrest Gump',
    'The Matrix', 'Goodfellas', 'Interstellar'
  ];
  
  // Get a subset based on page and limit
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, popularTitles.length);
  const titlesToFetch = popularTitles.slice(startIndex, endIndex);
  
  // Fetch details for each title
  const results = await Promise.all(
    titlesToFetch.map(async (title) => {
      try {
        const searchResult = await makeRequest({
          s: title,
          type: 'movie',
          page: '1'
        });
        
        if (searchResult.Search && searchResult.Search.length > 0) {
          const movie = searchResult.Search[0];
          return {
            id: movie.imdbID,
            title: movie.Title,
            coverUrl: movie.Poster !== 'N/A' ? movie.Poster : null,
            releaseDate: movie.Year,
            type: 'movie'
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching details for ${title}:`, error);
        return null;
      }
    })
  );
  
  // Filter out null results
  const validResults = results.filter(result => result !== null);
  
  return {
    results: validResults,
    page,
    total_pages: Math.ceil(popularTitles.length / limit),
    total_results: popularTitles.length
  };
};

/**
 * Get popular TV series (OMDB doesn't have this feature, so we use predefined popular titles)
 * @param {number} page - Page number
 * @param {number} limit - Number of results per page
 * @returns {Promise<Object>} Popular TV series
 */
export const getPopularTVSeries = async (page = 1, limit = 10) => {
  // Popular TV series titles to search for
  const popularTitles = [
    'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office',
    'Friends', 'The Mandalorian', 'The Crown', 'The Witcher',
    'The Sopranos', 'Chernobyl'
  ];
  
  // Get a subset based on page and limit
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, popularTitles.length);
  const titlesToFetch = popularTitles.slice(startIndex, endIndex);
  
  // Fetch details for each title
  const results = await Promise.all(
    titlesToFetch.map(async (title) => {
      try {
        const searchResult = await makeRequest({
          s: title,
          type: 'series',
          page: '1'
        });
        
        if (searchResult.Search && searchResult.Search.length > 0) {
          const series = searchResult.Search[0];
          return {
            id: series.imdbID,
            title: series.Title,
            coverUrl: series.Poster !== 'N/A' ? series.Poster : null,
            releaseDate: series.Year,
            type: 'tv'
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching details for ${title}:`, error);
        return null;
      }
    })
  );
  
  // Filter out null results
  const validResults = results.filter(result => result !== null);
  
  return {
    results: validResults,
    page,
    total_pages: Math.ceil(popularTitles.length / limit),
    total_results: popularTitles.length
  };
};

/**
 * Get a list of all available genres
 * @returns {Promise<Array>} Array of genre objects
 */
export const getGenres = async () => {
  // OMDB doesn't have a genres endpoint, so we use a predefined list
  const genres = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" }
  ];
  
  return genres;
};

/**
 * Get content filtered by genre
 * @param {number} genreId - ID of the genre to filter by
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByGenre = async (genreId, type = 'all') => {
  // OMDB doesn't support filtering by genre, so we use TMDB for this functionality
  // This will trigger the fallback to TMDB in the movieApi.js
  throw new Error('OMDB API does not support filtering by genre');
};

/**
 * Get content filtered by minimum rating
 * @param {number} minRating - Minimum rating threshold
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByMinRating = async (minRating, type = 'all') => {
  // OMDB doesn't support filtering by rating, so we use TMDB for this functionality
  // This will trigger the fallback to TMDB in the movieApi.js
  throw new Error('OMDB API does not support filtering by rating');
};

/**
 * Get random content recommendations
 * @param {number} count - Number of recommendations to return
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Recommended content
 */
export const getRecommendations = async (count = 5, type = 'all') => {
  // For recommendations, we'll use the popular movies/TV series functions
  let results = [];
  
  if (type === 'movie' || type === 'all') {
    const movieData = await getPopularMovies(1, count * 2);
    results = [...results, ...movieData.results];
  }
  
  if (type === 'tv' || type === 'all') {
    const tvData = await getPopularTVSeries(1, count * 2);
    results = [...results, ...tvData.results];
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

// Export all functions
export default {
  searchMovies,
  searchTVSeries,
  getContentDetails,
  searchContent,
  getPopularMovies,
  getPopularTVSeries,
  getGenres,
  getContentByGenre,
  getContentByMinRating,
  getRecommendations,
  hasReachedDailyLimit
};
