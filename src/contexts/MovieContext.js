import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useGroup } from './GroupContext';
import { useToast } from '../components/ui/toast-provider';
import { fetchMovies, fetchMovieDetails, fetchGenres } from '../services/tmdb';

const MovieContext = createContext(null);

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    favoriteGenres: [],
    dislikedGenres: [],
    minRating: 0,
    contentType: 'movie' // 'movie' or 'tv'
  });
  const [matches, setMatches] = useState([]);
  
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const { toast } = useToast();
  const db = getFirestore();

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setPreferences(userDoc.data().preferences || {
            favoriteGenres: [],
            dislikedGenres: [],
            minRating: 0
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [user, db]);

  // Load movies
  useEffect(() => {
    const loadMovies = async () => {
      if (!currentGroup) return;
      
      try {
        setLoading(true);
        const newMovies = await fetchMovies(currentPage, {
          genres: currentGroup.preferences?.genres,
          minRating: currentGroup.preferences?.minRating || 0,
          type: preferences.contentType
        });
        
        // Filter movies based on preferences
        const filteredMovies = newMovies.filter(movie => {
          const meetsRating = movie.rating >= (currentGroup.preferences?.minRating || 0);
          const meetsGenres = !currentGroup.preferences?.genres?.length || 
            currentGroup.preferences.genres.includes(movie.genre);
          return meetsRating && meetsGenres;
        });
        
        setMovies(prev => [...prev, ...filteredMovies]);
      } catch (error) {
        console.error('Error loading movies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load movies',
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (movies.length < 5) {
      loadMovies();
    }
  }, [currentPage, currentGroup]);

  // Load matches when group changes
  useEffect(() => {
    const loadMatches = async () => {
      if (!currentGroup || !user) return;
      
      try {
        const matchesRef = collection(db, 'matches');
        const q = query(matchesRef, where('groupId', '==', currentGroup.id));
        const querySnapshot = await getDocs(q);
        
        const matchedMovies = [];
        for (const doc of querySnapshot.docs) {
          const match = doc.data();
          const movieDetails = await fetchMovieDetails(match.movieId, match.mediaType);
          matchedMovies.push({
            ...match,
            ...movieDetails
          });
        }
        
        setMatches(matchedMovies);
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matches',
          variant: 'error'
        });
      }
    };

    loadMatches();
  }, [currentGroup, user]);

  const updatePreferences = async (newPreferences) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        preferences: {
          ...preferences,
          ...newPreferences
        }
      }, { merge: true });
      
      setPreferences(prev => ({
        ...prev,
        ...newPreferences
      }));
      
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been saved',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'error'
      });
    }
  };

  const recordSwipe = async (movieId, direction) => {
    if (!user || !currentGroup) return;
    
    try {
      // Record swipe
      await setDoc(doc(db, 'swipes', `${user.uid}_${movieId}`), {
        userId: user.uid,
        movieId,
        direction,
        groupId: currentGroup.id,
        timestamp: new Date()
      });
      
      // Check for match
      const groupDoc = await getDoc(doc(db, 'groups', currentGroup.id));
      const memberIds = groupDoc.data().memberIds;
      
      const swipesQuery = query(
        collection(db, 'swipes'),
        where('movieId', '==', movieId),
        where('groupId', '==', currentGroup.id),
        where('direction', '==', 'right')
      );
      
      const swipesSnapshot = await getDocs(swipesQuery);
      const rightSwipes = new Set(swipesSnapshot.docs.map(doc => doc.data().userId));
      
      // If all members have right-swiped, create a match
      if (memberIds.every(id => rightSwipes.has(id))) {
        const movieDetails = await getMovieDetails(movieId);
        const matchDoc = {
          movieId,
          groupId: currentGroup.id,
          matchedAt: new Date(),
          matchedBy: Array.from(rightSwipes),
          watched: false
        };
        
        await setDoc(doc(collection(db, 'matches')), matchDoc);
        
        setMatches(prev => [...prev, { ...matchDoc, ...movieDetails }]);
        
        toast({
          title: 'New Match!',
          description: `Everyone liked "${movieDetails.title}"!`,
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to record your choice',
        variant: 'error'
      });
    }
  };

  const markAsWatched = async (matchId) => {
    if (!user || !currentGroup) return;
    
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        watched: true,
        watchedAt: new Date()
      });
      
      setMatches(prev =>
        prev.map(match =>
          match.id === matchId
            ? { ...match, watched: true, watchedAt: new Date() }
            : match
        )
      );
      
      toast({
        title: 'Updated',
        description: 'Movie marked as watched',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error marking as watched:', error);
      toast({
        title: 'Error',
        description: 'Failed to update watch status',
        variant: 'error'
      });
    }
  };

  const value = {
    movies,
    loading,
    preferences,
    matches,
    updatePreferences,
    recordSwipe,
    markAsWatched,
    setCurrentPage
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === null) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};
