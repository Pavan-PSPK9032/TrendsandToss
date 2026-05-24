import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import SplashScreen from './components/SplashScreen'
import { CartProvider, useCart } from './context/CartContext'
import { useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Coupons = lazy(() => import('./pages/Coupons'))
const Footer = lazy(() => import('./components/Footer'))

const SHOP_CONFIG = {
  name: "Trends&Toss",
  logoUrl: "/logo1.png",
  logoAlt: "Shop Logo"
}

// Navigation Component
function GlassNav() {
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [prevCartCount, setPrevCartCount] = useState(0)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tt_dark') === 'true'
    return false
  })
  
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('tt_dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
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
      {/* Desktop Nav */}
      <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-navy text-white shadow-lg border-b border-gold/20' 
          : 'bg-navy text-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-playfair text-2xl font-semibold tracking-widest text-white hover:text-gold transition-colors">
              Trends&amp;Toss
            </Link>
            
            <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
              <Link to="/" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Home</Link>
              <Link to="/products" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Shop</Link>
              
              <Link to="/cart" className="relative text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Cart
                  {cartCount > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-navy bg-gold ${
                      cartAnimating ? 'animate-bounce' : ''
                    }`}>
                      {cartCount}
                    </span>
                  )}
                </span>
              </Link>
              
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-gold hover:text-gold-light transition-colors uppercase text-xs tracking-widest">Admin</Link>
                  )}
                  <button 
                    onClick={async () => { await logout(); window.location.href = '/' }} 
                    className="text-white/60 hover:text-white transition-colors uppercase text-xs tracking-widest"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white/80 hover:text-gold transition-colors uppercase text-xs tracking-widest">Login</Link>
                  <Link to="/register" className="bg-gold text-navy px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gold-dark transition-colors">Register</Link>
                </>
              )}
              <button onClick={() => setDarkMode(p => !p)} className="text-white/60 hover:text-gold transition-colors" aria-label="Toggle dark mode">
                {darkMode ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy border-t border-gold/20">
        <div className="flex items-center justify-around py-3 px-2">
          <Link to="/" className="flex flex-col items-center gap-1 text-white/70 hover:text-gold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider">Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center gap-1 text-white/70 hover:text-gold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider">Shop</span>
          </Link>
          <Link to="/cart" className="relative flex flex-col items-center gap-1 text-white/70 hover:text-gold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-navy bg-gold ${cartAnimating ? 'animate-bounce' : ''}`}>
                {cartCount}
              </span>
            )}
            <span className="text-[9px] font-medium uppercase tracking-wider">Cart</span>
          </Link>
          {user ? (
            <button onClick={async () => { await logout(); window.location.href = '/' }} className="flex flex-col items-center gap-1 text-white/70 hover:text-red-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-[9px] font-medium uppercase tracking-wider">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-1 text-white/70 hover:text-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[9px] font-medium uppercase tracking-wider">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <Router>
      <CartProvider>
        <Toaster position="top-right" />
        
        {/* Splash Screen */}
        <AnimatePresence>
          {showSplash && (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          )}
        </AnimatePresence>
        
        {/* Main App */}
        {!showSplash && (
          <div className="min-h-screen bg-white flex flex-col">
            <GlassNav />

            <main className="flex-grow pt-16 pb-20 md:pb-0">
              <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gold border-t-transparent animate-spin"></div></div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/coupons" element={<Coupons />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
        )}
      </CartProvider>
    </Router>
  )
}

export default App
