import { getCachedMovie, cacheMovieDetails, incrementOMDBCounter, getOMDBCounter } from './firestore';

const TMDB_API_KEY = '9fb0b7dde8a42968698cad396ce2ff0b';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZmIwYjdkZGU4YTQyOTY4Njk4Y2FkMzk2Y2UyZmYwYiIsIm5iZiI6MTc0NTE1MzY2My4wNSwic3ViIjoiNjgwNGVlN2Y0MjFhMzA5NzVjYWE4NDk3Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.WawEd2l65xnavxfysawlkiC-L0QZacf70xAPFeZuNUA';
const OMDB_API_KEY = 'ca037129';
const OMDB_DAILY_LIMIT = 1000;

// TMDB API options
const tmdbOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
};

const fetchTMDBMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`
    );
    if (!response.ok) throw new Error('TMDB API error');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching TMDB movies:', error);
    throw error;
  }
};

const fetchOMDBDetails = async (imdbId) => {
  try {
    // Daily limit check
    const counter = await getOMDBCounter();
    if (counter >= OMDB_DAILY_LIMIT) throw new Error('OMDB daily limit reached');
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    if (!response.ok) {
      console.error('OMDB HTTP error:', response.status, response.statusText);
      return {};
    }
    const data = await response.json();
    if (data.Response === 'True') {
      await incrementOMDBCounter();
      return data;
    }
    console.warn('OMDB API returned error:', data.Error);
    return {};
  } catch (error) {
    if (error.message === 'OMDB daily limit reached') throw error;
    console.error('Error fetching OMDB details:', error);
    return {};
  }
};

const fetchTMDBDetails = async (movieId) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,watch/providers`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return await response.json();
  } catch (error) {
    console.error('Error fetching TMDB details:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    // Check cache first
    const cachedMovie = await getCachedMovie(movieId);
    if (cachedMovie) {
      return cachedMovie;
    }

    // Fetch from TMDB
    const tmdbData = await fetchTMDBDetails(movieId);

    // Try to fetch from OMDB first, fallback to TMDB ratings if limit reached
    let omdbData = {};
    if (tmdbData.imdb_id) {
      try {
        omdbData = await fetchOMDBDetails(tmdbData.imdb_id);
      } catch (error) {
        if (error.message !== 'OMDB daily limit reached') {
          console.error('OMDB fetch error:', error);
        }
        // Continue with TMDB data only
      }
    }

    // Combine data, preferring OMDB ratings when available
    const movieDetails = {
      id: tmdbData.id,
      title: tmdbData.title,
      overview: tmdbData.overview,
      posterPath: tmdbData.poster_path,
      backdropPath: tmdbData.backdrop_path,
      releaseDate: tmdbData.release_date,
      genres: tmdbData.genres,
      runtime: tmdbData.runtime,
      voteAverage: tmdbData.vote_average,
      imdbRating: omdbData.imdbRating ?? null,
      rottenTomatoesRating: omdbData.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value ?? null,
      metascoreRating: omdbData.Metascore ?? null,
      director: omdbData.Director ?? tmdbData.credits?.crew?.find(c => c.job === 'Director')?.name ?? null,
      writer: omdbData.Writer ?? null,
      cast: omdbData.Actors?.split(', ') ?? (tmdbData.credits?.cast?.slice(0, 5).map(actor => actor.name) || []),
      plot: omdbData.Plot ?? tmdbData.overview,
      rated: omdbData.Rated ?? null,
      awards: omdbData.Awards ?? null,
      boxOffice: omdbData.BoxOffice ?? null,
      trailer: tmdbData.videos?.results?.find(v => v.type === 'Trailer')?.key ?? null,
      watchProviders: tmdbData['watch/providers']?.results?.US ?? null,
      tmdbRating: tmdbData.vote_average.toFixed(1),
    };

    // Cache the details
    await cacheMovieDetails(movieId, movieDetails);

    return movieDetails;
  } catch (error) {
    console.error('Error getting movie details:', error);
    throw error;
  }
};

export const getMoviesToSwipe = async (page = 1) => {
  try {
    const movies = await fetchTMDBMovies(page);
    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      coverUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      description: movie.overview,
      genre: movie.genre_ids[0], // We'll need to map this to actual genre names
      rating: movie.vote_average,
    }));
  } catch (error) {
    console.error('Error getting movies to swipe:', error);
    throw error;
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    if (!response.ok) throw new Error('TMDB search error');
    const data = await response.json();
    return data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};
