'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getUserWatchlist } from '../services/firestore';
import { getMovieDetails } from '../services/movieService';
import Link from 'next/link';
import { useToast } from '../components/ui/toast-provider';
import { Button } from '../components/ui/button';

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const ids = await getUserWatchlist(user.uid);
        const details = await Promise.all(ids.map(id => getMovieDetails(id)));
        setMovies(details.map(d => ({ ...d, watched: false })));
      } catch (e) {
        console.error('Watchlist load failed:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Watchlist</h1>
        {movies.length === 0 ? (
          <p className="text-center text-gray-500">No movies in your watchlist.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movies.map(movie => (
              <div key={movie.id} className="flex flex-col items-center">
                <Link href={`/movie/${movie.id}`}>                
                  <div className="aspect-[2/3] rounded-lg overflow-hidden hover:opacity-90 transition">
                    <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="mt-2">
                  {!movie.watched ? (
                    <Button size="sm" onClick={() => handleMarkWatched(movie.id)}>Watched</Button>
                  ) : (
                    <span className="text-sm text-gray-500">Watched</span>
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
