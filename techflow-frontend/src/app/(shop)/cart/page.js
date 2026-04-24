'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);
    fetchCart(email);
  }, []);

  const fetchCart = async (email) => {
    setLoading(true);
    try {
      const res = await api.get(`/cart?email=${email}`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    setApplyingCoupon(true);
    try {
      const res = await api.post(`/cart/coupon?email=${email}&code=${couponCode}`);
      setCart(res.data);
      setCouponCode('');
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    const email = localStorage.getItem('userEmail');
    try {
      const res = await api.delete(`/cart/coupon?email=${email}`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <nav className="fixed w-full z-50 top-0 bg-[#0f172a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tighter uppercase">TechFlow</span>
          </Link>
          <Link href="/products" className="text-sm text-slate-300 hover:text-white transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </nav>

      <div className="pt-24 max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-slate-900 mb-8">
          🛒 Your Cart
          {cart?.items?.length > 0 && (
            <span className="text-lg font-normal text-slate-400 ml-3">({cart.items.length} items)</span>
          )}
        </h1>

        {!cart?.items?.length ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-slate-700 mb-3">Your cart is empty</h2>
            <p className="text-slate-400 mb-8">Add some products to get started!</p>
            <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cart.items.map(item => (
                <div key={item.itemId} className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-6 items-center hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{item.productName}</h3>
                    <p className="text-blue-600 font-black text-lg">{item.unitPrice} TND</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors">-</button>
                    <span className="font-bold text-slate-900 w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors">+</button>
                  </div>
                  <div className="text-right w-28">
                    <p className="font-black text-slate-900">{item.subtotal} TND</p>
                    <button onClick={() => removeItem(item.itemId)} className="text-xs text-red-400 hover:text-red-600 transition-colors mt-1">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-80">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

                {/* Coupon Section */}
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
                      <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-sm font-bold">Remove</button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{cart.subtotal} TND</span>
                  </div>
                  {cart.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">-{cart.discountAmount} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className="font-semibold">{cart.shippingFee} TND</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-slate-900">
                    <span>Total</span>
                    <span className="text-blue-600">{cart.totalAfterDiscount} TND</span>
                  </div>
                </div>

                <button onClick={() => router.push('/checkout')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all">
                  Checkout →
                </button>

                <Link href="/products" className="block text-center text-sm text-slate-400 hover:text-slate-600 mt-4 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}