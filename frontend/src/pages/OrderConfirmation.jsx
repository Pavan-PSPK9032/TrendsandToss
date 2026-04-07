import { useLocation, Link } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.order

  if (!order) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 text-center">
      <div className="bg-green-100 text-green-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl">
        ✓
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Order Confirmed! 🎉</h1>
      <p className="text-gray-600 mb-6">Thank you for your purchase</p>
      
      <div className="bg-white rounded-lg shadow p-6 text-left mb-6">
        <h2 className="font-bold mb-4">Order Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-mono">{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold">${order.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="text-green-600 font-semibold">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Order Status:</span>
            <span className="text-blue-600 font-semibold">{order.orderStatus}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold mb-2">Shipping To:</h3>
        <p className="text-sm text-gray-600">
          {order.shippingAddress?.fullName}<br/>
          {order.shippingAddress?.address}<br/>
          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}<br/>
          {order.shippingAddress?.country}
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
        <Link 
          to="/cart" 
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          View Orders
        </Link>
      </div>
    </div>
  )
}