import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { signInWithGoogle, signInWithEmail as firebaseSignIn, signUpWithEmail, signOutUser } from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  // Traditional login (backend JWT)
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // Google login
  const loginWithGoogle = async () => {
    try {
      const { user: firebaseUser } = await signInWithGoogle();
      
      // Send Firebase user to backend to create/get JWT
      const { data } = await api.post('/auth/google-login', {
        name: firebaseUser.name,
        email: firebaseUser.email,
        photo: firebaseUser.photo
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  // Email signup
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await signOutUser(); // Firebase sign out
    } catch (error) {
      console.error('Firebase sign out error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
