import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/toast-provider';
import { GroupProvider } from '../contexts/GroupContext';
import { MovieProvider } from '../contexts/MovieContext';
import { Navbar } from '../components/Navbar';
import '../services/firebase'; // Initialize Firebase

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <GroupProvider>
          <MovieProvider>
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-600 to-indigo-700">
              <Navbar />
              <main className="flex-1">
                <Component {...pageProps} />
              </main>
              <div id="portal-root" />
            </div>
          </MovieProvider>
        </GroupProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
