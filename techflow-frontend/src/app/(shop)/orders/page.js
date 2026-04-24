'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);

    api.get(`/orders/my?email=${email}`)
      .then(res => {
        console.log('Orders response:', res.data);
        setOrders(res.data);
      })
      .catch(err => {
        console.error('Orders fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
      case 'PAID': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      case 'PROCESSING': return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20';
      case 'SHIPPED': return 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
      case 'CANCELLED': return 'bg-red-50 text-red-700 ring-1 ring-red-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '⏳';
      case 'PAID': return '✅';
      case 'PROCESSING': return '⚙️';
      case 'SHIPPED': return '🚚';
      case 'DELIVERED': return '📦';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  };

  const cancelOrder = async (orderId) => {
    const email = localStorage.getItem('userEmail');
    try {
      await api.put(`/orders/${orderId}/cancel?email=${email}`);
      const res = await api.get(`/orders/my?email=${email}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Cannot cancel this order: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Loading your orders...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load orders</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="pt-8 pb-20 max-w-5xl mx-auto px-4 lg:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">Order History</h1>
          <p className="text-slate-500 mt-2 text-lg">Track, manage, and review your purchases.</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No orders yet</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Looks like you haven't made your first purchase yet. Explore our store to find the best components.</p>
            <Link href="/products" className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                
                {/* Order Header */}
                <div className="bg-slate-50/80 border-b border-slate-200 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Number</p>
                      <p className="font-black text-slate-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Placed</p>
                      <p className="font-semibold text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="font-black text-slate-900">{order.totalTTC} <span className="text-xs font-bold text-slate-500">TND</span></p>
                    </div>
                    <div className="md:justify-self-end">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                        <span className="text-sm leading-none">{getStatusIcon(order.status)}</span>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.items?.map((item, index) => {
                    // Extracting product name securely whether the API sends item.productName or item.product.name
                    const productName = item.productName || item.product?.name || `Product #${item.productId || item.product?.id || index + 1}`;
                    const productImg = item.imageUrl || item.product?.imageUrl;

                    return (
                      <div key={item.id || index} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {productImg ? (
                              <img src={productImg} alt={productName} className="w-full h-full object-contain" />
                            ) : (
                              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm md:text-base line-clamp-1">{productName}</p>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">Quantity: <span className="text-slate-700 font-bold">{item.quantity}</span></p>
                          </div>
                        </div>
                        <p className="font-bold text-slate-900 whitespace-nowrap">{item.unitPrice || item.price} <span className="text-[10px] text-slate-500 uppercase">TND</span></p>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer */}
                <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Delivery to: <span className="text-slate-900 font-bold">
                      {order.deliveryAddress?.city ? `${order.deliveryAddress.city}, ${order.deliveryAddress.country}` : 'Address Pending'}
                    </span>
                  </div>
                  
                  {(order.status === 'PENDING' || order.status === 'PAID') && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="w-full sm:w-auto text-sm text-red-600 font-bold bg-white border border-red-200 hover:border-red-400 hover:bg-red-50 px-5 py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      Cancel Order
                    </button>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}