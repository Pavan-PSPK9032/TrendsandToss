import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import Footer from './components/Footer'

const SHOP_CONFIG = {
  name: "Trends&Toss",
  logoUrl: "/logo1.png",
  logoAlt: "Shop Logo"
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-slate-950 text-white p-4 shadow-xl border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={SHOP_CONFIG.logoUrl} 
                alt={SHOP_CONFIG.logoAlt}
                className="h-10 w-10 object-contain rounded-lg group-hover:scale-110 transition-transform"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="text-2xl font-light tracking-widest uppercase group-hover:text-amber-400 transition-colors">
                {SHOP_CONFIG.name}
              </span>
            </Link>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm font-medium tracking-wide">
              <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
              <Link to="/cart" className="hover:text-amber-400 transition-colors">Cart</Link>
              <Link to="/admin" className="hover:text-amber-400 transition-colors">Admin</Link>
              <Link to="/login" className="hover:text-amber-400 transition-colors">Login</Link>
              <Link to="/register" className="text-amber-400 hover:text-amber-300 transition-colors">Register</Link>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App