'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import SellerLayout from '@/components/SellerLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('monthly');
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
    
    // 获取仪表盘统计数据（后端已正确计算仅已交付订单的收入）
    api.get(`/dashboard/seller?email=${email}`)
      .then(res => {
        console.log('Seller stats:', res.data); // 调试日志
        setStats(res.data);
      })
      .catch(console.error);
      
    // 获取所有订单用于图表
    api.get(`/orders/my-selling?email=${email}`)
      .then(res => {
        const orders = res.data;
        setAllOrders(orders);
        // 仅保留已交付订单用于图表
        const deliveredOrders = orders.filter(order => order.status === 'DELIVERED');
        const aggregated = aggregateOrders(deliveredOrders, 'monthly');
        setChartData(aggregated);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 根据时间范围聚合订单
  const aggregateOrders = (orders, range) => {
    const grouped = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key, displayName;
      
      if (range === 'daily') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        displayName = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      } else if (range === 'yearly') {
        key = `${date.getFullYear()}`;
        displayName = `${date.getFullYear()}`;
      } else { // monthly (default)
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        displayName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      }
      
      if (!grouped[key]) {
        grouped[key] = { name: displayName, revenue: 0, orderCount: 0 };
      }
      grouped[key].revenue += order.totalTTC;
      grouped[key].orderCount += 1;
    });
    
    // 转换为数组并按时间排序
    return Object.values(grouped).sort((a, b) => {
      if (range === 'yearly') {
        return parseInt(a.name) - parseInt(b.name);
      }
      const aDate = new Date(a.name);
      const bDate = new Date(b.name);
      return aDate - bDate;
    });
  };

  // 处理时间范围切换
  const handleRangeChange = (range) => {
    setTimeRange(range);
    const deliveredOrders = allOrders.filter(order => order.status === 'DELIVERED');
    const aggregated = aggregateOrders(deliveredOrders, range);
    setChartData(aggregated);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
      PAID: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
      PROCESSING: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
      SHIPPED: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
      DELIVERED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
      CANCELLED: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    };
    return colors[status?.toUpperCase()] || 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20';
  };

  const StatCard = ({ title, value, icon, colorTheme }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${colorTheme.bg} ${colorTheme.text} flex items-center justify-center border ${colorTheme.border} shadow-sm transition-transform group-hover:scale-105`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <SellerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1 text-lg">
              Welcome back, <span className="font-bold text-slate-700">{userEmail?.split('@')[0]}</span>
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-600">Store Active</span>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex justify-between">
                <div className="space-y-3 w-1/2">
                  <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="w-14 h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Revenue" 
              value={`${stats?.revenue?.toFixed(3) || '0.000'} TND`} 
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
              colorTheme={{ bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' }} 
            />
            <StatCard 
              title="Pending Orders" 
              value={stats?.pendingOrders || 0} 
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>}
              colorTheme={{ bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }} 
            />
            <StatCard 
              title="Low Stock Alerts" 
              value={stats?.lowStockAlerts || 0} 
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
              colorTheme={{ bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }} 
            />
            <StatCard 
              title="Total Products" 
              value={stats?.totalProducts || 0} 
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>}
              colorTheme={{ bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' }} 
            />
          </div>
        )}

        {/* Revenue Trend Chart with Range Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Revenue Trend (Delivered Orders Only)</h2>
              <p className="text-sm text-slate-500">Revenue from your successfully delivered products</p>
            </div>
            {/* Time Range Selector */}
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {['daily', 'monthly', 'yearly'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    timeRange === range 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 h-80">
            {loading ? (
              <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl"></div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No delivered orders yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(3)} TND`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-900">Recent Orders</h2>
          </div>
          
          <div className="p-2">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : stats?.recentOrders?.length ? (
              <div className="flex flex-col">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors gap-4 sm:gap-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs font-medium text-slate-500">Customer Order</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="font-black text-slate-900 whitespace-nowrap">
                        {order.totalTTC} <span className="text-[10px] text-slate-500 uppercase">TND</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No recent orders</h3>
                <p className="text-slate-500 font-medium">When customers place orders, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}