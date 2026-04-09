import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import Footer from './components/Footer'
import { CartProvider } from './context/CartContext'
import { useCart } from './context/CartContext'

const SHOP_CONFIG = {
  name: "Trends&Toss",
  logoUrl: "/logo1.png",
  logoAlt: "Shop Logo"
}

// Glassmorphism Navigation Component
function GlassNav() {
  const { cart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [prevCartCount, setPrevCartCount] = useState(0)
  
  const user = JSON.parse(localStorage.getItem('user'))
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      console.log('Scroll position:', window.scrollY, 'Is scrolled:', isScrolled)
      setScrolled(isScrolled)
    }
    
    // Run immediately on mount
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    if (cartCount > prevCartCount && prevCartCount > 0) {
      setCartAnimating(true)
      setTimeout(() => setCartAnimating(false), 600)
    }
    setPrevCartCount(cartCount)
  }, [cartCount])

  return (
    <>
      {/* Desktop: Translucent Top Nav */}
      <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-white/20' 
          : 'bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/30 blur-lg rounded-full group-hover:bg-amber-500/50 transition-all"></div>
                <img 
                  src={SHOP_CONFIG.logoUrl} 
                  alt={SHOP_CONFIG.logoAlt}
                  className="relative h-10 w-10 object-contain rounded-lg group-hover:scale-110 transition-transform"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
              <span className="text-2xl font-extralight tracking-[0.2em] uppercase text-white/90 group-hover:text-amber-400 transition-colors">
                {SHOP_CONFIG.name}
              </span>
            </Link>
            
            {/* Navigation Links */}
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
              <Link to="/" className="px-5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                Home
              </Link>
              <Link to="/products" className="px-5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                Products
              </Link>
              
              {/* Cart with Animation */}
              <Link to="/cart" className="relative px-5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Cart
                  {cartCount > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full ${
                      cartAnimating ? 'animate-bounce' : ''
                    }`}>
                      {cartCount}
                    </span>
                  )}
                </span>
              </Link>
              
              {user ? (
                user.role === 'admin' && (
                  <Link to="/admin" className="px-5 py-2 rounded-full text-sm font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-all">
                    Admin
                  </Link>
                )
              ) : (
                <>
                  <Link to="/login" className="px-5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                    Login
                  </Link>
                  <Link to="/register" className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile: Floating Bottom Dock */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-slate-950/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 px-2 py-3">
          <div className="flex items-center justify-around">
            <Link to="/" className="flex flex-col items-center gap-1 p-2 text-white/70 hover:text-amber-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            
            <Link to="/products" className="flex flex-col items-center gap-1 p-2 text-white/70 hover:text-amber-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] font-medium">Shop</span>
            </Link>
            
            {/* Cart with Animation */}
            <Link to="/cart" className="relative flex flex-col items-center gap-1 p-2 text-white/70 hover:text-amber-400 transition-colors">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className={`absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full ${
                    cartAnimating ? 'animate-bounce' : ''
                  }`}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Cart</span>
            </Link>
            
            {user ? (
              user.role === 'admin' ? (
                <Link to="/admin" className="flex flex-col items-center gap-1 p-2 text-amber-400/90 hover:text-amber-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-medium">Admin</span>
                </Link>
              ) : (
                <Link to="/" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); }} className="flex flex-col items-center gap-1 p-2 text-white/70 hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-[10px] font-medium">Logout</span>
                </Link>
              )
            ) : (
              <Link to="/login" className="flex flex-col items-center gap-1 p-2 text-white/70 hover:text-amber-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

function App() {
  return (
    <Router>
      <CartProvider>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <GlassNav />

          <main className="flex-grow pt-20 pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Home />} /> {/* Products page */}
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
      </CartProvider>
    </Router>
  )
}

export default App