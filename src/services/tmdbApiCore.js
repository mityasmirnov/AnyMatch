/**
 * TMDB API Service - Core Functions
 * 
 * This service provides the core functionality for TMDB API integration.
 * API Key: 9fb0b7dde8a42968698cad396ce2ff0b
 * API Read Access Token: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZmIwYjdkZGU4YTQyOTY4Njk4Y2FkMzk2Y2UyZmYwYiIsIm5iZiI6MTc0NTE1MzY2My4wNSwic3ViIjoiNjgwNGVlN2Y0MjFhMzA5NzVjYWE4NDk3Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.WawEd2l65xnavxfysawlkiC-L0QZacf70xAPFeZuNUA
 */

// API configuration
export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
export const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Make a request to the TMDB API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const makeRequest = async (endpoint, params = {}) => {
  // Construct URL with query parameters
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Add API key to params
  Object.entries({
    api_key: TMDB_API_KEY,
    ...params
  }).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(data.status_message || 'Unknown error from TMDB API');
    }
    
    return data;
  } catch (error) {
    console.error('TMDB API error:', error);
    throw error;
  }
};

/**
 * Transform movie data to match our app's format
 * @param {Object} movie - Movie data from TMDB
 * @returns {Object} Transformed movie data
 */
export const transformMovieData = (movie) => {
  return {
    id: movie.id.toString(),
    title: movie.title,
    coverUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    genre: '', // TMDB doesn't provide genres in search results
    genreIds: movie.genre_ids || [],
    description: movie.overview,
    rating: movie.vote_average || 0,
    releaseDate: movie.release_date,
    type: 'movie',
    platforms: [] // TMDB doesn't provide platform data
  };
};

/**
 * Transform TV show data to match our app's format
 * @param {Object} tv - TV show data from TMDB
 * @returns {Object} Transformed TV show data
 */
export const transformTVData = (tv) => {
  return {
    id: tv.id.toString(),
    title: tv.name,
    coverUrl: tv.poster_path ? `${TMDB_IMAGE_BASE_URL}${tv.poster_path}` : null,
    genre: '', // TMDB doesn't provide genres in search results
    genreIds: tv.genre_ids || [],
    description: tv.overview,
    rating: tv.vote_average || 0,
    releaseDate: tv.first_air_date,
    type: 'tv',
    platforms: [] // TMDB doesn't provide platform data
  };
};

/**
 * Transform movie details to match our app's format
 * @param {Object} movie - Movie details from TMDB
 * @returns {Object} Transformed movie details
 */
export const transformMovieDetails = (movie) => {
  return {
    id: movie.id.toString(),
    title: movie.title,
    coverUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    genre: movie.genres.map(g => g.name).join(', '),
    genreIds: movie.genres.map(g => g.id),
    description: movie.overview,
    rating: movie.vote_average || 0,
    releaseDate: movie.release_date,
    runtime: movie.runtime || 0,
    type: 'movie',
    director: movie.credits?.crew?.find(person => person.job === 'Director')?.name || '',
    actors: movie.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || '',
    platforms: [] // TMDB doesn't provide platform data
  };
};

/**
 * Transform TV show details to match our app's format
 * @param {Object} tv - TV show details from TMDB
 * @returns {Object} Transformed TV show details
 */
export const transformTVDetails = (tv) => {
  return {
    id: tv.id.toString(),
    title: tv.name,
    coverUrl: tv.poster_path ? `${TMDB_IMAGE_BASE_URL}${tv.poster_path}` : null,
    genre: tv.genres.map(g => g.name).join(', '),
    genreIds: tv.genres.map(g => g.id),
    description: tv.overview,
    rating: tv.vote_average || 0,
    releaseDate: tv.first_air_date,
    seasons: tv.number_of_seasons || 0,
    type: 'tv',
    creator: tv.created_by?.map(person => person.name).join(', ') || '',
    actors: tv.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || '',
    platforms: [] // TMDB doesn't provide platform data
  };
};
