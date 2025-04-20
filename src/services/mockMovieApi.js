/**
 * Mock Movie API Service
 * 
 * This service provides mock movie data for development and testing purposes.
 * It simulates the behavior of the TMDB API that will be integrated later.
 */

// Sample movie genres
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

// Sample movie data
const mockMovies = [
  {
    id: "1",
    title: "Jurassic Park",
    coverUrl: "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg",
    genre: "Adventure, Science Fiction",
    genreIds: [12, 878],
    description: "A wealthy entrepreneur secretly creates a theme park featuring living dinosaurs drawn from prehistoric DNA.",
    rating: 8.1,
    releaseDate: "1993-06-11",
    runtime: 127,
    platforms: ["Netflix", "Amazon Prime"]
  },
  {
    id: "2",
    title: "The Lost World: Jurassic Park",
    coverUrl: "https://image.tmdb.org/t/p/w500/jElpCJkSaRPYwIMwZY28gOjV1q4.jpg",
    genre: "Adventure, Action, Science Fiction",
    genreIds: [12, 28, 878],
    description: "Four years after Jurassic Park's genetically bred dinosaurs ran amok, multimillionaire John Hammond shocks chaos theorist Ian Malcolm by revealing that he has been breeding more dinosaurs.",
    rating: 6.5,
    releaseDate: "1997-05-23",
    runtime: 129,
    platforms: ["Netflix", "Hulu"]
  },
  {
    id: "3",
    title: "Inception",
    coverUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    genre: "Action, Science Fiction, Adventure",
    genreIds: [28, 878, 12],
    description: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.",
    rating: 8.3,
    releaseDate: "2010-07-16",
    runtime: 148,
    platforms: ["HBO Max", "Amazon Prime"]
  },
  {
    id: "4",
    title: "The Shawshank Redemption",
    coverUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    genre: "Drama, Crime",
    genreIds: [18, 80],
    description: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
    rating: 8.7,
    releaseDate: "1994-09-23",
    runtime: 142,
    platforms: ["Netflix", "Disney+"]
  },
  {
    id: "5",
    title: "The Godfather",
    coverUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    genre: "Drama, Crime",
    genreIds: [18, 80],
    description: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
    rating: 8.7,
    releaseDate: "1972-03-14",
    runtime: 175,
    platforms: ["Paramount+", "Amazon Prime"]
  },
  {
    id: "6",
    title: "Pulp Fiction",
    coverUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    genre: "Thriller, Crime",
    genreIds: [53, 80],
    description: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    rating: 8.5,
    releaseDate: "1994-09-10",
    runtime: 154,
    platforms: ["Netflix", "Hulu"]
  },
  {
    id: "7",
    title: "The Dark Knight",
    coverUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genre: "Drama, Action, Crime, Thriller",
    genreIds: [18, 28, 80, 53],
    description: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    rating: 8.5,
    releaseDate: "2008-07-16",
    runtime: 152,
    platforms: ["HBO Max", "Amazon Prime"]
  },
  {
    id: "8",
    title: "Fight Club",
    coverUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    genre: "Drama",
    genreIds: [18],
    description: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    rating: 8.4,
    releaseDate: "1999-10-15",
    runtime: 139,
    platforms: ["Hulu", "Disney+"]
  },
  {
    id: "9",
    title: "Forrest Gump",
    coverUrl: "https://image.tmdb.org/t/p/w500/h5J4W4veyxMXDMjeNxZI46TsHOb.jpg",
    genre: "Comedy, Drama, Romance",
    genreIds: [35, 18, 10749],
    description: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
    rating: 8.5,
    releaseDate: "1994-07-06",
    runtime: 142,
    platforms: ["Netflix", "Paramount+"]
  },
  {
    id: "10",
    title: "The Matrix",
    coverUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    genre: "Action, Science Fiction",
    genreIds: [28, 878],
    description: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    rating: 8.2,
    releaseDate: "1999-03-30",
    runtime: 136,
    platforms: ["HBO Max", "Amazon Prime"]
  },
  {
    id: "11",
    title: "Goodfellas",
    coverUrl: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    genre: "Drama, Crime",
    genreIds: [18, 80],
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.",
    rating: 8.5,
    releaseDate: "1990-09-12",
    runtime: 145,
    platforms: ["Netflix", "Hulu"]
  },
  {
    id: "12",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    coverUrl: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    genre: "Adventure, Fantasy, Action",
    genreIds: [12, 14, 28],
    description: "Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator.",
    rating: 8.4,
    releaseDate: "2001-12-18",
    runtime: 178,
    platforms: ["HBO Max", "Amazon Prime"]
  },
  {
    id: "13",
    title: "Interstellar",
    coverUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genre: "Adventure, Drama, Science Fiction",
    genreIds: [12, 18, 878],
    description: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    rating: 8.4,
    releaseDate: "2014-11-05",
    runtime: 169,
    platforms: ["Paramount+", "Amazon Prime"]
  },
  {
    id: "14",
    title: "The Lion King",
    coverUrl: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLm72jeNw.jpg",
    genre: "Animation, Family, Drama",
    genreIds: [16, 10751, 18],
    description: "A young lion prince is cast out of his pride by his cruel uncle, who claims he killed his father. While the uncle rules with an iron paw, the prince grows up beyond the Savannah, living by a philosophy: No worries for the rest of your days.",
    rating: 8.3,
    releaseDate: "1994-06-24",
    runtime: 88,
    platforms: ["Disney+", "Amazon Prime"]
  },
  {
    id: "15",
    title: "Spirited Away",
    coverUrl: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    genre: "Animation, Family, Fantasy",
    genreIds: [16, 10751, 14],
    description: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    rating: 8.5,
    releaseDate: "2001-07-20",
    runtime: 125,
    platforms: ["Netflix", "HBO Max"]
  },
  {
    id: "16",
    title: "Parasite",
    coverUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    genre: "Comedy, Thriller, Drama",
    genreIds: [35, 53, 18],
    description: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    rating: 8.5,
    releaseDate: "2019-05-30",
    runtime: 132,
    platforms: ["Hulu", "Amazon Prime"]
  },
  {
    id: "17",
    title: "Whiplash",
    coverUrl: "https://image.tmdb.org/t/p/w500/6uSPcdGNA2A6vJmCagXkvnutegs.jpg",
    genre: "Drama, Music",
    genreIds: [18, 10402],
    description: "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.",
    rating: 8.4,
    releaseDate: "2014-10-10",
    runtime: 107,
    platforms: ["Netflix", "Hulu"]
  },
  {
    id: "18",
    title: "The Departed",
    coverUrl: "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq8ynhCXvqk.jpg",
    genre: "Drama, Thriller, Crime",
    genreIds: [18, 53, 80],
    description: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
    rating: 8.2,
    releaseDate: "2006-10-05",
    runtime: 151,
    platforms: ["HBO Max", "Amazon Prime"]
  },
  {
    id: "19",
    title: "The Prestige",
    coverUrl: "https://image.tmdb.org/t/p/w500/tRNlZbgNCNiRzlPvPMdtjzTjXUz.jpg",
    genre: "Drama, Mystery, Thriller",
    genreIds: [18, 9648, 53],
    description: "A mysterious story of two magicians whose intense rivalry leads them on a life-long battle for supremacy -- full of obsession, deceit and jealousy with dangerous and deadly consequences.",
    rating: 8.2,
    releaseDate: "2006-10-19",
    runtime: 130,
    platforms: ["Netflix", "Disney+"]
  },
  {
    id: "20",
    title: "Eternal Sunshine of the Spotless Mind",
    coverUrl: "https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg",
    genre: "Science Fiction, Drama, Romance",
    genreIds: [878, 18, 10749],
    description: "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.",
    rating: 8.1,
    releaseDate: "2004-03-19",
    runtime: 108,
    platforms: ["Paramount+", "Amazon Prime"]
  }
];

