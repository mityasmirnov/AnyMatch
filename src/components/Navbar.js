import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">DinoMatch</span>
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/dashboard'
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/swipe"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/swipe'
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Swipe Movies
                </Link>
                <Link
                  href="/matches"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/matches'
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Matches
                </Link>
                <Link
                  href="/survey"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/survey'
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Preferences
                </Link>
                <Link
                  href="/filters"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/filters'
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Filters
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.photoURL ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
