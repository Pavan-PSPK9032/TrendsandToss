import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import SplashScreen from './components/SplashScreen'
import SearchOverlay from './components/SearchOverlay'

import { CartProvider, useCart } from './context/CartContext'
import { useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/AdminProducts'))
const Coupons = lazy(() => import('./pages/Coupons'))
const Footer = lazy(() => import('./components/Footer'))

function GlassNav() {
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [prevCartCount, setPrevCartCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

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

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <>
      <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 glass-nav ${
        scrolled ? 'shadow-lg' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="font-heading text-xl font-semibold tracking-widest"
              style={{ color: 'var(--nav-text)' }}
            >
              Trends<span style={{ color: 'var(--theme-primary)' }}>&amp;</span>Toss
            </Link>

            {/* Center Nav Links */}
            <div className="flex items-center gap-1 text-sm font-medium tracking-wide">
              <Link to="/" className="px-3 py-2 transition-colors uppercase text-xs tracking-widest"
                style={{ color: 'rgba(255,255,255,0.75)' }}
                onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
              >Home</Link>
              <Link to="/products" className="px-3 py-2 transition-colors uppercase text-xs tracking-widest"
                style={{ color: 'rgba(255,255,255,0.75)' }}
                onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
              >Shop</Link>
              {user && (
                <Link to="/my-orders" className="px-3 py-2 transition-colors uppercase text-xs tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
                >Orders</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="px-3 py-2 transition-colors uppercase text-xs tracking-widest"
                  style={{ color: 'var(--theme-primary)' }}
                  onMouseEnter={e => e.target.style.opacity = '0.8'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >Admin</Link>
              )}
            </div>

            {/* Right Side: Search, Theme, Font, Auth, Cart */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                title="Search"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden lg:inline">Search</span>
              </button>


              {user ? (
                <button onClick={handleLogout}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => e.target.style.color = '#f87171'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                >Logout</button>
              ) : (
                <>
                  <Link to="/login"
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
                  >Login</Link>
                  <Link to="/register"
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
                    style={{ background: 'var(--theme-primary)', color: '#fff' }}
                  >Register</Link>
                </>
              )}

              <Link to="/cart" className="relative px-3 py-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
                onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold ${
                    cartAnimating ? 'animate-bounce' : ''
                  }`}
                    style={{ background: 'var(--theme-primary)', color: '#fff' }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-nav px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-heading text-lg font-semibold tracking-widest"
            style={{ color: 'var(--nav-text)' }}
          >
            Trends<span style={{ color: 'var(--theme-primary)' }}>&amp;</span>Toss
          </Link>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ color: 'var(--theme-primary)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            )}
            <button onClick={() => setSearchOpen(true)} style={{ color: 'rgba(255,255,255,0.7)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link to="/cart" className="relative" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold"
                  style={{ background: 'var(--theme-primary)', color: '#fff' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-around py-2 px-2">
          <Link to="/" className="flex flex-col items-center gap-0.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider">Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center gap-0.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider">Shop</span>
          </Link>
          <button onClick={() => setSearchOpen(true)} className="flex flex-col items-center gap-0.5 transition-colors"
            style={{ color: 'var(--theme-primary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider">Search</span>
          </button>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex flex-col items-center gap-0.5 transition-colors"
              style={{ color: 'var(--theme-primary)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[9px] font-medium uppercase tracking-wider">Admin</span>
            </Link>
          )}
          {user && (
            <Link to="/my-orders" className="flex flex-col items-center gap-0.5 transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-[9px] font-medium uppercase tracking-wider">Orders</span>
            </Link>
          )}
          <Link to="/cart" className="relative flex flex-col items-center gap-0.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 right-0 flex items-center justify-center min-w-[14px] h-3.5 px-1 text-[8px] font-bold"
                style={{ background: 'var(--theme-primary)', color: '#fff' }}
              >
                {cartCount}
              </span>
            )}
            <span className="text-[9px] font-medium uppercase tracking-wider">Cart</span>
          </Link>
        </div>
      </nav>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <Toaster position="top-right"
          toastOptions={{
            style: {
              borderRadius: 0,
              fontFamily: 'var(--font-body)',
            }
          }}
        />
        
        <AnimatePresence>
          {showSplash && (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          )}
        </AnimatePresence>
        
        {!showSplash && (
          <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            <GlassNav />

            <main className="flex-grow pt-14 pb-16 md:pb-0">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="spinner"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/track-order/:id" element={<TrackOrder />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
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