// TV Series data
const mockTVSeries = [
  {
    id: "101",
    title: "Breaking Bad",
    coverUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    genre: "Drama, Crime",
    genreIds: [18, 80],
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    rating: 8.7,
    releaseDate: "2008-01-20",
    seasons: 5,
    platforms: ["Netflix", "Amazon Prime"]
  },
  {
    id: "102",
    title: "Game of Thrones",
    coverUrl: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    genre: "Sci-Fi & Fantasy, Drama, Action & Adventure",
    genreIds: [10765, 18, 10759],
    description: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.",
    rating: 8.4,
    releaseDate: "2011-04-17",
    seasons: 8,
    platforms: ["HBO Max", "Amazon Prime"]
  },
  {
    id: "103",
    title: "Stranger Things",
    coverUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    genre: "Sci-Fi & Fantasy, Drama, Mystery",
    genreIds: [10765, 18, 9648],
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    rating: 8.5,
    releaseDate: "2016-07-15",
    seasons: 4,
    platforms: ["Netflix"]
  },
  {
    id: "104",
    title: "The Office",
    coverUrl: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
    genre: "Comedy",
    genreIds: [35],
    description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    rating: 8.5,
    releaseDate: "2005-03-24",
    seasons: 9,
    platforms: ["Peacock", "Amazon Prime"]
  },
  {
    id: "105",
    title: "Friends",
    coverUrl: "https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg",
    genre: "Comedy, Drama",
    genreIds: [35, 18],
    description: "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.",
    rating: 8.4,
    releaseDate: "1994-09-22",
    seasons: 10,
    platforms: ["HBO Max", "Amazon Prime"]
  }
];

