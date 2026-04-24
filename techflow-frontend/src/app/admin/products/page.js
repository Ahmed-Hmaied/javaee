'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);
  const debounceRef = useRef(null);

  // Debounce: update debouncedSearch 300ms after user stops typing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${page}&size=10&search=${debouncedSearch}`);
      setProducts(res.data.content || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch products', err);
      showToast('Failed to load products list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  // Client-side filter: instant feedback while debounce/API is in flight
  const filteredProducts = search.trim()
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id)?.includes(search)
      )
    : products;

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await api.put(`/products/${id}`, { active: !currentActive });
      fetchProducts();
      showToast(`Product is now ${!currentActive ? 'Active' : 'Inactive'}`, 'success');
    } catch (err) {
      showToast('Failed to update product status', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-[100] px-5 py-4 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 flex items-center gap-3 transition-all animate-fade-in-down">
            <div className={`p-2 rounded-xl ${toast.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
              {toast.type === 'error' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              )}
            </div>
            <div className="pr-2">
              <p className={`text-sm font-black ${toast.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
                {toast.type === 'error' ? 'Error' : 'Success'}
              </p>
              <p className="text-sm font-medium text-slate-600">{toast.message}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your store's inventory and catalog.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add Product
          </Link>
        </div>

        {/* Search bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center max-w-md">
          <div className="pl-4 pr-2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search products by name or ID..."
            className="w-full bg-transparent border-none py-2 px-2 text-slate-900 font-medium focus:outline-none focus:ring-0 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="mr-2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Results count hint */}
        {search.trim() && !loading && (
          <p className="text-sm text-slate-500 font-medium -mt-2">
            {filteredProducts.length === 0
              ? 'No products match your search.'
              : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found for "${search}"`
            }
          </p>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-12 animate-pulse"></div></td>
                      <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse"></div></td>
                      <td className="px-6 py-5"><div className="flex justify-end gap-2"><div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div></div></td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      </div>
                      <p className="text-slate-500 font-medium">No products found matching your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                          </div>
                          {/* Highlight matched text */}
                          <span className="font-bold text-slate-900 line-clamp-2">
                            <HighlightMatch text={product.name} query={search} />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.promoPrice ? (
                          <div className="flex flex-col">
                            <span className="font-black text-red-600">{product.promoPrice} <span className="text-[10px] text-red-400 uppercase">TND</span></span>
                            <span className="text-xs font-bold text-slate-400 line-through">{product.price} TND</span>
                          </div>
                        ) : (
                          <span className="font-black text-slate-900">{product.price} <span className="text-[10px] text-slate-500 uppercase">TND</span></span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold ${product.stock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {product.stock <= 0 && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                          {product.stock} {product.stock === 1 ? 'item' : 'items'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(product.id, product.active)}
                          className={`relative inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                            product.active !== false
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${product.active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {product.active !== false ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/admin/products/${product.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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

        {totalPages > 1 && !search.trim() && (
          <div className="flex justify-center items-center gap-1.5 pt-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 shadow-sm">
              Page {page + 1} of {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Highlights the matching portion of the product name
function HighlightMatch({ text = '', query = '' }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}