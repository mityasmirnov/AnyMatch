'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { SwipeCard } from '../components/SwipeCard';
import { getMoviesToSwipe } from '../services/movieService';
import { 
  getUserGroups,
  addMoviePreference,
  addToUserWatchlist,
  getUserWatchlist,
  getGroupMatches
} from '../services/firestore';
import { useToast } from '../components/ui/toast-provider';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { useMovies } from '../contexts/MovieContext';

export default function SwipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { preferences } = useMovies();
  
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reset movies when filters or group change
  useEffect(() => {
    setMovies([]);
    setCurrentPage(1);
  }, [preferences, selectedGroup]);

  // Load initial movies and apply filters
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const newMovies = await getMoviesToSwipe(currentPage);
        const prefs = selectedGroup?.preferences || preferences;
        const filtered = newMovies.filter(movie => {
          const meetsRating = movie.rating >= (prefs.minRating || 0);
          const meetsGenre = !prefs.genres?.length || prefs.genres.includes(movie.genre);
          return meetsRating && meetsGenre;
        });
        setMovies(prev => [...prev, ...filtered]);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load movies',
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [currentPage, preferences, selectedGroup]);

  // Load user's groups
  useEffect(() => {
    const loadGroups = async () => {
      if (!user) return;
      try {
        const userGroups = await getUserGroups(user.uid);
        setGroups(userGroups);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load groups',
          variant: 'error'
        });
      }
    };

    loadGroups();
  }, [user]);

  // Load group matches when group is selected
  useEffect(() => {
    const loadMatches = async () => {
      if (!selectedGroup) return;
      try {
        const groupMatches = await getGroupMatches(selectedGroup);
        setMatches(groupMatches);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load matches',
          variant: 'error'
        });
      }
    };

    loadMatches();
  }, [selectedGroup]);

  const handleSwipe = async (direction) => {
    const currentMovie = movies[0];
    try {
      if (!selectedGroup) {
        if (direction === 'right') {
          await addToUserWatchlist(user.uid, currentMovie.id);
          toast({
            title: 'Added to Watchlist',
            description: currentMovie.title,
            variant: 'success'
          });
        }
      } else {
        await addMoviePreference(user.uid, currentMovie.id, direction);
        const updatedMatches = await getGroupMatches(selectedGroup);
        if (updatedMatches.length > matches.length) {
          toast({
            title: 'New Match!',
            description: `You matched on "${currentMovie.title}"`,
            variant: 'success'
          });
        }
        setMatches(updatedMatches);
      }
      // Remove and load next
      setMovies(prev => prev.slice(1));
      if (movies.length < 5) setCurrentPage(prev => prev + 1);
    } catch (error) {
      toast({
        title: 'Error',
        description: selectedGroup ? 'Failed to record preference' : 'Failed to add to watchlist',
        variant: 'error'
      });
    }
  };

  const handleSyncLikes = async () => {
    try {
      const ids = await getUserWatchlist(user.uid);
      for (const id of ids) {
        await addMoviePreference(user.uid, id, 'right');
      }
      const updatedMatches = await getGroupMatches(selectedGroup);
      setMatches(updatedMatches);
      toast({ title: 'Synced likes', description: 'Your likes have been synced to this group', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to sync likes', variant: 'error' });
    }
  };

  // Handle switching between personal and group modes
  const handleModeChange = (e) => {
    const val = e.target.value;
    if (val === 'personal') {
      setSelectedGroup(null);
    } else {
      const grp = groups.find(g => g.id === val);
      setSelectedGroup(grp);
    }
  };

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (!user || authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end gap-4 mb-4">
          <Link href="/watchlist"><Button variant="outline">My Watchlist</Button></Link>
          <Link href="/group-watchlist"><Button variant="outline" disabled={!selectedGroup}>Group Watchlist</Button></Link>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="modeSelect" className="block text-sm font-medium text-gray-900 dark:text-gray-100">Mode:</label>
          <Select
            id="modeSelect"
            value={selectedGroup?.id || 'personal'}
            onChange={handleModeChange}
            className="w-48"
          >
            <option value="personal">Personal</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>
        </div>
        
        {selectedGroup && (
          <div className="flex justify-center mb-4">
            <Button variant="secondary" onClick={handleSyncLikes}>Sync My Likes</Button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : movies.length > 0 ? (
          <SwipeCard movie={movies[0]} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-medium text-gray-900">No More Movies</h3>
            <p className="mt-2 text-gray-500">Check back later for more movies to swipe!</p>
          </div>
        )}

        {selectedGroup && matches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Group Matches</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {matches.map(movieId => (
                <div
                  key={movieId}
                  className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movies.find(m => m.id === movieId)?.posterPath}`}
                    alt={movies.find(m => m.id === movieId)?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
