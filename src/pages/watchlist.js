'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getUserWatchlist, getUserGroups, getGroupMatches, removeFromUserWatchlist, addUserMovieRating, getUserMovieRatings } from '../services/firestore';
import { getMovieDetails } from '../services/movieService';
import Link from 'next/link';
import { useToast } from '../components/ui/toast-provider';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const [filter, setFilter] = useState('all');

  // Track watched movies
  const handleMarkWatched = useCallback((id) => {
    setMovies(prev => {
      // mark watched and reorder
      const updated = prev.map(m => m.id === id ? { ...m, watched: true } : m);
      const unwatched = updated.filter(m => !m.watched);
      const watched = updated.filter(m => m.watched);
      return [...unwatched, ...watched];
    });
  }, []);

  // Load user groups for dropdown
  useEffect(() => {
    if (!user) return;
    const loadGroups = async () => {
      try {
        const userGroups = await getUserGroups(user.uid);
        setGroups(userGroups);
      } catch (err) {
        console.error('Error loading groups:', err);
      }
    };
    loadGroups();
  }, [user]);

  // Switch modes between personal and group watchlists
  const handleModeChange = (e) => {
    if (e.target.value === 'personal') {
      setSelectedGroup(null);
    } else {
      const grp = groups.find(g => g.id === e.target.value);
      setSelectedGroup(grp);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    setError(null);
    (async () => {
      setLoading(true);
      try {
        let ids;
        if (!selectedGroup) {
          ids = await getUserWatchlist(user.uid);
        } else {
          ids = await getGroupMatches(selectedGroup.id);
        }
        const details = await Promise.all(ids.map(id => getMovieDetails(id)));
        setMovies(details.map(d => ({ ...d, watched: false })));  
      } catch (e) {
        console.error('Watchlist load failed:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, selectedGroup]);

  // Load user-specific movie ratings
  useEffect(() => {
    if (!user) return;
    const loadRatings = async () => {
      try {
        const ratings = await getUserMovieRatings(user.uid);
        setUserRatings(ratings);
      } catch (err) {
        console.error('Ratings load failed:', err);
      }
    };
    loadRatings();
  }, [user]);

  // Compute displayed movies based on filter
  const displayedMovies = filter === 'new'
    ? movies.filter(m => !m.watched)
    : filter === 'watched'
      ? movies.filter(m => m.watched)
      : [...movies.filter(m => !m.watched), ...movies.filter(m => m.watched)];

  if (authLoading || loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading watchlist: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{!selectedGroup ? 'My Watchlist' : `${selectedGroup.name} Matches`}</h1>
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="modeSelect" className="block text-sm font-medium text-gray-900 dark:text-gray-100">Mode:</label>
          <Select id="modeSelect" value={selectedGroup?.id || 'personal'} onChange={handleModeChange} className="w-48">
            <option value="personal">Personal</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="filterSelect" className="block text-sm font-medium text-gray-900 dark:text-gray-100">Filter:</label>
          <Select id="filterSelect" value={filter} onChange={e => setFilter(e.target.value)} className="w-48">
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="watched">Watched</option>
          </Select>
        </div>
        {displayedMovies.length === 0 ? (
          <p className="text-center text-gray-500">No movies in this filter.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {displayedMovies.map(movie => (
              <div key={movie.id} className="flex flex-col items-center">
                <Link href={`/movie/${movie.id}`}>                
                  <div className="aspect-[2/3] rounded-lg overflow-hidden hover:opacity-90 transition">
                    <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                </Link>
                {/* Ratings */}
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-200">
                  {movie.imdbRating && <span>IMDB: {movie.imdbRating}</span>}
                  {movie.rottenTomatoesRating && <span>RT: {movie.rottenTomatoesRating}</span>}
                  {movie.metascoreRating && <span>Metascore: {movie.metascoreRating}</span>}
                  {movie.tmdbRating && <span>TMDB: {movie.tmdbRating}</span>}
                  {!(movie.imdbRating || movie.rottenTomatoesRating || movie.metascoreRating || movie.tmdbRating) && (
                    <span>No Ratings</span>
                  )}
                </div>
                {/* Your Rating */}
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const r = i + 1;
                    const fill = (userRatings[movie.id] || 0) >= r;
                    return (
                      <button
                        key={r}
                        onClick={async () => {
                          await addUserMovieRating(user.uid, movie.id, r);
                          setUserRatings(prev => ({ ...prev, [movie.id]: r }));
                        }}
                        className="focus:outline-none text-yellow-400 text-xl"
                      >
                        {fill ? '★' : '☆'}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2">
                  {!movie.watched ? (
                    <Button size="sm" onClick={() => handleMarkWatched(movie.id)}>Watched</Button>
                  ) : (
                    <span className="text-sm text-gray-500">Watched</span>
                  )}
                  {!selectedGroup && (
                    <Button size="sm" variant="destructive" onClick={async () => {
                      await removeFromUserWatchlist(user.uid, movie.id);
                      setMovies(prev => prev.filter(m => m.id !== movie.id));
                    }}>Remove</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
