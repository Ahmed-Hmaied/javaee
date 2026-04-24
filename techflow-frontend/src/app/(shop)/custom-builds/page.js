'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/Context/CartContext';

const extractCategoriesArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.content && Array.isArray(data.content)) return data.content;
  if (data.categories && Array.isArray(data.categories)) return data.categories;
  return [];
};

const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('cpu') || name.includes('processor')) {
    return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
  }
  if (name.includes('gpu') || name.includes('graphic')) {
    return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
  }
  if (name.includes('ram') || name.includes('memory')) {
    return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
  }
  if (name.includes('motherboard') || name.includes('board')) {
    return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
  }
  if (name.includes('power') || name.includes('psu')) {
    return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
  }
  if (name.includes('storage') || name.includes('ssd') || name.includes('hdd')) {
    return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
  }
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
};

export default function CustomBuildsPage() {
  const router = useRouter();
  const { cartCount, setIsCartOpen, addToCart } = useCart();

  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({});
  const [ramQuantity, setRamQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsRes = await api.get('/products?size=500');
        const products = productsRes.data.content || productsRes.data || [];

        const categoriesRes = await api.get('/categories');
        const rawCats = extractCategoriesArray(categoriesRes.data);

        const flatCategories = [];
        const flatten = (cats) => {
          cats.forEach(cat => {
            flatCategories.push(cat);
            if (cat.subCategories) flatten(cat.subCategories);
          });
        };
        flatten(rawCats);

        let componentsParent = flatCategories.find(
          cat => cat.name.toLowerCase().includes('component') && cat.parent === null
        );
        if (!componentsParent) {
          componentsParent = flatCategories.find(
            cat => cat.name.toLowerCase().includes('component')
          );
        }
        if (!componentsParent) {
          componentsParent = rawCats.find(c => c.name.toLowerCase().includes('computer')) || rawCats[0];
        }
        if (!componentsParent) {
          throw new Error('Could not find a suitable components category.');
        }

        const componentSubcategories = [];
        const collectSubcategories = (cat) => {
          if (cat.subCategories) {
            cat.subCategories.forEach(sub => {
              componentSubcategories.push(sub);
              collectSubcategories(sub);
            });
          }
        };
        collectSubcategories(componentsParent);

        const displayCategories = [];
        for (const subCat of componentSubcategories) {
          const matchingProducts = products.filter(product => {
            const productCats = product.categories;
            if (!productCats) return false;
            const catArray = Array.isArray(productCats) ? productCats : [productCats];
            return catArray.some(cat => {
              const catName = typeof cat === 'string' ? cat : cat?.name;
              return catName && catName.toLowerCase() === subCat.name.toLowerCase();
            });
          });

          if (matchingProducts.length > 0) {
            displayCategories.push({
              id: subCat.id,
              name: subCat.name,
              products: matchingProducts
            });
          }
        }

        setAvailableCategories(displayCategories);

        const initialSelected = {};
        displayCategories.forEach(cat => { initialSelected[cat.id] = null; });
        setSelectedComponents(initialSelected);

      } catch (err) {
        console.error('Failed to fetch data', err);
        setError(err.message || 'Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (categoryId, product) => {
    setSelectedComponents(prev => ({
      ...prev,
      [categoryId]: product
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selectedComponents).forEach(([catId, product]) => {
      if (!product) return;
      const category = availableCategories.find(c => c.id === parseInt(catId));
      if (category?.name.toLowerCase() === 'ram') {
        total += (product.promoPrice || product.price) * ramQuantity;
      } else {
        total += (product.promoPrice || product.price);
      }
    });
    return total;
  };

  const hasAnySelection = () => {
    return Object.values(selectedComponents).some(p => p !== null);
  };

  const handleAddBuildToCart = async () => {
    if (!hasAnySelection()) {
      alert('Please select at least one component.');
      return;
    }

    for (const [catId, product] of Object.entries(selectedComponents)) {
      if (!product) continue;
      const category = availableCategories.find(c => c.id === parseInt(catId));
      const isRam = category?.name.toLowerCase() === 'ram';
      const quantity = isRam ? ramQuantity : 1;
      await addToCart(product.id, quantity);
    }
    setIsCartOpen(true);
  };

  const handleBuyNow = async () => {
    if (!hasAnySelection()) {
      alert('Please select at least one component.');
      return;
    }

    for (const [catId, product] of Object.entries(selectedComponents)) {
      if (!product) continue;
      const category = availableCategories.find(c => c.id === parseInt(catId));
      const isRam = category?.name.toLowerCase() === 'ram';
      const quantity = isRam ? ramQuantity : 1;
      await addToCart(product.id, quantity);
    }
    router.push('/checkout');
  };

  const totalPrice = calculateTotal();
  const selectedCount = Object.values(selectedComponents).filter(p => p !== null).length;

  const renderBuildCategory = (category) => {
    const products = category.products || [];
    const selected = selectedComponents[category.id];
    const isRamCategory = category.name.toLowerCase() === 'ram';
    
    return (
      <div 
        key={category.id} 
        className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
          selected 
            ? 'border-blue-500 shadow-[0_0_20px_-10px_rgba(37,99,235,0.4)]' 
            : 'border-slate-200 border-dashed hover:border-slate-300'
        }`}
      >
        {selected && (
          <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-white z-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected ? 'bg-blue-600 text-white shadow-inner' : 'bg-slate-100 text-slate-400'}`}>
              {getCategoryIcon(category.name)}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-black text-slate-900 uppercase tracking-wider">
                {category.name}
              </label>
              {selected ? (
                <p className="text-xs text-blue-600 font-semibold mt-0.5">Component Selected</p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">Select a component</p>
              )}
            </div>
          </div>

          <div className="relative">
            <select
              value={selected?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === parseInt(e.target.value));
                handleSelect(category.id, product || null);
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer pr-10"
            >
              <option value="">-- Choose {category.name} --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} • {product.promoPrice || product.price} TND
                  {product.stock === 0 ? ' (Out of Stock)' : ''}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
            </div>
          </div>

          {selected && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <span className="block font-semibold text-slate-800 line-clamp-1">{selected.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-slate-900">
                    {selected.promoPrice || selected.price} TND
                  </span>
                  {selected.stock === 0 && <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded">Out of Stock</span>}
                </div>
              </div>

              {isRamCategory && (
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Qty</label>
                  <select
                    value={ramQuantity}
                    onChange={(e) => setRamQuantity(parseInt(e.target.value))}
                    className="w-16 bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <div className="pt-8 pb-16 px-6 max-w-7xl mx-auto">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-800 mb-3 tracking-tight">
            Custom PC Builder
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Design your ultimate rig. Select premium components below to assemble your dream setup.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
            <div className="w-full lg:w-96 h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p className="text-red-700 font-medium text-lg">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-red-100 text-red-700 hover:bg-red-200 px-6 py-2 rounded-lg font-bold transition-colors">
              Try Again
            </button>
          </div>
        ) : availableCategories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔧</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">No components available</h2>
            <p className="text-slate-500 mb-6">Our armory is currently empty. Please check back later.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/30">
              Browse All Products
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            <div className="flex-1 w-full space-y-4">
              {availableCategories.map(cat => renderBuildCategory(cat))}
            </div>

            <div className="w-full lg:w-[400px] lg:sticky lg:top-24">
              <div className="bg-slate-900 rounded-3xl p-1 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                
                <div className="bg-slate-900 rounded-[22px] p-6 relative z-10">
                  <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      Build Receipt
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{selectedCount} out of {availableCategories.length} items chosen</p>
                  </div>

                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {availableCategories.map(cat => {
                      const item = selectedComponents[cat.id];
                      if (!item) return null;
                      const isRam = cat.name.toLowerCase() === 'ram';
                      const qty = isRam ? ramQuantity : 1;
                      const price = (item.promoPrice || item.price) * qty;

                      return (
                        <div key={cat.id} className="flex justify-between items-start gap-4 text-sm group">
                          <div className="flex-1">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-0.5">{cat.name}</span>
                            <span className="text-slate-200 line-clamp-2">{item.name} {qty > 1 ? <span className="text-blue-400 font-bold">x{qty}</span> : ''}</span>
                          </div>
                          <span className="text-white font-semibold whitespace-nowrap mt-4">{price} TND</span>
                        </div>
                      );
                    })}
                    {!hasAnySelection() && (
                      <div className="text-center py-8 text-slate-500 text-sm border border-slate-800 border-dashed rounded-xl">
                        Your build is empty.<br/>Start selecting components.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-4 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 font-medium">Estimated Total</span>
                      <div className="text-right">
                        <span className="block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                          {totalPrice.toFixed(3)}
                        </span>
                        <span className="text-slate-400 text-sm font-bold">TND</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleAddBuildToCart}
                      disabled={!hasAnySelection()}
                      className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!hasAnySelection()}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                      Proceed to Checkout →
                    </button>
                  </div>
                  
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>
    </main>
  );
}