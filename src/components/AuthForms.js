import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';

const AuthForms = ({ className = '', ...props }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp, signIn, signInWithGoogle, signInWithApple } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAppleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithApple();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`w-full max-w-md mx-auto ${className}`} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isSignUp ? 'Create an Account' : 'Sign In'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="mb-4">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAppleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M16.7023,0 C16.7883,0 16.8743,0.001 16.9603,0.002 C17.1493,0.088 17.2463,0.208 17.2463,0.384 C17.2463,1.439 16.8353,2.25 16.0143,2.816 C15.1943,3.381 14.2463,3.535 13.1703,3.276 C13.0853,3.193 13.0003,3.11 13.0003,2.936 C13.0003,1.881 13.4113,1.07 14.2323,0.504 C15.0533,-0.062 16.0013,-0.216 16.7023,0 Z M20.6313,17.505 C20.6313,17.582 20.6203,17.658 20.5983,17.734 C20.1343,19.262 19.3223,20.516 18.1633,21.495 C17.0043,22.474 15.7353,22.995 14.3563,23.058 C13.4183,23.099 12.5613,22.868 11.7863,22.364 C11.0113,21.86 10.2363,21.608 9.4613,21.608 C8.6863,21.608 7.9113,21.86 7.1363,22.364 C6.3613,22.868 5.5043,23.099 4.5663,23.058 C3.1873,22.995 1.9183,22.474 0.7593,21.495 C-0.3997,20.516 -1.2117,19.262 -1.6757,17.734 C-1.6977,17.658 -1.7087,17.582 -1.7087,17.505 C-1.7087,16.88 -1.5307,16.297 -1.1747,15.756 C-0.8187,15.215 -0.3457,14.786 0.2443,14.47 C0.8343,14.154 1.4673,13.996 2.1433,13.996 C2.8193,13.996 3.4523,14.154 4.0423,14.47 C4.6323,14.786 5.1053,15.215 5.4613,15.756 C5.8173,16.297 5.9953,16.88 5.9953,17.505 C5.9953,18.13 6.1733,18.713 6.5293,19.254 C6.8853,19.795 7.3583,20.224 7.9483,20.54 C8.5383,20.856 9.1713,21.014 9.8473,21.014 C10.5233,21.014 11.1563,20.856 11.7463,20.54 C12.3363,20.224 12.8093,19.795 13.1653,19.254 C13.5213,18.713 13.6993,18.13 13.6993,17.505 C13.6993,16.88 13.8773,16.297 14.2333,15.756 C14.5893,15.215 15.0623,14.786 15.6523,14.47 C16.2423,14.154 16.8753,13.996 17.5513,13.996 C18.2273,13.996 18.8603,14.154 19.4503,14.47 C20.0403,14.786 20.5133,15.215 20.8693,15.756 C21.2253,16.297 21.4033,16.88 21.4033,17.505 C21.4033,17.505 21.4033,17.505 20.6313,17.505 Z M13.0003,3.058 L13.0003,3.058 C13.0003,3.058 13.0003,3.058 13.0003,3.058 C13.0003,3.058 13.0003,3.058 13.0003,3.058 Z M13.0003,12.332 L13.0003,12.332 C13.0003,12.332 13.0003,12.332 13.0003,12.332 C13.0003,12.332 13.0003,12.332 13.0003,12.332 Z M13.0003,12.332 L13.0003,12.332 C13.0003,11.191 13.3563,10.206 14.0683,9.378 C14.7803,8.55 15.6743,8.136 16.7503,8.136 C16.8363,8.136 16.9223,8.137 17.0083,8.138 C17.1973,8.224 17.2943,8.344 17.2943,8.498 C17.2943,8.652 17.2943,8.806 17.2943,8.96 C17.2943,9.114 17.2943,9.268 17.2943,9.422 C17.2943,9.576 17.1973,9.696 17.0083,9.782 C16.9223,9.783 16.8363,9.784 16.7503,9.784 C16.1603,9.784 15.6523,9.994 15.2263,10.414 C14.8003,10.834 14.5873,11.342 14.5873,11.936 C14.5873,12.53 14.8003,13.038 15.2263,13.458 C15.6523,13.878 16.1603,14.088 16.7503,14.088 C16.8363,14.088 16.9223,14.089 17.0083,14.09 C17.1973,14.176 17.2943,14.296 17.2943,14.45 C17.2943,14.604 17.2943,14.758 17.2943,14.912 C17.2943,15.066 17.2943,15.22 17.2943,15.374 C17.2943,15.528 17.1973,15.648 17.0083,15.734 C16.9223,15.735 16.8363,15.736 16.7503,15.736 C15.6743,15.736 14.7803,15.322 14.0683,14.494 C13.3563,13.666 13.0003,12.681 13.0003,11.54 C13.0003,11.54 13.0003,11.54 13.0003,12.332 Z M13.0003,3.058 L13.0003,3.058 C13.0003,4.199 12.6443,5.184 11.9323,6.012 C11.2203,6.84 10.3263,7.254 9.2503,7.254 C9.1643,7.254 9.0783,7.253 8.9923,7.252 C8.8033,7.166 8.7063,7.046 8.7063,6.892 C8.7063,6.738 8.7063,6.584 8.7063,6.43 C8.7063,6.276 8.7063,6.122 8.7063,5.968 C8.7063,5.814 8.8033,5.694 8.9923,5.608 C9.0783,5.607 9.1643,5.606 9.2503,5.606 C9.8403,5.606 10.3483,5.396 10.7743,4.976 C11.2003,4.556 11.4133,4.048 11.4133,3.454 C11.4133,2.86 11.2003,2.352 10.7743,1.932 C10.3483,1.512 9.8403,1.302 9.2503,1.302 C9.1643,1.302 9.0783,1.301 8.9923,1.3 C8.8033,1.214 8.7063,1.094 8.7063,0.94 C8.7063,0.786 8.7063,0.632 8.7063,0.478 C8.7063,0.324 8.7063,0.17 8.7063,0.016 C8.7063,-0.138 8.8033,-0.258 8.9923,-0.344 C9.0783,-0.345 9.1643,-0.346 9.2503,-0.346 C10.3263,-0.346 11.2203,0.068 11.9323,0.896 C12.6443,1.724 13.0003,2.709 13.0003,3.85 C13.0003,3.85 13.0003,3.85 13.0003,3.058 Z"
                    transform="translate(2 0.5)"
                  />
                </svg>
                Apple
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button
            type="button"
            className="text-sm text-primary-600 hover:text-primary-800"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export { AuthForms };
