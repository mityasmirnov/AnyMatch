import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { SwipeCard } from '../components/SwipeCard';
import { GroupManagement } from '../components/GroupManagement';
import { getMoviesToSwipe } from '../services/movieService';
import { 
  createGroup, 
  joinGroup, 
  leaveGroup, 
  getUserGroups,
  addMoviePreference,
  getGroupMatches
} from '../services/firestore';
import { useToast } from '../components/ui/toast-provider';

export default function SwipePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial movies
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const newMovies = await getMoviesToSwipe(currentPage);
        setMovies(prev => [...prev, ...newMovies]);
        setLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load movies',
          variant: 'error'
        });
      }
    };

    loadMovies();
  }, [currentPage]);

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
    if (!selectedGroup) {
      toast({
        title: 'Select a Group',
        description: 'Please select a group before swiping',
        variant: 'warning'
      });
      return;
    }

    const currentMovie = movies[0];
    
    try {
      // Record preference
      await addMoviePreference(user.uid, currentMovie.id, direction);
      
      // Remove swiped movie
      setMovies(prev => prev.slice(1));
      
      // Load more movies if needed
      if (movies.length < 5) {
        setCurrentPage(prev => prev + 1);
      }

      // Check for new matches
      const updatedMatches = await getGroupMatches(selectedGroup);
      if (updatedMatches.length > matches.length) {
        const newMatch = updatedMatches.find(m => !matches.includes(m));
        toast({
          title: 'New Match!',
          description: `You matched on "${currentMovie.title}"`,
          variant: 'success'
        });
      }
      setMatches(updatedMatches);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record preference',
        variant: 'error'
      });
    }
  };

  const handleCreateGroup = async (name) => {
    try {
      await createGroup(user.uid, name);
      const updatedGroups = await getUserGroups(user.uid);
      setGroups(updatedGroups);
      toast({
        title: 'Success',
        description: 'Group created successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'error'
      });
    }
  };

  const handleJoinGroup = async (code) => {
    try {
      await joinGroup(user.uid, code);
      const updatedGroups = await getUserGroups(user.uid);
      setGroups(updatedGroups);
      toast({
        title: 'Success',
        description: 'Joined group successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error'
      });
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await leaveGroup(user.uid, groupId);
      const updatedGroups = await getUserGroups(user.uid);
      setGroups(updatedGroups);
      if (selectedGroup === groupId) {
        setSelectedGroup(null);
      }
      toast({
        title: 'Success',
        description: 'Left group successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave group',
        variant: 'error'
      });
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <GroupManagement
          groups={groups}
          onCreateGroup={handleCreateGroup}
          onJoinGroup={handleJoinGroup}
          onLeaveGroup={handleLeaveGroup}
          onSelectGroup={setSelectedGroup}
          className="mb-8"
        />
        
        {selectedGroup ? (
          loading ? (
            <div className="flex justify-center items-center h-[500px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : movies.length > 0 ? (
            <SwipeCard
              movie={movies[0]}
              onSwipe={handleSwipe}
            />
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-gray-900">No More Movies</h3>
              <p className="mt-2 text-gray-500">Check back later for more movies to swipe!</p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-medium text-gray-900">Select a Group</h3>
            <p className="mt-2 text-gray-500">Choose a group to start swiping!</p>
          </div>
        )}

        {matches.length > 0 && (
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
