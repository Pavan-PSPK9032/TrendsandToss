import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my')
      setOrders(data)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'text-gold',
      'Shipped': 'text-navy',
      'Delivered': 'text-green-600',
      'Cancelled': 'text-red-500'
    }
    return colors[status] || 'text-navy/60'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0)
  }

  if (loading) {
    return <div className="text-center mt-20 text-navy/40 tracking-wide">Loading orders...</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="font-playfair text-3xl font-semibold text-navy mb-2 tracking-tight">My Orders</h1>
      <p className="text-navy/50 text-sm mb-8">Track and manage your orders</p>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-navy/10 bg-navy/[0.02]">
          <svg className="w-16 h-16 mx-auto mb-4 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-lg font-medium text-navy/60 mb-2">No orders yet</h2>
          <p className="text-sm text-navy/40 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="inline-block bg-navy text-white px-8 py-3 hover:bg-navy-light transition font-medium text-sm uppercase tracking-widest">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-navy/10 hover:border-navy/20 transition">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <div>
                    <span className="font-mono text-xs text-navy/40">Order #{order._id?.slice(-8)}</span>
                    <span className="text-navy/30 mx-2">|</span>
                    <span className="text-xs text-navy/40">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-navy/70">{item.name} x{item.quantity}</span>
                      <span className="text-navy font-medium">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs text-navy/40">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-navy/10">
                  <div>
                    <span className="text-xs text-navy/40 uppercase tracking-wider">Total</span>
                    <span className="ml-3 font-semibold text-navy">{formatINR(order.totalPrice)}</span>
                  </div>
                  <div className="flex gap-3">
                    {order.trackingNumber && (
                      <Link to={`/track-order/${order._id}`} className="text-gold hover:text-gold-dark text-sm font-medium transition">
                        Track Order
                      </Link>
                    )}
                    <Link to={`/track-order/${order._id}`} className="text-navy/60 hover:text-navy text-sm font-medium transition">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
