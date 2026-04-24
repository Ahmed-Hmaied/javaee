'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import SellerLayout from '@/components/SellerLayout';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
    api.get(`/orders/my-selling?email=${email}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${status}`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

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

  return (
    <SellerLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage and fulfill orders containing your products.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span className="text-sm font-bold text-slate-700">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-white border border-slate-200 animate-pulse rounded-2xl shadow-sm"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">When customers purchase your products, their orders will appear here for fulfillment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
                
                {/* Order Header */}
                <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg tracking-tight">{order.orderNumber}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    
                    {/* Modern Custom Select */}
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 cursor-pointer shadow-sm transition-all"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 flex-1">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Purchased Items</h3>
                  <div className="space-y-3">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-3 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">{item.productName}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">Quantity: <span className="font-bold text-slate-700">{item.quantity}</span></p>
                          </div>
                        </div>
                        <div className="sm:text-right ml-13 sm:ml-0">
                          <span className="font-black text-slate-900">{item.unitPrice} <span className="text-[10px] text-slate-500 uppercase">TND</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer / Total */}
                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Order Total</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-emerald-600 tracking-tight">
                      {order.totalTTC} <span className="text-xs text-emerald-500 uppercase tracking-wider ml-0.5">TND</span>
                    </span>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}