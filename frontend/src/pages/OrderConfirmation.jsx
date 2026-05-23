import { useLocation, Link } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.order

  if (!order) {
    return (
      <div className="text-center mt-20">
        <h1 className="font-playfair text-2xl font-semibold text-navy mb-4">Order Not Found</h1>
        <Link to="/" className="text-gold hover:text-gold-dark font-medium">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
      <div className="bg-gold/10 text-gold w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="font-playfair text-3xl font-semibold text-navy mb-2">Order Confirmed</h1>
      <p className="text-navy/50 text-sm tracking-wide mb-8">Thank you for your purchase</p>
      
      <div className="bg-white border border-navy/10 p-6 text-left mb-6">
        <h2 className="font-semibold text-navy text-sm uppercase tracking-widest mb-4">Order Details</h2>
        <div className="space-y-3 text-sm text-navy/60">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-mono text-navy">{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold text-navy">Rs.{order.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="text-gold font-semibold">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Order Status:</span>
            <span className="text-navy font-semibold">{order.orderStatus}</span>
          </div>
        </div>
      </div>

      <div className="bg-navy/5 border border-navy/10 p-4 mb-6 text-left">
        <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-2">Shipping To:</h3>
        <p className="text-sm text-navy/60">
          {order.shippingAddress?.fullName}<br/>
          {order.shippingAddress?.address}<br/>
          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}<br/>
          {order.shippingAddress?.country}
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Link 
          to="/" 
          className="bg-navy text-white px-6 py-3 hover:bg-navy-light transition font-medium text-sm uppercase tracking-widest"
        >
          Continue Shopping
        </Link>
        <Link 
          to="/cart" 
          className="border border-navy/20 text-navy px-6 py-3 hover:border-gold hover:text-gold transition font-medium text-sm"
        >
          View Orders
        </Link>
      </div>
    </div>
  )
}
