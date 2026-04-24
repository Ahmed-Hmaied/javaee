'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      
      console.log('=== CATEGORIES API RESPONSE ===');
      console.log('Raw data type:', typeof res.data);
      
      let data = res.data;
      
      // If the response is a string, try to parse it as JSON
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
          console.log('Parsed JSON successfully');
        } catch (parseErr) {
          console.error('Failed to parse JSON string', parseErr);
          setCategories([]);
          return;
        }
      }
      
      console.log('Data after parsing:', data);
      console.log('Is array?', Array.isArray(data));
      
      // Handle different response shapes
      let categoriesArray = [];
      if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data?.content && Array.isArray(data.content)) {
        categoriesArray = data.content;
      } else if (data?.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      }
      
      console.log('Extracted categories array length:', categoriesArray.length);
      setCategories(categoriesArray);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      showToast('Failed to load categories. Check your connection.', 'error');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Subcategories will be orphaned.')) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  // Recursive function that renders from nested subCategories
  const renderCategoryTree = (categoryList, level = 0) => {
    if (!Array.isArray(categoryList) || categoryList.length === 0) return null;
    
    return categoryList.map((cat, index) => (
      <div key={cat.id} className={`${level > 0 ? 'ml-8 mt-3 relative' : 'mt-4'}`}>
        
        {/* Tree Connecting Lines for Subcategories */}
        {level > 0 && (
          <>
            <div className="absolute -left-5 top-0 bottom-0 w-px bg-slate-200" style={{ bottom: index === categoryList.length - 1 ? '50%' : '0' }}></div>
            <div className="absolute -left-5 top-8 w-5 h-px bg-slate-200"></div>
          </>
        )}
        
        <div 
          className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group border ${
            level === 0 
              ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 z-10 relative' 
              : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              level === 0 ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-white text-slate-400 border border-slate-200 group-hover:text-blue-500'
            }`}>
              {level === 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              )}
            </div>
            <div>
              <span className={`font-black tracking-tight block ${level === 0 ? 'text-lg text-slate-900' : 'text-base text-slate-700'}`}>
                {cat.name}
              </span>
              {cat.description && (
                <span className="text-sm font-medium text-slate-500 block mt-0.5 line-clamp-1">{cat.description}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => router.push(`/admin/categories/${cat.id}`)}
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Recursively render subcategories if they exist */}
        {cat.subCategories && cat.subCategories.length > 0 && (
          <div className="relative z-0">
            {renderCategoryTree(cat.subCategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-8 relative">
        
        {/* Premium Toast Alert Design */}
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
            <p className="text-slate-500 mt-1 font-medium">Organize and structure your product catalog.</p>
          </div>
          <Link
            href="/admin/categories/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add Category
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">No categories found</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">You haven't created any categories yet. Create your first one to start organizing products.</p>
            </div>
          ) : (
            <div className="pl-2">
              {renderCategoryTree(categories)}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}