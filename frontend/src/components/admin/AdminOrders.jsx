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
      'Pending': 'bg-gold/10 text-gold border border-gold/30',
      'Shipped': 'bg-navy/10 text-navy border border-navy/30',
      'Delivered': 'bg-gold/10 text-gold border border-gold/30',
      'Cancelled': 'bg-red-50 text-red-600 border border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (method, status) => {
    if (method === 'cod') return status === 'paid' ? 'Paid (COD)' : 'Pending (COD)';
    return status === 'paid' ? 'Paid' : 'Failed';
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) return <div className="text-center py-10 text-navy/40 tracking-wide">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-playfair text-2xl font-semibold text-navy">Orders Management</h2>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 text-sm font-medium transition ${filter === status ? 'bg-gold text-white' : 'bg-white text-navy/70 border border-navy/10 hover:border-gold hover:text-gold'}`}>
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-navy/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy/5">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Order ID</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Customer</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Total</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Payment</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Status</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Date</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <React.Fragment key={order._id}>
                  <tr className="border-t border-navy/5 hover:bg-navy/[0.02] cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                    <td className="p-4 font-mono text-sm text-navy">{order._id?.slice(-8)}</td>
                    <td className="p-4">
                      <div className="font-medium text-navy">{order.userId?.name || 'Guest'}</div>
                      <div className="text-xs text-navy/40">{order.userId?.email}</div>
                    </td>
                    <td className="p-4 font-semibold text-navy">{formatINR(order.totalPrice)}</td>
                    <td className="p-4"><span className="text-sm text-navy/60">{getPaymentBadge(order.paymentMethod, order.paymentStatus)}</span></td>
                    <td className="p-4"><span className={`px-3 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span></td>
                    <td className="p-4 text-sm text-navy/50">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><button className="text-gold hover:text-gold-dark text-sm font-medium">{expandedOrder === order._id ? 'Hide' : 'View'}</button></td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr>
                      <td colSpan="7" className="p-6 bg-navy/[0.02] border-t border-navy/5">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          
                          {/* Shipping Address */}
                          <div>
                            <h4 className="font-semibold mb-3 text-navy text-xs uppercase tracking-widest">Shipping Address</h4>
                            <div className="bg-white p-4 border border-navy/10">
                              <p className="text-sm text-navy/80 font-medium">{order.shippingAddress?.fullName}</p>
                              <p className="text-sm text-navy/60">{order.shippingAddress?.address}</p>
                              <p className="text-sm text-navy/60">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                              <p className="text-sm text-navy/60">{order.shippingAddress?.country}</p>
                              <p className="text-sm text-navy/60 mt-2">{order.shippingAddress?.phone}</p>
                              {order.deliveryPincode && (
                                <p className="text-xs text-navy/40 mt-2 pt-2 border-t border-navy/10">
                                  Delivery Pincode: <span className="font-mono">{order.deliveryPincode}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Items List */}
                          <div>
                            <h4 className="font-semibold mb-3 text-navy text-xs uppercase tracking-widest">Items ({order.items?.length})</h4>
                            <div className="bg-white p-4 border border-navy/10 max-h-48 overflow-y-auto">
                              <div className="space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm border-b border-navy/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-navy/70">{item.name} x {item.quantity}</span>
                                    <span className="font-medium text-navy">{formatINR(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Pricing Breakdown */}
                          <div>
                            <h4 className="font-semibold mb-3 text-navy text-xs uppercase tracking-widest">Pricing Details</h4>
                            <div className="bg-white p-4 border border-navy/10 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-navy/60">Subtotal</span>
                                <span className="font-medium text-navy">{formatINR(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-navy/60">Shipping ({order.shippingZone || 'Standard'})</span>
                                <span className={`font-medium ${order.shippingCharge === 0 ? 'text-gold' : 'text-navy'}`}>
                                  {order.shippingCharge === 0 ? 'Free' : formatINR(order.shippingCharge)}
                                </span>
                              </div>
                              <div className="border-t border-navy/10 pt-3 flex justify-between">
                                <span className="font-semibold text-navy">Total</span>
                                <span className="font-bold text-lg text-gold">{formatINR(order.totalPrice)}</span>
                              </div>
                              
                              {order.shippingZone && (
                                <div className="pt-2">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy/5 text-navy/60 text-xs font-medium">
                                    {order.shippingZone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Update Status */}
                        <div className="mt-6 pt-4 border-t border-navy/10">
                          <h4 className="font-semibold mb-3 text-navy text-xs uppercase tracking-widest">Update Order Status</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                              <button
                                key={status}
                                onClick={() => updateStatus(order._id, status)}
                                disabled={order.orderStatus === status}
                                className={`px-4 py-2 text-sm font-medium transition ${
                                  order.orderStatus === status
                                    ? 'bg-navy/10 text-navy/40 cursor-not-allowed'
                                    : 'bg-gold text-white hover:bg-gold-dark'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Order Meta */}
                        <div className="mt-4 pt-4 border-t border-navy/10 flex flex-wrap gap-4 text-xs text-navy/40">
                          <span>Order: <span className="font-mono text-navy/60">{order._id}</span></span>
                          <span>Placed: <span className="text-navy/60">{new Date(order.createdAt).toLocaleString('en-IN')}</span></span>
                          <span>Method: <span className="text-navy/60 uppercase">{order.paymentMethod}</span></span>
                          <span>Payment: <span className={order.paymentStatus === 'paid' ? 'text-gold' : 'text-red-500'}>{order.paymentStatus}</span></span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <div className="text-center py-12 text-navy/40">No orders found {filter !== 'all' && `with status "${filter}"`}</div>}
        </div>
      </div>
    </div>
  );
}
