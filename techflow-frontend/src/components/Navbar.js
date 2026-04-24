'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
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

export default function Navbar() {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();

  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);   // ✅ role state
  const [categories, setCategories] = useState([]);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredParentId, setHoveredParentId] = useState(null);
  const [search, setSearch] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(extractCategoriesArray(res.data)))
      .catch(err => console.error('Failed to fetch categories', err));

    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');   // ✅ read role
    if (email) setUserEmail(email);
    if (role) setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');   // ✅ clear role
    setUserEmail(null);
    setUserRole(null);
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
    router.refresh();
  };

  // ✅ FIXED: Use correct search endpoint /products/search?q=
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim().length >= 2) {
        setIsSearching(true);
        setShowSearchDropdown(true);
        try {
          const res = await api.get(`/products/search?q=${encodeURIComponent(search.trim())}&page=0&size=5`);
          const data = res.data?.content || res.data?.data || res.data || [];
          setSearchResults(Array.isArray(data) ? data.slice(0, 5) : []);
        } catch (error) {
          console.error('Failed to fetch search results', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setIsMobileMenuOpen(false);
      setShowSearchDropdown(false);
    }
  };

  const handleProductSelect = (productId) => {
    router.push(`/product/${productId}`);
    setSearch('');
    setShowSearchDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const handleCategorySelect = (categoryName) => {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
    setIsMegaMenuOpen(false);
    setHoveredParentId(null);
    setIsMobileMenuOpen(false);
  };

  const topLevelCategories = categories.filter(cat => cat.parent === null || !cat.parent);
  const hoveredParent = topLevelCategories.find(cat => cat.id === hoveredParentId);

  const handleMegaMenuLeave = () => {
    setIsMegaMenuOpen(false);
    setHoveredParentId(null);
  };

  const handleMobileCategoryClick = (cat) => {
    if (cat.subCategories?.length > 0) {
      setExpandedMobileCat(prev => prev === cat.id ? null : cat.id);
    } else {
      handleCategorySelect(cat.name);
    }
  };

  return (
    <header className="fixed w-full z-50 top-0 font-sans">
      <div className="bg-[#0B132B] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4 md:gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-black text-white tracking-tight leading-none">TECHFLOW</span>
                <span className="text-[9px] font-bold text-blue-400 tracking-[0.2em]">PREMIUM HARDWARE</span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg relative z-[60]">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => { if (search.trim().length >= 2) setShowSearchDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  placeholder="Search products..."
                  className="w-full bg-[#111C3A] border border-blue-900/50 text-white rounded-xl py-2.5 pl-4 pr-12 focus:outline-none focus:border-blue-500 focus:bg-[#16244A] transition-all text-sm placeholder:text-slate-500"
                />
                <button type="submit" className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </form>

              {/* Desktop Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map(prod => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleProductSelect(prod.id)}
                          className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between transition-colors last:border-0"
                        >
                          <div className="flex-1 overflow-hidden pr-4">
                            <p className="text-sm font-bold text-slate-800 truncate">{prod.name}</p>
                            <p className="text-xs text-slate-400 truncate">{prod.categories?.[0]}</p>
                          </div>
                          <span className="text-sm font-black text-blue-600 whitespace-nowrap">{prod.price} TND</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleSearch()}
                        className="w-full text-center p-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        View all results for &quot;{search}&quot;
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No products found for &quot;{search}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="hidden md:flex items-center gap-4">
                {userEmail ? (
                  <div className="flex items-center gap-3">
                    <Link href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </Link>
                    <div className="hidden lg:block text-right">
                      <p className="text-xs text-slate-400">Welcome,</p>
                      <p className="text-sm font-bold text-white">{userEmail.split('@')[0]}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors border-l border-white/10 pl-4"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
                    <span className="text-slate-600">|</span>
                    <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-500 transition-colors">Register</Link>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-white hover:text-blue-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#0B132B]">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Toggle */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Category Row - Desktop */}
        <div className="hidden md:block border-t border-white/5 bg-[#080d1e]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-6 h-12">
            <div className="h-full relative" onMouseLeave={handleMegaMenuLeave}>
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                className={`h-full flex items-center gap-2 px-4 font-bold text-sm tracking-wide transition-colors ${
                  isMegaMenuOpen ? 'bg-blue-600 text-white' : 'text-white bg-[#111C3A] hover:bg-[#16244A]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                Categories
              </button>

              {isMegaMenuOpen && (
                <div className="absolute top-full left-0 bg-white shadow-2xl rounded-b-2xl border border-slate-200 z-50 flex">
                  <div className="w-56 border-r border-slate-100 py-2 max-h-80 overflow-y-auto">
                    {topLevelCategories.map(cat => (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setHoveredParentId(cat.id)}
                        onClick={() => handleCategorySelect(cat.name)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex justify-between items-center transition-colors ${
                          hoveredParentId === cat.id ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cat.name}
                        {cat.subCategories?.length > 0 && (
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  {hoveredParent?.subCategories?.length > 0 && (
                    <div className="w-56 py-2 max-h-80 overflow-y-auto">
                      <p className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {hoveredParent.name}
                      </p>
                      {hoveredParent.subCategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleCategorySelect(sub.name)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link href="/deals" className="text-sm font-medium text-red-300 hover:text-red-400 transition-colors">Deals</Link>
            <Link href="/custom-builds" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">PC Builder</Link>
            <Link href="/orders" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">My Orders</Link>

            {/* Admin / Seller Dashboard Links – Desktop */}
            {userRole === 'ADMIN' && (
              <Link href="/admin" className="text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors ml-auto">
                Admin Dashboard
              </Link>
            )}
            {userRole === 'SELLER' && (
              <Link href="/seller" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors ml-auto">
                Seller Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>

          <div className="relative w-4/5 max-w-sm bg-[#0B132B] h-full shadow-2xl flex flex-col overflow-y-auto border-r border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <span className="text-xl font-black text-white tracking-tight">TECHFLOW</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="p-4 border-b border-white/10 bg-[#111C3A]/50">
              {userEmail ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Welcome,</p>
                      <p className="text-sm font-bold text-white truncate max-w-[120px]">{userEmail.split('@')[0]}</p>
                    </div>
                  </div>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-red-400 hover:text-red-300">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-medium text-slate-300 bg-[#16244A] rounded-xl hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors">
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Dashboard Links */}
              {userEmail && userRole === 'ADMIN' && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block mt-3 text-center py-2 text-sm font-bold bg-yellow-500/20 text-yellow-400 rounded-lg">
                  Admin Dashboard
                </Link>
              )}
              {userEmail && userRole === 'SELLER' && (
                <Link href="/seller" onClick={() => setIsMobileMenuOpen(false)} className="block mt-3 text-center py-2 text-sm font-bold bg-emerald-500/20 text-emerald-400 rounded-lg">
                  Seller Dashboard
                </Link>
              )}
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-white/10 relative z-50">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => { if (search.trim().length >= 2) setShowSearchDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  placeholder="Search products..."
                  className="w-full bg-[#111C3A] border border-blue-900/50 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-blue-500 transition-all text-sm placeholder:text-slate-500"
                />
                <button type="submit" className="absolute right-2 top-2 bg-blue-600 text-white p-1.5 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>

                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#16244A] rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(prod => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleProductSelect(prod.id)}
                          className="w-full text-left p-3 hover:bg-[#1C2C5A] border-b border-white/5 flex items-center justify-between transition-colors last:border-0"
                        >
                          <div className="flex-1 overflow-hidden pr-4">
                            <p className="text-sm font-bold text-white truncate">{prod.name}</p>
                            <p className="text-xs text-slate-400">{prod.categories?.[0]}</p>
                          </div>
                          <span className="text-sm font-black text-blue-400 whitespace-nowrap">{prod.price} TND</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">No products found</div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <nav className="p-4 border-b border-white/10 flex flex-col gap-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Home</Link>
              <Link href="/deals" onClick={() => setIsMobileMenuOpen(false)} className="text-red-400 hover:text-red-300 font-medium">Deals</Link>
              <Link href="/custom-builds" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">PC Builder</Link>
              <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">My Orders</Link>
            </nav>

            <div className="p-4 flex-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</h3>
              <div className="flex flex-col gap-2">
                {topLevelCategories.map(cat => (
                  <div key={cat.id} className="flex flex-col border border-white/5 rounded-xl bg-[#111C3A]/30 overflow-hidden">
                    <button
                      onClick={() => handleMobileCategoryClick(cat)}
                      className="flex items-center justify-between p-3 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      {cat.name}
                      {cat.subCategories?.length > 0 && (
                        <svg className={`w-4 h-4 transition-transform duration-200 ${expandedMobileCat === cat.id ? 'rotate-180 text-blue-500' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      )}
                    </button>
                    {expandedMobileCat === cat.id && cat.subCategories?.length > 0 && (
                      <div className="flex flex-col bg-[#0B132B] pb-2 pt-1 border-t border-white/5">
                        <button onClick={() => handleCategorySelect(cat.name)} className="text-left px-4 py-2 text-sm font-medium text-blue-400">
                          All {cat.name}
                        </button>
                        {cat.subCategories.map(sub => (
                          <button key={sub.id} onClick={() => handleCategorySelect(sub.name)} className="text-left px-4 py-2 text-sm text-slate-400 hover:text-white">
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}