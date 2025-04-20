import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import { useGroup } from '../contexts/GroupContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { matches, markAsWatched } = useMovies();
  const { currentGroup } = useGroup();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || !currentGroup) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Group Matches
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Movies that everyone in {currentGroup.name} wants to watch
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900">No Matches Yet</h3>
            <p className="mt-2 text-gray-500">
              Start swiping to find movies you all love!
            </p>
            <Button
              onClick={() => router.push('/swipe')}
              className="mt-4"
            >
              Start Swiping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <div 
                  className="h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${match.posterPath})` }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{match.title}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">
                      {new Date(match.matchedAt).toLocaleDateString()}
                    </span>
                    <span className="ml-auto bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-sm">
                      ★ {match.voteAverage.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {match.overview}
                  </p>
                  {match.watched ? (
                    <div className="mt-4 flex items-center text-green-600">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Watched on {new Date(match.watchedAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <Button
                      onClick={() => markAsWatched(match.id)}
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      Mark as Watched
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
