'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/admin');
      const data = res.data;
      setStats(data);
      // The backend now returns recentOrders inside the same response
      setRecentOrders(data.recentOrders || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Could not load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, colorTheme }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorTheme.gradient} opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${colorTheme.bg} ${colorTheme.text} flex items-center justify-center border ${colorTheme.border} shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
      PAID: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
      PROCESSING: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
      SHIPPED: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
      DELIVERED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
      CANCELLED: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20';
  };

  // Modern Skeleton Loader
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8 animate-pulse">
          <div>
            <div className="h-8 bg-slate-200 rounded w-48 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex justify-between">
                <div className="space-y-3 w-1/2">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                </div>
                <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Improved Alert / Error Message Design
  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">System Overview</p>
          </div>
          <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm mt-10">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Data Retrieval Failed</h2>
            <p className="text-slate-500 mb-8">{error}</p>
            <button
              onClick={fetchData}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-lg">Welcome back! Here's what's happening in your store.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`${stats?.totalRevenue?.toFixed(3) || '0.000'} TND`}
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            colorTheme={{ bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', gradient: 'from-emerald-400 to-teal-600' }}
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>}
            colorTheme={{ bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', gradient: 'from-blue-400 to-indigo-600' }}
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>}
            colorTheme={{ bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', gradient: 'from-purple-400 to-fuchsia-600' }}
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>}
            colorTheme={{ bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', gradient: 'from-orange-400 to-red-600' }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-lg font-black text-slate-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                View all <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="p-2">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>
                  <p className="text-slate-500 font-medium">No recent orders found.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{order.orderNumber}</p>
                          <p className="text-xs font-medium text-slate-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="font-bold text-slate-900 hidden sm:block">{order.totalTTC} <span className="text-[10px] text-slate-500 uppercase">TND</span></p>
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (Replaces standard links with card buttons) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
            <h2 className="text-lg font-black text-slate-900 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/products" className="group flex items-center gap-4 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">Add Product</span>
              </Link>
              
              <Link href="/admin/categories" className="group flex items-center gap-4 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">Categories</span>
              </Link>
              
              <Link href="/admin/coupons" className="group flex items-center gap-4 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">Coupons</span>
              </Link>

              <Link href="/admin/users" className="group flex items-center gap-4 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">Manage Users</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}