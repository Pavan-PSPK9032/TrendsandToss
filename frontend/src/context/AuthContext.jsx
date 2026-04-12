import { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api/axios';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, auth } from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync backend user profile from Firebase ID token
  const syncUser = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      localStorage.removeItem('user');
      return;
    }
    try {
      const idToken = await firebaseUser.getIdToken();
      const { data } = await api.post('/auth/firebase-login', { idToken });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    // Restore cached user immediately to avoid flash
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncUser(firebaseUser);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/password login via Firebase
  const login = async (email, password) => {
    const { user: firebaseUser } = await signInWithEmail(email, password);
    await syncUser(firebaseUser);
  };

  // Email/password registration via Firebase
  const register = async (name, email, password) => {
    const { user: firebaseUser } = await signUpWithEmail(name, email, password);
    await syncUser(firebaseUser);
  };

  // Google login via Firebase (no phone/password needed)
  const loginWithGoogle = async () => {
    const { user: firebaseUser } = await signInWithGoogle();
    await syncUser(firebaseUser);
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
