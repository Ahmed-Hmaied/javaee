'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import CouponForm from '@/components/CouponForm';

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoupon();
  }, [params.id]);

  const fetchCoupon = async () => {
    try {
      const res = await api.get(`/coupons/${params.id}`);
      setCoupon(res.data);
    } catch (err) {
      console.error('Failed to fetch coupon', err);
      setError('Coupon not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    await api.put(`/coupons/${params.id}`, formData);
    router.push('/admin/coupons');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl border border-red-100 p-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Coupon Not Found</h2>
          <p className="text-slate-500 mb-6">The coupon you're trying to edit doesn't exist.</p>
          <button onClick={() => router.push('/admin/coupons')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">
            Back to Coupons
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/admin/coupons')} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Coupon</h1>
            <p className="text-slate-500 font-medium mt-1">Update coupon details.</p>
          </div>
        </div>
        <CouponForm
          initialData={coupon}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/coupons')}
          submitLabel="Save Changes"
        />
      </div>
    </AdminLayout>
  );
}