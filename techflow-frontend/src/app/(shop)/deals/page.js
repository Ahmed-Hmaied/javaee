'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DealsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?page=0&size=100')
      .then(res => {
        const allProducts = res.data.content || res.data;
        const deals = allProducts.filter(p => p.promoPrice != null && p.promoPrice > 0);
        setProducts(deals);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Banner */}
      <section className="pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-[#0f172a] rounded-[2rem] p-10 md:p-16 text-center border border-slate-800">
          <span className="inline-block py-1.5 px-4 rounded-full bg-slate-800 text-slate-300 text-xs font-bold tracking-widest mb-6 border border-slate-700">
            SPECIAL OFFERS
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Current Deals
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Discover premium hardware at reduced prices. Upgrade your setup with our latest verified offers.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[420px] bg-white border border-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No active deals right now</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">Check back later for special offers and discounts on premium components.</p>
            <Link href="/products" className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative group">
                
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide flex items-center gap-1 shadow-sm">
                    Save {(product.price - product.promoPrice).toFixed(0)} TND
                  </span>
                </div>

                <div className="mb-3 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {product.categories?.[0]?.name || 'Hardware'}
                  </span>
                </div>

                <div className="h-44 w-full bg-slate-50 rounded-xl flex items-center justify-center mb-5 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <svg className="w-12 h-12 text-slate-300 group-hover:scale-105 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <p className="text-slate-500 text-sm mb-5 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex flex-col gap-1 mb-5">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{product.promoPrice} <span className="text-sm text-slate-500 font-bold">TND</span></span>
                      <span className="text-sm text-slate-400 line-through font-medium">{product.price} TND</span>
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}