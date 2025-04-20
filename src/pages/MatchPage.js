import React, { useState, useEffect, useCallback } from 'react';
import { SwipeCard } from '../components/SwipeCard';
import { useAuth } from '../contexts/AuthContext';
import { useGroup } from '../contexts/GroupContext';
import { getContentByGenre, getContentByMinRating, getRecommendations } from '../services/mockMovieApi';
import { getFirestore, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const MatchPage = () => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchFound, setMatchFound] = useState(false);
  const [matchedMovie, setMatchedMovie] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const { currentGroup, loading: groupLoading } = useGroup();
  const db = getFirestore();
  
  // If user is not authenticated, redirect to auth page
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  // If no group is selected, redirect to group page
  if (!currentGroup && !groupLoading) {
    return <Navigate to="/groups" replace />;
  }
  
  // Fetch movies based on preferences
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      
      let results = [];
      
      // If user has genre preferences, use them
      if (currentGroup?.preferences?.genres?.length > 0) {
        // Get movies for each preferred genre
        for (const genreId of currentGroup.preferences.genres) {
          const genreResults = await getContentByGenre(genreId);
          results = [...results, ...genreResults.results];
        }
      } else {
        // Otherwise get general recommendations
        const recommendations = await getRecommendations(20);
        results = recommendations.results;
      }
      
      // Filter by minimum rating if set
      if (currentGroup?.preferences?.minRating > 0) {
        results = results.filter(movie => movie.rating >= currentGroup.preferences.minRating);
      }
      
      // Remove duplicates
      const uniqueResults = Array.from(new Set(results.map(movie => movie.id)))
        .map(id => results.find(movie => movie.id === id));
      
      // Check for matches with other group members
      const groupRef = doc(db, 'groups', currentGroup.id);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();
      
      // If there are liked movies in the group
      if (groupData.likedMovies) {
        // Count likes for each movie
        const movieLikes = {};
        
        for (const memberId in groupData.likedMovies) {
          const memberLikes = groupData.likedMovies[memberId] || [];
          
          for (const movieId of memberLikes) {
            movieLikes[movieId] = (movieLikes[movieId] || 0) + 1;
          }
        }
        
        // Check if any movie has been liked by all members
        const memberCount = groupData.memberIds.length;
        for (const movieId in movieLikes) {
          if (movieLikes[movieId] === memberCount) {
            // We have a match!
            const matchedMovie = uniqueResults.find(m => m.id === movieId) || 
                                results.find(m => m.id === movieId);
            
            if (matchedMovie) {
              setMatchFound(true);
              setMatchedMovie(matchedMovie);
              break;
            }
          }
        }
      }
      
      // Shuffle the results for variety
      const shuffled = [...uniqueResults].sort(() => 0.5 - Math.random());
      
      setMovies(shuffled);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }, [currentGroup, db]);
  
  useEffect(() => {
    if (currentGroup && !groupLoading) {
      fetchMovies();
    }
  }, [currentGroup, groupLoading, fetchMovies]);
  
  const handleSwipe = async (direction) => {
    try {
      // If swiped right (liked), add to user's liked movies in the group
      if (direction === 'right' && currentGroup) {
        const movieId = movies[currentIndex].id;
        const groupRef = doc(db, 'groups', currentGroup.id);
        
        // Update the group document with the liked movie
        await updateDoc(groupRef, {
          [`likedMovies.${user.uid}`]: arrayUnion(movieId)
        });
        
        // Check if this created a match
        const groupDoc = await getDoc(groupRef);
        const groupData = groupDoc.data();
        
        if (groupData.likedMovies) {
          // Count likes for this movie
          let likesCount = 0;
          
          for (const memberId in groupData.likedMovies) {
            if (groupData.likedMovies[memberId].includes(movieId)) {
              likesCount++;
            }
          }
          
          // If all members liked this movie, it's a match
          if (likesCount === groupData.memberIds.length) {
            setMatchFound(true);
            setMatchedMovie(movies[currentIndex]);
            return;
          }
        }
      }
      
      // Move to next movie
      setCurrentIndex(prevIndex => prevIndex + 1);
    } catch (error) {
      console.error("Error handling swipe:", error);
    }
  };
  
  const handleFindMore = () => {
    setMatchFound(false);
    setMatchedMovie(null);
    fetchMovies();
  };
  
  if (loading || authLoading || groupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading movies...</p>
      </div>
    );
  }
  
  // If we've gone through all movies
  if (currentIndex >= movies.length && !matchFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No more movies to show</h2>
          <p className="text-gray-600 mb-8">
            You've gone through all our recommendations based on your preferences.
          </p>
          <Button onClick={handleFindMore}>Find More Movies</Button>
        </div>
      </div>
    );
  }
  
  // If we found a match
  if (matchFound && matchedMovie) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">It's a Match!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div 
                className="h-[300px] bg-cover bg-center rounded-lg mx-auto mb-4"
                style={{ backgroundImage: `url(${matchedMovie.coverUrl})` }}
              />
              <h3 className="text-xl font-bold mb-2">{matchedMovie.title}</h3>
              <p className="text-gray-600 mb-4">{matchedMovie.description}</p>
              <p className="mb-6">
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
                  ★ {matchedMovie.rating.toFixed(1)}
                </span>
                <span className="ml-2 text-gray-600">{matchedMovie.genre}</span>
              </p>
              
              {matchedMovie.platforms && matchedMovie.platforms.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Available on:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {matchedMovie.platforms.map(platform => (
                      <span 
                        key={platform} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <Button onClick={handleFindMore}>Find More Matches</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Find Your Match</h1>
          <p className="mt-2 text-lg text-gray-600">
            Swipe right on movies you like, left on ones you don't
          </p>
          {currentGroup && (
            <p className="mt-1 text-sm text-primary-600">
              Group: {currentGroup.name}
            </p>
          )}
        </div>
        
        {movies.length > 0 && currentIndex < movies.length && (
          <SwipeCard
            movie={movies[currentIndex]}
            onSwipe={handleSwipe}
          />
        )}
      </div>
    </div>
  );
};

export default MatchPage;
