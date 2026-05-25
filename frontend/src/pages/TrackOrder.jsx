import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

function TimelineIcon({ status, isLast, isComplete }) {
  const colors = isComplete
    ? 'bg-gold text-white border-gold'
    : 'bg-white text-navy/30 border-navy/20'

  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${colors}`}>
        {isComplete ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>
      {!isLast && <div className={`w-0.5 h-12 ${isComplete ? 'bg-gold' : 'bg-navy/10'}`} />}
    </div>
  )
}

export default function TrackOrder() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTracking()
  }, [id])

  const fetchTracking = async () => {
    try {
      const { data } = await api.get(`/orders/track/${id}`)
      setOrder(data)
    } catch {
      toast.error('Order not found')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getStatusIndex = (status) => {
    const order = ['Pending', 'Shipped', 'Delivered']
    return order.indexOf(status)
  }

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0)
  }

  if (loading) {
    return <div className="text-center mt-20 text-navy/40 tracking-wide">Loading tracking...</div>
  }

  if (!order) {
    return (
      <div className="text-center mt-20">
        <h1 className="font-playfair text-2xl font-semibold text-navy mb-4">Order Not Found</h1>
        <Link to="/my-orders" className="text-gold hover:text-gold-dark font-medium">Back to My Orders</Link>
      </div>
    )
  }

  const timelineSteps = [
    { status: 'Pending', label: 'Order Placed', desc: 'Your order has been placed successfully' },
    { status: 'Shipped', label: 'Shipped', desc: order.courier ? `Handed over to ${order.courier}` : 'Package is on the way' },
    { status: 'Delivered', label: 'Delivered', desc: 'Package delivered successfully' },
  ]

  const currentIdx = getStatusIndex(order.orderStatus)
  const isCancelled = order.orderStatus === 'Cancelled'

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Link to="/my-orders" className="text-navy/50 hover:text-navy text-sm transition flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tracking Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-navy/10 p-6">
            <h1 className="font-playfair text-2xl font-semibold text-navy mb-1">Track Order</h1>
            <p className="text-xs text-navy/40 font-mono mb-6">Order #{order._id?.slice(-8)}</p>

            {isCancelled ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-navy mb-1">Order Cancelled</h2>
                <p className="text-sm text-navy/50">This order has been cancelled</p>
              </div>
            ) : (
              <div className="space-y-1">
                {timelineSteps.map((step, idx) => {
                  const isComplete = idx <= currentIdx
                  const isLast = idx === timelineSteps.length - 1
                  return (
                    <div key={step.status} className="flex gap-4">
                      <TimelineIcon status={step.status} isLast={isLast} isComplete={isComplete} />
                      <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                        <p className={`text-sm font-semibold ${isComplete ? 'text-navy' : 'text-navy/30'}`}>
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${isComplete ? 'text-navy/60' : 'text-navy/20'}`}>
                          {isComplete ? step.desc : 'Pending'}
                        </p>
                        {isComplete && idx < currentIdx && (
                          <p className="text-[10px] text-navy/30 mt-1">{formatDate(order.deliveredAt)}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tracking History */}
            {order.trackingHistory?.length > 0 && !isCancelled && (
              <div className="mt-8 pt-6 border-t border-navy/10">
                <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-4">Tracking History</h3>
                <div className="space-y-3">
                  {order.trackingHistory.map((entry, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium text-navy">{entry.status}</p>
                        {entry.description && <p className="text-navy/60">{entry.description}</p>}
                        {entry.location && <p className="text-navy/40 text-xs">{entry.location}</p>}
                        <p className="text-[10px] text-navy/30 mt-0.5">{formatDate(entry.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-navy/10 p-6">
            <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-4">Order Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-navy/50">Status</span>
                <span className="font-medium text-navy">{order.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">Total</span>
                <span className="font-semibold text-navy">{formatINR(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">Items</span>
                <span className="text-navy">{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">Placed on</span>
                <span className="text-navy">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="bg-white border border-navy/10 p-6">
              <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-4">Tracking Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-navy/50 text-xs">Tracking Number</span>
                  <p className="font-mono text-navy font-medium mt-0.5 break-all">{order.trackingNumber}</p>
                </div>
                {order.courier && (
                  <div>
                    <span className="text-navy/50 text-xs">Courier Partner</span>
                    <p className="text-navy font-medium mt-0.5">{order.courier}</p>
                  </div>
                )}
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gold hover:text-gold-dark text-sm font-medium transition mt-2"
                  >
                    Track on courier website
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="bg-white border border-navy/10 p-6">
            <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-4">Items ({order.items?.length})</h3>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-navy/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-navy/70">{item.name} x{item.quantity}</span>
                  <span className="font-medium text-navy">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <Link to="/my-orders" className="block text-center bg-navy text-white py-3 hover:bg-navy-light transition font-medium text-sm uppercase tracking-widest">
            All Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
