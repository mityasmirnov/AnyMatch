import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  updateDoc,
  addDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

// OMDB Counter
export const getOMDBCounter = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const counterDoc = await getDoc(doc(db, 'counters', `omdb_${today}`));
    return counterDoc.exists() ? counterDoc.data().count : 0;
  } catch (error) {
    console.error('Error getting OMDB counter:', error);
    return 0;
  }
};

export const incrementOMDBCounter = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const counterRef = doc(db, 'counters', `omdb_${today}`);
    
    await setDoc(counterRef, {
      count: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error incrementing OMDB counter:', error);
  }
};

// Groups
export const createGroup = async (userId, groupName) => {
  try {
    const groupRef = await addDoc(collection(db, 'groups'), {
      name: groupName,
      createdBy: userId,
      members: [userId],
      createdAt: serverTimestamp(),
      joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });
    return groupRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const joinGroup = async (userId, joinCode) => {
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('joinCode', '==', joinCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid join code');
    }

    const groupDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'groups', groupDoc.id), {
      members: arrayUnion(userId),
    });

    return groupDoc.id;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const leaveGroup = async (userId, groupId) => {
  try {
    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayRemove(userId),
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

export const getUserGroups = async (userId) => {
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('members', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
};

// Movie Preferences
export const addMoviePreference = async (userId, movieId, preference) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`moviePreferences.${movieId}`]: preference,
    });
  } catch (error) {
    console.error('Error adding movie preference:', error);
    throw error;
  }
};

export const getGroupMatches = async (groupId) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    const members = groupDoc.data().members;
    
    // Get all members' preferences
    const preferencesPromises = members.map(async (userId) => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.data().moviePreferences || {};
    });
    
    const allPreferences = await Promise.all(preferencesPromises);
    
    // Find movies that all members liked
    const matches = {};
    allPreferences.forEach((userPrefs) => {
      Object.entries(userPrefs).forEach(([movieId, pref]) => {
        if (pref === 'right') {
          matches[movieId] = (matches[movieId] || 0) + 1;
        }
      });
    });
    
    return Object.entries(matches)
      .filter(([_, count]) => count === members.length)
      .map(([movieId]) => movieId);
  } catch (error) {
    console.error('Error getting group matches:', error);
    throw error;
  }
};

// Movie Cache
export const cacheMovieDetails = async (movieId, details) => {
  try {
    await setDoc(doc(db, 'movies', movieId), {
      ...details,
      cachedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error caching movie details:', error);
    throw error;
  }
};

export const getCachedMovie = async (movieId) => {
  try {
    const movieDoc = await getDoc(doc(db, 'movies', movieId));
    if (movieDoc.exists()) {
      return movieDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting cached movie:', error);
    throw error;
  }
};
