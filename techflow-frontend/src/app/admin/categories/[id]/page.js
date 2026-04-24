'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import CategoryForm from '@/components/CategoryForm';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [params.id]);

  const fetchCategory = async () => {
    try {
      const res = await api.get(`/categories/${params.id}`);
      const data = res.data;
      // Convert parentId to parent object expected by form
      setCategory({
        ...data,
        parent: data.parentId ? { id: data.parentId } : null
      });
    } catch (err) {
      console.error('Failed to fetch category', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    await api.put(`/categories/${params.id}`, formData);
    router.push('/admin/categories');
  };

  if (loading) {
    return <AdminLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div></AdminLayout>;
  }

  if (error) {
    return <AdminLayout><div className="text-center py-12 text-slate-500">Category not found</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/admin/categories')} className="p-2 bg-white border border-slate-200 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <h1 className="text-3xl font-black text-slate-900">Edit Category</h1>
        </div>
        <CategoryForm
          initialData={category}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/categories')}
          submitLabel="Save Changes"
        />
      </div>
    </AdminLayout>
  );
}