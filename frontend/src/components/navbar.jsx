import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tt_dark') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tt_dark', darkMode);
  }, [darkMode]);

  const toggleDark = () => setDarkMode(prev => !prev);

  return (
    <nav className="bg-navy text-white px-6 py-4 flex justify-between items-center border-b border-gold/20">
      <Link to="/" className="flex items-center gap-3 group">
        <img src="/logo.png" alt="Trends & Toss" className="h-8 w-auto object-contain group-hover:opacity-80 transition-opacity" />
        <span className="font-playfair text-2xl font-semibold tracking-widest text-white group-hover:text-gold transition-colors">
          Trends&amp;Toss
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
        <Link to="/" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Home</Link>
        <Link to="/shop" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Shop</Link>
        {user ? (
          <>
            <Link to="/cart" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Cart</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-gold hover:text-gold-light transition-colors uppercase text-xs tracking-widest">Admin</Link>
            )}
            <button
              onClick={logout}
              className="text-white/60 hover:text-white transition-colors uppercase text-xs tracking-widest"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Login</Link>
            <Link
              to="/register"
              className="bg-gold text-navy px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gold-dark transition-colors"
            >
              Register
            </Link>
          </>
        )}
        <button
          onClick={toggleDark}
          className="text-white/60 hover:text-gold transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
