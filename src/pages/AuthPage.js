import React from 'react';
import { AuthForms } from '../components/AuthForms';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AuthPage = () => {
  const { user, loading } = useAuth();
  
  // If user is already authenticated, redirect to home
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-24 w-auto"
          src="/assets/logo.svg"
          alt="DinoMatch"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to DinoMatch
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Find movies you'll both love
        </p>
      </div>

      <div className="mt-8">
        <AuthForms />
      </div>
    </div>
  );
};

export default AuthPage;
