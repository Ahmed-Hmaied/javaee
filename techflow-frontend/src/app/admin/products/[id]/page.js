'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import ProductForm from '@/components/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      const productData = res.data;

      // ✅ Use the new categoryIds field directly (backend now returns it)
      const categoryIds = productData.categoryIds || [];

      // Extract seller email (adjust if your backend structure differs)
      const sellerEmail = productData.sellerEmail || productData.seller?.email || '';

      // Merge the data and ensure imageUrls is an array
      setProduct({
        ...productData,
        categoryIds,
        sellerEmail,
        imageUrls: productData.imageUrls || [],   // ✅ ensure array
      });
    } catch (err) {
      console.error('Failed to fetch product', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
      stock: parseInt(formData.stock),
      active: formData.active,
      categoryIds: formData.categoryIds,
      imageUrl: formData.imageUrl || '',
      imageUrls: formData.imageUrls || [],   // ✅ SEND ADDITIONAL IMAGES
    };

    const sellerEmail = formData.sellerEmail;
    let url = `/products/${params.id}`;
    if (sellerEmail) {
      url += `?sellerEmail=${encodeURIComponent(sellerEmail)}`;
    }

    await api.put(url, payload);
    router.push('/admin/products');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading product details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (fetchError) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-500 mb-8">The product you are trying to edit does not exist or has been deleted.</p>
          <button onClick={() => router.push('/admin/products')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
            Return to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/admin/products')} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Product</h1>
            <p className="text-slate-500 font-medium mt-1">Make changes to <span className="text-slate-700 font-bold">{product?.name}</span>.</p>
          </div>
        </div>

        <ProductForm
          isAdmin={true}
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/products')}
          submitLabel="Save Changes"
        />
      </div>
    </AdminLayout>
  );
}