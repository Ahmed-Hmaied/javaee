'use client';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import CouponForm from '@/components/CouponForm';

export default function NewCouponPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    await api.post('/coupons', formData);
    router.push('/admin/coupons');
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <h1 className="text-3xl font-black text-slate-900">Add Coupon</h1>
        </div>
        <CouponForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Create Coupon" />
      </div>
    </AdminLayout>
  );
}