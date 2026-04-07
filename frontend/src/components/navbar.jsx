import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">🛒 ShopHub</Link>
      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        {user ? (
          <>
            <Link to="/cart" className="hover:text-blue-400">Cart</Link>
            {user.role === 'admin' && <Link to="/admin" className="hover:text-yellow-400">Admin</Link>}
            <button onClick={logout} className="hover:text-red-400">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400">Login</Link>
            <Link to="/register" className="hover:text-blue-400">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}