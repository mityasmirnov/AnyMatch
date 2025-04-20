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

// Personal Watchlist: add and get functions
export const addToUserWatchlist = async (userId, movieId) => {
  try {
    const ref = doc(db, 'userWatchlist', userId);
    await setDoc(ref, {
      movies: arrayUnion(movieId),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error adding to user watchlist:', error);
    throw error;
  }
};

export const getUserWatchlist = async (userId) => {
  try {
    const snap = await getDoc(doc(db, 'userWatchlist', userId));
    return snap.exists() ? snap.data().movies || [] : [];
  } catch (error) {
    console.error('Error getting user watchlist:', error);
    return [];
  }
};

// Group Watchlist
export const getGroupWatchlist = async (groupId) => {
  try {
    const snap = await getDoc(doc(db, 'groups', groupId));
    return snap.exists() ? snap.data().watchlist || [] : [];
  } catch (error) {
    console.error('Error getting group watchlist:', error);
    return [];
  }
};

export const getGroupMatches = async (groupId) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    const members = groupDoc.data().members;
    const preferencesPromises = members.map(async (userId) => {
      const d = await getDoc(doc(db, 'users', userId));
      return d.data().moviePreferences || {};
    });
    const allPreferences = await Promise.all(preferencesPromises);
    const counts = {};
    allPreferences.forEach(userPrefs => {
      Object.entries(userPrefs).forEach(([id, pref]) => {
        if (pref === 'right') counts[id] = (counts[id] || 0) + 1;
      });
    });
    const matchIds = Object.entries(counts)
      .filter(([, c]) => c === members.length)
      .map(([id]) => id);
    // Persist
    await updateDoc(doc(db, 'groups', groupId), {
      watchlist: matchIds,
      updatedAt: serverTimestamp()
    });
    return matchIds;
  } catch (error) {
    console.error('Error getting group matches:', error);
    throw error;
  }
};

// Movie Cache
export const cacheMovieDetails = async (movieId, details) => {
  try {
    await setDoc(doc(db, 'movies', String(movieId)), {
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
    const movieDoc = await getDoc(doc(db, 'movies', String(movieId)));
    if (movieDoc.exists()) {
      return movieDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting cached movie:', error);
    throw error;
  }
};
