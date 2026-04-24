// app/context/CartContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const CartContext = createContext();

export function CartProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const fetchCart = async (email) => {
    try {
      const res = await api.get(`/cart?email=${email}`);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      fetchCart(email);
    } else {
      setLoading(false);
    }
  }, [pathname]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const addToCart = async (productId, qty = 1) => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }
    try {
      await api.post(`/cart/items?email=${email}`, { productId, quantity: qty });
      await fetchCart(email);
      showToast('Item added to cart!');
    } catch (err) {
      showToast('Error adding to cart.');
    }
  };

  const removeItem = async (itemId) => {
    const email = localStorage.getItem('userEmail');
    try {
      const res = await api.delete(`/cart/items/${itemId}?email=${email}`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    const email = localStorage.getItem('userEmail');
    try {
      const res = await api.put(`/cart/items/${itemId}?email=${email}&quantity=${quantity}`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }
    setApplyingCoupon(true);
    try {
      const res = await api.post(`/cart/coupon?email=${email}&code=${couponCode}`);
      setCart(res.data);
      setCouponCode('');
      showToast('Coupon applied!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    const email = localStorage.getItem('userEmail');
    try {
      const res = await api.delete(`/cart/coupon?email=${email}`);
      setCart(res.data);
      showToast('Coupon removed');
    } catch (err) {
      showToast('Failed to remove coupon');
    }
  };

  const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, cartCount, isCartOpen, setIsCartOpen,
      addToCart, removeItem, updateQuantity,
      couponCode, setCouponCode, applyingCoupon, applyCoupon, removeCoupon
    }}>
      {children}

      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-[70] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">✓</div>
          {toast.message}
        </div>
      </div>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity" onClick={() => setIsCartOpen(false)} />
      )}

      {/* Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[60] transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            🛒 Your Cart
            <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">{cartCount}</span>
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>
          ) : !cart?.items?.length ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Your cart is empty</h3>
              <p className="text-slate-500 text-sm">Looks like you haven't added anything yet.</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-6 text-blue-600 font-bold hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map(item => (
                <div key={item.itemId} className="flex gap-4 pb-4 border-b border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{item.productName}</h4>
                    <p className="text-blue-600 font-black text-sm">{item.unitPrice} TND</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">-</button>
                        <span className="font-bold text-slate-900 text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">+</button>
                      </div>
                      <button onClick={() => removeItem(item.itemId)} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="border-t border-slate-100 p-6 bg-slate-50">
            {/* Coupon Input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  disabled={!couponCode || applyingCoupon}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {cart.appliedCoupon && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-2">
                  <span className="text-sm font-bold text-emerald-700">{cart.appliedCoupon.code}</span>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-sm font-bold">
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">{cart.subtotal} TND</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-semibold">-{cart.discountAmount} TND</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold">{cart.shippingFee} TND</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-lg pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-blue-600">{cart.totalAfterDiscount} TND</span>
              </div>
            </div>

            <button 
              onClick={() => { setIsCartOpen(false); router.push('/checkout'); }}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 mt-4"
            >
              Checkout Now →
            </button>
          </div>
        )}
      </div>
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);