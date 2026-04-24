'use client';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SellerLayout from '@/components/SellerLayout';
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      alert('Please log in again.');
      router.push('/login');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
      stock: parseInt(formData.stock),
      active: formData.active,
      categoryIds: formData.categoryIds,
      imageUrl: formData.imageUrl || '',
      imageUrls: formData.imageUrls || [],   // ✅ Send additional images
    };

    await api.post(`/products?sellerEmail=${encodeURIComponent(email)}`, payload);
    router.push('/seller/products');
  };

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white border rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <h1 className="text-3xl font-black text-slate-900">Add New Product</h1>
        </div>
        <ProductForm
          isAdmin={false}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="Create Product"
        />
      </div>
    </SellerLayout>
  );
}