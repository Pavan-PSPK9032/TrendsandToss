import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5JE0ISgp8X-AlL0iDOgXRfJUmRqy815A",
  authDomain: "trendsandtoss.firebaseapp.com",
  projectId: "trendsandtoss",
  storageBucket: "trendsandtoss.firebasestorage.app",
  messagingSenderId: "841269549640",
  appId: "1:841269549640:web:9abd4b23d7d946bd1e967d",
  measurementId: "G-VTM0W0GYVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL
      }
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || email.split('@')[0]
      }
    };
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

// Email/Password Sign Up
export const signUpWithEmail = async (name, email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile with name
    await result.user.updateProfile({ displayName: name });
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: name
      }
    };
  } catch (error) {
    console.error('Sign-up error:', error);
    throw error;
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

export { auth };
export default app;
