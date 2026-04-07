import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.orderStatus === filter);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Shipped': 'bg-blue-100 text-blue-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (method, status) => {
    if (method === 'cod') return status === 'paid' ? '🟢 Paid (COD)' : '🟡 Pending (COD)';
    return status === 'paid' ? '🟢 Paid' : '🔴 Failed';
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-500 hover:text-amber-600'}`}>
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <React.Fragment key={order._id}>
                  <tr className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                    <td className="p-4 font-mono text-sm">{order._id?.slice(-8)}</td>
                    <td className="p-4">
                      <div className="font-medium">{order.userId?.name || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{order.userId?.email}</div>
                    </td>
                    <td className="p-4 font-semibold">{formatINR(order.totalPrice)}</td>
                    <td className="p-4"><span className="text-sm">{getPaymentBadge(order.paymentMethod, order.paymentStatus)}</span></td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span></td>
                    <td className="p-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><button className="text-amber-600 hover:text-amber-800 text-sm">{expandedOrder === order._id ? 'Hide' : 'View'}</button></td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr>
                      <td colSpan="7" className="p-4 bg-slate-50">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          
                          {/* Shipping Address */}
                          <div>
                            <h4 className="font-semibold mb-3 text-slate-900">📦 Shipping Address</h4>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                              <p className="text-sm text-slate-700 font-medium">{order.shippingAddress?.fullName}</p>
                              <p className="text-sm text-slate-600">{order.shippingAddress?.address}</p>
                              <p className="text-sm text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                              <p className="text-sm text-slate-600">{order.shippingAddress?.country}</p>
                              <p className="text-sm text-slate-600 mt-2">📞 {order.shippingAddress?.phone}</p>
                              {order.deliveryPincode && (
                                <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                  📍 Delivery Pincode: <span className="font-mono">{order.deliveryPincode}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Items List */}
                          <div>
                            <h4 className="font-semibold mb-3 text-slate-900">🛍️ Items ({order.items?.length})</h4>
                            <div className="bg-white rounded-xl p-4 border border-slate-200 max-h-48 overflow-y-auto">
                              <div className="space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                    <span className="text-slate-700">{item.name} × {item.quantity}</span>
                                    <span className="font-medium text-slate-900">{formatINR(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Pricing Breakdown */}
                          <div>
                            <h4 className="font-semibold mb-3 text-slate-900">💰 Pricing Details</h4>
                            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-medium text-slate-900">{formatINR(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Shipping ({order.shippingZone || 'Standard'})</span>
                                <span className={`font-medium ${order.shippingCharge === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                  {order.shippingCharge === 0 ? 'Free' : formatINR(order.shippingCharge)}
                                </span>
                              </div>
                              <div className="border-t border-slate-200 pt-3 flex justify-between">
                                <span className="font-semibold text-slate-900">Total</span>
                                <span className="font-bold text-lg text-amber-600">{formatINR(order.totalPrice)}</span>
                              </div>
                              
                              {/* Shipping Zone Badge */}
                              {order.shippingZone && (
                                <div className="pt-2">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                    🚚 {order.shippingZone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Update Status */}
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <h4 className="font-semibold mb-3 text-slate-900">🔄 Update Order Status</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                              <button
                                key={status}
                                onClick={() => updateStatus(order._id, status)}
                                disabled={order.orderStatus === status}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                  order.orderStatus === status
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Order Meta */}
                        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>🆔 Order: <span className="font-mono text-slate-700">{order._id}</span></span>
                          <span>📅 Placed: <span className="text-slate-700">{new Date(order.createdAt).toLocaleString('en-IN')}</span></span>
                          <span>💳 Method: <span className="text-slate-700 uppercase">{order.paymentMethod}</span></span>
                          <span>🔖 Payment: <span className={order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{order.paymentStatus}</span></span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <div className="text-center py-12 text-slate-500">No orders found {filter !== 'all' && `with status "${filter}"`}</div>}
        </div>
      </div>
    </div>
  );
}