'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import SellerLayout from '@/components/SellerLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.content || res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6 relative">
        
        {/* Custom Toast Notification */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-xl border flex items-center gap-3 transition-all animate-fade-in-down ${
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {toast.type === 'error' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Products</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your store catalog and inventory.</p>
          </div>
          <Link 
            href="/seller/products/new" 
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add Product
          </Link>
        </div>

        {/* Upgraded Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  /* Loading Skeleton Rows */
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div></td>
                      <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded-full w-16 animate-pulse"></div></td>
                      <td className="px-6 py-5"><div className="flex justify-end gap-2"><div className="w-8 h-8 bg-slate-200 rounded-md animate-pulse"></div><div className="w-8 h-8 bg-slate-200 rounded-md animate-pulse"></div></div></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
                      <p className="text-slate-500 font-medium mb-4">You haven't added any products to your store yet.</p>
                      <Link href="/seller/products/new" className="text-emerald-600 font-bold hover:underline">
                        Create your first product
                      </Link>
                    </td>
                  </tr>
                ) : (
                  /* Data Rows */
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                          </div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900">{p.price} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TND</span></span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${p.stock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {p.stock <= 0 && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                          {p.stock} in stock
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => router.push(`/seller/products/${p.id}`)} 
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}