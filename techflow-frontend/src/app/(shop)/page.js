'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useCart } from '@/app/Context/CartContext';

export default function Home() {
  const { cartCount, setIsCartOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Brands array and logo mapping
  const brands = ['Dell', 'Acer', 'ASUS', 'Hp', 'Redragon', 'Razer', 'NVIDIA', 'AMD', 'Intel'];

  const brandLogoMap = {
    'Dell': '/images/brands/dell.png',
    'Acer': '/images/brands/acer.png',
    'ASUS': '/images/brands/asus.png',
    'Hp': '/images/brands/hp.png',
    'Redragon': '/images/brands/redragon.png',
    'Razer': '/images/brands/razer.png',
    'NVIDIA': '/images/brands/nvidia.png',
    'AMD': '/images/brands/amd.png',
    'Intel': '/images/brands/intel.png',
  };

  useEffect(() => {
    api.get('/products?page=0&size=4')
      .then(res => setProducts(res.data.content || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    if (email) {
      setUserEmail(email);
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserEmail(null);
    setUserRole(null);
    window.location.href = '/login';
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Custom styles for the infinite scrolling marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: scrollMarquee 30s linear infinite;
        }
        .marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />

      {/* Editorial Hero Section */}
      <section className="pt-10 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-slate-950 rounded-3xl p-10 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 border border-slate-800">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-md bg-white text-slate-900 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              New RTX 40-Series
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
              Next Level <br/>
              <span className="text-slate-500">Performance.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg">
              The ultimate destination for Tunisian gamers and creators. Shop authentic hardware with local warranty and expert support.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/products" className="bg-white text-slate-950 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                Explore Hardware
              </Link>
              <Link href="/deals" className="bg-transparent border border-slate-700 text-white px-8 py-4 rounded-xl font-bold hover:border-slate-400 transition-colors">
                View Deals
              </Link>
            </div>
          </div>
          <div className="hidden lg:block w-full max-w-md">
            <div className="aspect-square rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative">
              <img 
                src="/hero-banner.png" 
                alt="Next Level Performance Hardware" 
                className="w-full h-full object-cover mix-blend-lighten opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trending Components</h2>
              <p className="text-slate-500 mt-2 font-medium">Top picks from our inventory this week.</p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-2 text-slate-900 font-bold hover:text-blue-600 transition-colors">
              View Entire Catalog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 h-[400px] flex flex-col">
                <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-1/4 mb-3 animate-pulse"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-auto animate-pulse"></div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
                  <div className="h-12 bg-slate-100 rounded-xl w-full animate-pulse"></div>
                </div>
              </div>
            )) : products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-400 transition-colors duration-200 flex flex-col h-full group">
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {product.categories?.[0]?.name || 'Hardware'}
                  </span>
                </div>
                <div className="h-48 w-full bg-white flex items-center justify-center mb-4 p-4">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out" />
                  ) : (
                    <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <h4 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-snug">{product.name}</h4>
                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">{product.price}</span>
                      <span className="text-sm font-bold text-slate-500">TND</span>
                    </div>
                    <Link href={`/product/${product.id}`} className="block">
                      <button className="w-full bg-slate-950 text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2 text-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 sm:hidden">
            <Link href="/products" className="flex justify-center items-center gap-2 w-full bg-slate-200 text-slate-900 py-4 rounded-xl font-bold">
              View Entire Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* --- SCROLLING BRAND MARQUEE (IMAGES ONLY) --- */}
      <div className="bg-slate-900 border-b border-slate-800 py-8 overflow-hidden marquee-container relative">
        {/* Gradient overlays for smooth edges */}
        <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
        
        <div className="animate-marquee">
          {[...brands, ...brands].map((brand, index) => {
            const logoSrc = brandLogoMap[brand];
            return (
              <div key={index} className="flex items-center justify-center mx-8 md:mx-12 min-w-[100px]">
                <img 
                  src={logoSrc}
                  alt={brand}
                  className="h-8 md:h-10 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
                  onError={(e) => {
                    // Hide broken images silently
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer Content */}
      <footer className="bg-slate-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            
            {/* Brand & Newsletter Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <span className="text-xl font-black text-white tracking-widest uppercase">TECHFLOW</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                The premier destination for PC building, gaming peripherals, and high-performance computing in North Africa.
              </p>
              <form className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-slate-500 text-sm flex-1 placeholder:text-slate-600"
                />
                <button type="submit" className="bg-white text-slate-950 px-6 py-3 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>

            {/* Navigation Columns */}
            <div>
              <h5 className="text-white font-black mb-6 text-xs uppercase tracking-widest">Shop</h5>
              <ul className="space-y-4">
                <li><Link href="/products" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">All Components</Link></li>
                <li><Link href="/deals" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Current Deals</Link></li>
                <li><Link href="/builds" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Pre-built Systems</Link></li>
                <li><Link href="/new" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">New Arrivals</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-black mb-6 text-xs uppercase tracking-widest">Support</h5>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Returns & Warranty</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-black mb-6 text-xs uppercase tracking-widest">Legal</h5>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><a href="mailto:support@techflow.tn" className="text-blue-500 text-sm font-bold hover:text-blue-400 transition-colors">support@techflow.tn</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Socials */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs font-medium">
              © {new Date().getFullYear()} TechFlow Hardware. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Facebook', 'Twitter', 'Instagram', 'Discord'].map((social) => (
                <Link key={social} href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}