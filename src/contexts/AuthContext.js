import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '../components/ui/toast-provider';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser({
              ...user,
              profile: userDoc.data()
            });
          } else {
            // Create user profile if it doesn't exist
            const newUserData = {
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              createdAt: new Date(),
              preferences: {
                favoriteGenres: [],
                dislikedGenres: []
              }
            };
            
            await setDoc(doc(db, 'users', user.uid), newUserData);
            
            setUser({
              ...user,
              profile: newUserData
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Sign up with email/password
  const signUp = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userData = {
        email: user.email,
        displayName: displayName || '',
        photoURL: '',
        createdAt: new Date(),
        preferences: {
          favoriteGenres: [],
          dislikedGenres: []
        }
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
        variant: "success"
      });
      
      return user;
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "error"
      });
      throw error;
    }
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Signed in",
        description: "You have successfully signed in.",
        variant: "success"
      });
      
      return user;
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "error"
      });
      throw error;
    }
  };

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const provider = result.providerId;
          toast({
            title: `Signed in with ${provider === 'apple.com' ? 'Apple' : 'Google'}`,
            description: "You have successfully signed in.",
            variant: "success"
          });
        }
      } catch (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "error"
        });
      }
    };

    handleRedirectResult();
  }, [auth]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "error"
      });
      throw error;
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      await signInWithRedirect(auth, provider);
    } catch (error) {
      toast({
        title: "Apple sign in failed",
        description: error.message,
        variant: "error"
      });
      throw error;
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await signOut(auth);
      
      toast({
        title: "Signed out",
        description: "You have been signed out.",
        variant: "info"
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "error"
      });
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      if (!user) throw new Error("No user is signed in");
      
      await setDoc(doc(db, 'users', user.uid), {
        ...user.profile,
        ...data
      }, { merge: true });
      
      // Update local user state
      setUser({
        ...user,
        profile: {
          ...user.profile,
          ...data
        }
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "error"
      });
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut: signOutUser,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
