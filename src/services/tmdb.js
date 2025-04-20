const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const fetchMovies = async (page = 1, filters = {}) => {
  const { genres, minRating, type = 'movie' } = filters;
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    page: page.toString(),
    sort_by: 'popularity.desc',
    'vote_average.gte': (minRating || 0).toString(),
    with_genres: genres?.join(',') || '',
    'vote_count.gte': '100', // Ensure some minimum number of votes
    include_adult: 'false',
    language: 'en-US'
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch movies');
  
  const data = await response.json();
  
  return data.results.map(movie => ({
    id: movie.id,
    title: movie.title || movie.name,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date || movie.first_air_date,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    genreIds: movie.genre_ids,
    mediaType: type
  }));
};

export const fetchMovieDetails = async (movieId, type = 'movie') => {
  const endpoint = type === 'movie' ? '/movie/' : '/tv/';
  
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    append_to_response: 'watch/providers,credits,similar',
    language: 'en-US'
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}${movieId}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch movie details');
  
  const data = await response.json();
  
  return {
    id: data.id,
    title: data.title || data.name,
    overview: data.overview,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    releaseDate: data.release_date || data.first_air_date,
    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    genres: data.genres,
    runtime: data.runtime || data.episode_run_time?.[0],
    status: data.status,
    tagline: data.tagline,
    cast: data.credits?.cast?.slice(0, 5) || [],
    crew: data.credits?.crew?.slice(0, 3) || [],
    similar: data.similar?.results?.slice(0, 5) || [],
    watchProviders: data['watch/providers']?.results?.US || null,
    mediaType: type
  };
};

export const fetchGenres = async (type = 'movie') => {
  const endpoint = type === 'movie' ? '/genre/movie/list' : '/genre/tv/list';
  
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US'
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch genres');
  
  const data = await response.json();
  return data.genres;
};

export const searchMovies = async (query, page = 1) => {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query,
    page: page.toString(),
    include_adult: 'false',
    language: 'en-US'
  });

  const response = await fetch(`${TMDB_BASE_URL}/search/multi?${params}`);
  if (!response.ok) throw new Error('Failed to search movies');
  
  const data = await response.json();
  
  return data.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .map(item => ({
      id: item.id,
      title: item.title || item.name,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date || item.first_air_date,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
      genreIds: item.genre_ids,
      mediaType: item.media_type
    }));
};
