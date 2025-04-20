import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useGroup } from '../contexts/GroupContext';
import { getRecommendations } from '../services/mockMovieApi';
import { Navigate } from 'react-router-dom';

const DashboardPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { groups, currentGroup, selectGroup, loading: groupLoading } = useGroup();
  
  // If user is not authenticated, redirect to auth page
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getRecommendations(6);
        setRecommendations(data.results);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);
  
  if (loading || authLoading || groupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome to DinoMatch</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find movies and TV shows you'll both love
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Groups Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Groups</CardTitle>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">You haven't joined any groups yet.</p>
                  <Button onClick={() => window.location.href = '/groups'}>
                    Create or Join a Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map(group => (
                    <div 
                      key={group.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        currentGroup && currentGroup.id === group.id
                          ? 'bg-primary-50 border-primary-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => selectGroup(group.id)}
                    >
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-gray-500">
                        {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/groups'}
                  >
                    Manage Groups
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Actions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start text-left px-4 py-6 text-lg"
                  onClick={() => window.location.href = '/match'}
                  disabled={!currentGroup}
                >
                  <span className="mr-2">🎬</span>
                  Start Matching Movies
                </Button>
                
                <Button 
                  className="w-full justify-start text-left px-4 py-6 text-lg"
                  variant="outline"
                  onClick={() => window.location.href = '/survey'}
                >
                  <span className="mr-2">📋</span>
                  Update Genre Preferences
                </Button>
                
                <Button 
                  className="w-full justify-start text-left px-4 py-6 text-lg"
                  variant="outline"
                  onClick={() => window.location.href = '/filters'}
                  disabled={!currentGroup}
                >
                  <span className="mr-2">🔍</span>
                  Adjust Content Filters
                </Button>
              </div>
              
              {!currentGroup && (
                <p className="mt-4 text-sm text-amber-600">
                  Please select or create a group to start matching movies.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recommendations Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map(movie => (
              <div key={movie.id} className="group cursor-pointer">
                <div className="aspect-w-2 aspect-h-3 rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={movie.coverUrl} 
                    alt={movie.title}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-1">{movie.title}</h3>
                <p className="text-xs text-gray-500">{movie.genre.split(',')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
