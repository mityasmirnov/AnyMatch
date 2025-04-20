import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GroupProvider } from './contexts/GroupContext';
import AuthPage from './pages/AuthPage';
import GroupPage from './pages/GroupPage';
import GenreSurveyPage from './pages/GenreSurveyPage';
import MatchPage from './pages/MatchPage';
import FiltersPage from './pages/FiltersPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import './styles/globals.css';

// Toast provider for notifications
import { ToastProvider } from './contexts/ToastContext';

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <GroupProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/groups" element={<GroupPage />} />
                <Route path="/survey" element={<GenreSurveyPage />} />
                <Route path="/match" element={<MatchPage />} />
                <Route path="/filters" element={<FiltersPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </GroupProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
