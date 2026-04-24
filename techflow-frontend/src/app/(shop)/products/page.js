'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { Suspense } from 'react';
import { useCart } from '@/app/Context/CartContext';

const extractCategoriesArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.content && Array.isArray(data.content)) return data.content;
  if (data.categories && Array.isArray(data.categories)) return data.categories;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.id && data.name) return [data];
  return [];
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?page=0&size=100'),
          api.get('/categories')
        ]);
        const prods = productsRes.data.content || productsRes.data;
        setAllProducts(prods);
        const cats = extractCategoriesArray(categoriesRes.data);
        setAllCategories(cats);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (allCategories.length === 0) return;
    const catParam = searchParams.get('category');
    if (catParam) {
      const decoded = decodeURIComponent(catParam);
      const findCategory = (cats, target) => {
        for (const cat of cats) {
          if (cat.name === target) return cat;
          if (cat.subCategories) {
            const found = findCategory(cat.subCategories, target);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findCategory(allCategories, decoded);
      if (found) {
        setSelectedCategoryName(found.name);
      }
    }
  }, [searchParams, allCategories]);

  const filteredProducts = allProducts.filter(p => {
    let categoryMatch = true;
    if (selectedCategoryName) {
      if (Array.isArray(p.categories)) {
        categoryMatch = p.categories.some(cat => {
          if (typeof cat === 'string') {
            return cat === selectedCategoryName;
          } else if (cat && typeof cat === 'object') {
            return cat.name === selectedCategoryName || cat.categoryName === selectedCategoryName;
          }
          return false;
        });
      } else {
        categoryMatch = false;
      }
    }

    const searchString = search.toLowerCase();
    const searchMatch = search === '' || 
      p.name.toLowerCase().includes(searchString) || 
      (p.description && p.description.toLowerCase().includes(searchString));

    const stockMatch = !inStockOnly || p.stock > 0;

    return categoryMatch && searchMatch && stockMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.promoPrice || a.price;
    const priceB = b.promoPrice || b.price;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0;
  });

  const clearCategory = () => {
    setSelectedCategoryName('');
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) setUserEmail(email);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <div className="pt-8 max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header & Controls */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {selectedCategoryName || 'All Products'}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Showing {sortedProducts.length} items
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 text-sm font-bold pl-2 pr-8 py-1.5 focus:outline-none cursor-pointer appearance-none relative z-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
              <svg className="absolute right-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            {/* In Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              In Stock Only
            </label>

            {/* Active Filters */}
            {selectedCategoryName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-xs font-bold text-blue-700 border border-blue-100">
                {selectedCategoryName}
                <button onClick={clearCategory} className="text-blue-400 hover:text-blue-900">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-xs font-bold text-blue-700 border border-blue-100">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="text-blue-400 hover:text-blue-900">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            )}
            {(selectedCategoryName || search || inStockOnly) && (
              <button 
                onClick={() => { clearCategory(); setSearch(''); setInStockOnly(false); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 underline"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[380px] bg-white animate-pulse rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col">
                <div className="w-full h-48 bg-slate-100 rounded-2xl mb-4"></div>
                <div className="h-4 w-1/3 bg-slate-100 rounded mb-2"></div>
                <div className="h-5 w-3/4 bg-slate-100 rounded mb-4"></div>
                <div className="mt-auto flex justify-between items-end">
                   <div className="h-6 w-1/3 bg-slate-100 rounded"></div>
                   <div className="h-8 w-1/3 bg-slate-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </div>
             <p className="text-xl font-black text-slate-800">No products found</p>
             <p className="text-slate-500 font-medium mt-2 mb-6">Try adjusting your filters or search term.</p>
             <button 
               onClick={() => { clearCategory(); setSearch(''); setInStockOnly(false); }}
               className="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/20"
             >
               Clear all filters
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => router.push(`/product/${product.id}`)}
                className="bg-white rounded-3xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative group cursor-pointer"
              >
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  {product.promoPrice && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">Sale</span>
                  )}
                  {product.stock === 0 && (
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">Out of Stock</span>
                  )}
                </div>
                
                <div className="h-48 w-full bg-slate-50/50 rounded-2xl flex items-center justify-center mb-5 overflow-hidden group-hover:bg-slate-50 transition-colors relative">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 p-4" 
                    />
                  ) : (
                    <svg className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  )}
                </div>

                <div className="flex-1 flex flex-col px-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">
                    {product.categories?.[0]?.name || 'Hardware'}
                  </span>
                  
                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        {product.promoPrice ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 line-through font-bold mb-0.5">{product.price} TND</span>
                            <span className="text-xl font-black text-red-600 leading-none">{product.promoPrice} <span className="text-[10px] uppercase">TND</span></span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 leading-none">{product.price}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">TND</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {product.stock > 0 ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                            Empty
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 border border-slate-200 group-hover:border-blue-600">
                      View Details
                      <svg className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-slate-200 border-t-blue-600"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}