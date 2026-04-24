'use client';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import CategoryForm from '@/components/CategoryForm';

export default function NewCategoryPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    // formData.parent is already { id: number } or null
    await api.post('/categories', formData);
    router.push('/admin/categories');
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add Category</h1>
            <p className="text-slate-500 font-medium mt-1">Create a new product category.</p>
          </div>
        </div>

        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="Create Category"
        />
      </div>
    </AdminLayout>
  );
}