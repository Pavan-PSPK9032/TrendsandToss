import { useLocation, Link } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.order

  if (!order) {
    return (
      <div className="text-center mt-20">
        <h1 className="font-heading text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>Order Not Found</h1>
        <Link to="/" style={{ color: 'var(--theme-primary)' }} className="font-medium">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
      <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
        style={{ background: 'var(--bg-secondary)', color: 'var(--theme-primary)' }}
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="font-heading text-3xl font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>Order Confirmed</h1>
      <p className="text-sm tracking-wide mb-8" style={{ color: 'var(--theme-text)', opacity: 0.5 }}>Thank you for your purchase</p>
      
      <div className="p-6 text-left mb-6 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--theme-text)' }}>Order Details</h2>
        <div className="space-y-3 text-sm" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-mono" style={{ color: 'var(--theme-text)' }}>{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>₹{order.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Order Status:</span>
            <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{order.orderStatus}</span>
          </div>
        </div>
      </div>

      <div className="p-4 mb-6 text-left border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <h3 className="font-semibold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--theme-text)' }}>Shipping To:</h3>
        <p className="text-sm" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>
          {order.shippingAddress?.fullName}<br/>
          {order.shippingAddress?.address}<br/>
          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}<br/>
          {order.shippingAddress?.country}
        </p>
      </div>

      {order.orderStatus === 'Shipped' && order.trackingNumber && (
        <div className="mb-6">
          <Link to={`/track-order/${order._id}`}
            className="inline-flex items-center gap-2 px-6 py-3 transition font-medium text-sm"
            style={{
              color: 'var(--theme-primary)',
              border: '1px solid var(--theme-primary)',
              background: 'var(--bg-secondary)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Track Order
          </Link>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link to="/"
          className="px-6 py-3 font-medium text-sm uppercase tracking-widest transition text-white"
          style={{ background: 'var(--theme-text)' }}
        >
          Continue Shopping
        </Link>
        <Link to="/my-orders"
          className="px-6 py-3 font-medium text-sm transition border"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--theme-text)'
          }}
        >
          View Orders
        </Link>
      </div>
    </div>
  )
}