// Combined content (movies and TV series)
const allContent = [...mockMovies, ...mockTVSeries];

/**
 * Get a list of popular movies
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page
 * @returns {Promise<Array>} Array of movie objects
 */
export const getPopularMovies = (page = 1, limit = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const results = mockMovies.slice(startIndex, endIndex);
      resolve({
        results,
        page,
        total_pages: Math.ceil(mockMovies.length / limit),
        total_results: mockMovies.length
      });
    }, 300); // Simulate network delay
  });
};

/**
 * Get a list of popular TV series
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page
 * @returns {Promise<Array>} Array of TV series objects
 */
export const getPopularTVSeries = (page = 1, limit = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const results = mockTVSeries.slice(startIndex, endIndex);
      resolve({
        results,
        page,
        total_pages: Math.ceil(mockTVSeries.length / limit),
        total_results: mockTVSeries.length
      });
    }, 300); // Simulate network delay
  });
};

/**
 * Get details for a specific movie or TV show
 * @param {string} id - ID of the movie or TV show
 * @param {string} type - Type of content ('movie' or 'tv')
 * @returns {Promise<Object>} Content details
 */
export const getContentDetails = (id, type = 'movie') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const content = allContent.find(item => item.id === id);
      if (content) {
        resolve(content);
      } else {
        reject(new Error(`${type.toUpperCase()} with ID ${id} not found`));
      }
    }, 300);
  });
};

/**
 * Search for movies and TV shows
 * @param {string} query - Search query
 * @param {string} type - Type of content to search ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Search results
 */
export const searchContent = (query, type = 'all') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [];
      const lowerQuery = query.toLowerCase();
      
      if (type === 'movie' || type === 'all') {
        const movieResults = mockMovies.filter(movie => 
          movie.title.toLowerCase().includes(lowerQuery) || 
          movie.description.toLowerCase().includes(lowerQuery)
        );
        results = [...results, ...movieResults];
      }
      
      if (type === 'tv' || type === 'all') {
        const tvResults = mockTVSeries.filter(tv => 
          tv.title.toLowerCase().includes(lowerQuery) || 
          tv.description.toLowerCase().includes(lowerQuery)
        );
        results = [...results, ...tvResults];
      }
      
      resolve({
        results,
        total_results: results.length
      });
    }, 300);
  });
};

/**
 * Get a list of all available genres
 * @returns {Promise<Array>} Array of genre objects
 */
export const getGenres = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(genres);
    }, 200);
  });
};

/**
 * Get content filtered by genre
 * @param {number} genreId - ID of the genre to filter by
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByGenre = (genreId, type = 'all') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [];
      
      if (type === 'movie' || type === 'all') {
        const movieResults = mockMovies.filter(movie => 
          movie.genreIds.includes(genreId)
        );
        results = [...results, ...movieResults];
      }
      
      if (type === 'tv' || type === 'all') {
        const tvResults = mockTVSeries.filter(tv => 
          tv.genreIds.includes(genreId)
        );
        results = [...results, ...tvResults];
      }
      
      resolve({
        results,
        total_results: results.length
      });
    }, 300);
  });
};

/**
 * Get content filtered by minimum rating
 * @param {number} minRating - Minimum rating threshold
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Filtered content
 */
export const getContentByMinRating = (minRating, type = 'all') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [];
      
      if (type === 'movie' || type === 'all') {
        const movieResults = mockMovies.filter(movie => 
          movie.rating >= minRating
        );
        results = [...results, ...movieResults];
      }
      
      if (type === 'tv' || type === 'all') {
        const tvResults = mockTVSeries.filter(tv => 
          tv.rating >= minRating
        );
        results = [...results, ...tvResults];
      }
      
      resolve({
        results,
        total_results: results.length
      });
    }, 300);
  });
};

/**
 * Get random content recommendations
 * @param {number} count - Number of recommendations to return
 * @param {string} type - Type of content ('movie', 'tv', or 'all')
 * @returns {Promise<Array>} Recommended content
 */
export const getRecommendations = (count = 5, type = 'all') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let pool = [];
      
      if (type === 'movie' || type === 'all') {
        pool = [...pool, ...mockMovies];
      }
      
      if (type === 'tv' || type === 'all') {
        pool = [...pool, ...mockTVSeries];
      }
      
      // Shuffle the array
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      
      // Get first n elements
      const results = shuffled.slice(0, count);
      
      resolve({
        results,
        total_results: results.length
      });
    }, 300);
  });
};

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
