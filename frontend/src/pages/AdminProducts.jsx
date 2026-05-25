import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProductsManagement from '../components/admin/ProductsManagement'

export default function AdminProducts() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
    } else {
      setChecking(false)
    }
  }, [user, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
      navigate('/')
    }
  }

  if (checking) return <div className="text-center py-20 text-navy/40 tracking-wide">Verifying access...</div>

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link to="/" className="text-xs text-navy/40 hover:text-gold uppercase tracking-widest font-medium transition">&larr; Back to Store</Link>
          <h1 className="font-playfair text-3xl font-semibold text-navy mt-1">Product Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-xs font-semibold uppercase tracking-widest text-navy/50 hover:text-gold transition px-4 py-2 border border-navy/20 hover:border-gold"
          >
            Admin Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition flex items-center gap-2 text-xs uppercase tracking-widest font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      <ProductsManagement />
    </div>
  )
}
