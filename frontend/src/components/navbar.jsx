import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-navy text-white px-6 py-4 flex justify-between items-center border-b border-gold/20">
      <Link to="/" className="font-playfair text-2xl font-semibold tracking-widest text-white hover:text-gold transition-colors">
        Trends&amp;Toss
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
        <Link to="/" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Home</Link>
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
      </div>
    </nav>
  );
}
