'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.content || res.data);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      showToast('Coupon deleted', 'success');
      fetchCoupons();
    } catch (err) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await api.put(`/coupons/${id}/toggle`);
      showToast(`Coupon ${!currentActive ? 'activated' : 'deactivated'}`, 'success');
      fetchCoupons();
    } catch (err) {
      showToast('Failed to update coupon', 'error');
    }
  };

  const isExpired = (expirationDate) => {
    return new Date(expirationDate) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl border flex items-center gap-3 ${
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {toast.type === 'error' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
            <span className="font-bold">{toast.message}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coupons</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage discount codes.</p>
          </div>
          <Link
            href="/admin/coupons/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add Coupon
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Code</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Discount</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Usage</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Expires</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-20 animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">No coupons found</td>
                </tr>
              ) : (
                coupons.map(coupon => {
                  const expired = isExpired(coupon.expirationDate);
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-900">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {coupon.type === 'PERCENT' ? `${coupon.value}%` : `${coupon.value} TND`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {coupon.usedCount || 0} / {coupon.maxUses || '∞'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={expired ? 'text-red-500' : 'text-slate-500'}>
                          {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString() : 'No expiration'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            coupon.active && !expired
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {coupon.active && !expired ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => router.push(`/admin/coupons/${coupon.id}`)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-500 hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}