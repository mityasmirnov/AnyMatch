// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCNN7djVVIuDDFHtzCyZOeiIFFaMSkMuc",
  authDomain: "dinomatch-f0eb2.firebaseapp.com",
  projectId: "dinomatch-f0eb2",
  storageBucket: "dinomatch-f0eb2.firebasestorage.app",
  messagingSenderId: "413860366569",
  appId: "1:413860366569:web:0f43c0bdff78f8df304878",
  measurementId: "G-0867VBF1L6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
