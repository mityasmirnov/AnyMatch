'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      await signInWithApple();
      router.push('/dashboard');
    } catch (error) {
      console.error('Apple login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to DinoMatch
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Sign in with Google</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
            </button>

            <button
              onClick={handleAppleLogin}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Sign in with Apple</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M17.05,11.97 C17.0389275,10.3054167 18.4603333,9.39458333 18.5,9.37333333 C17.6895833,8.21416667 16.4229167,8.04166667 15.9570833,8.02708333 C14.8825,7.92083333 13.8445833,8.69791667 13.2954167,8.69791667 C12.7345833,8.69791667 11.8754167,8.03958333 10.9495833,8.05541667 C9.725,8.07125 8.57875,8.79541667 7.9375,9.91125 C6.61875,12.1895833 7.59791667,15.5579167 8.86541667,17.3470833 C9.49791667,18.2220833 10.2445833,19.2070833 11.2479167,19.1754167 C12.2245833,19.1395833 12.6029167,18.5645833 13.7879167,18.5645833 C14.9570833,18.5645833 15.3120833,19.1754167 16.3404167,19.1545833 C17.3970833,19.1379167 18.0479167,18.2629167 18.6645833,17.3795833 C19.3904167,16.3654167 19.6879167,15.3754167 19.7004167,15.3245833 C19.6754167,15.3162500 17.0645833,14.3754167 17.05,11.97 M15.4529167,6.71958333 C15.9695833,6.08708333 16.3245833,5.21333333 16.2195833,4.35083333 C15.4779167,4.38375 14.5645833,4.87041667 14.0270833,5.48958333 C13.5479167,6.03541667 13.1170833,6.94208333 13.2345833,7.77166667 C14.0645833,7.83875 14.9154167,7.35208333 15.4529167,6.71958333"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="text-sm text-center mt-4">
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
