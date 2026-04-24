'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'Tunisia',
  });
  const [orderPlaced, setOrderPlaced] = useState(null);
  
  // New state to hold specific input errors
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);

    api.get(`/cart?email=${email}`)
      .then(res => {
        setCart(res.data);
      })
      .catch(err => {
        console.error('Cart fetch error:', err);
        setError('Failed to load cart. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Validation Function
  const validateForm = () => {
    const errors = {};
    
    // City must contain only letters (and spaces/hyphens for names like "Sidi Bouzid")
    const cityRegex = /^[a-zA-Z\s\u00C0-\u017F\-]+$/;
    if (!cityRegex.test(address.city.trim())) {
      errors.city = "City must contain only letters.";
    }

    // Postal code must contain only numbers
    const postalCodeRegex = /^\d+$/;
    if (!postalCodeRegex.test(address.postalCode.trim())) {
      errors.postalCode = "Postal code must contain only numbers.";
    }

    setFieldErrors(errors);
    
    // Return true if there are no errors
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Run validation before proceeding
    if (!validateForm()) {
      return;
    }

    setPlacing(true);
    setError(null);
    const email = localStorage.getItem('userEmail');

    try {
      // Step 1: Create address
      const addressRes = await api.post(`/addresses?email=${email}`, {
        street: address.street,
        city: address.city.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country,
        isPrimary: true
      });

      if (!addressRes.data?.id) {
        throw new Error('Address creation failed – no ID returned');
      }

      // Step 2: Place order
      const orderRes = await api.post(`/orders?email=${email}&addressId=${addressRes.data.id}`);

      setOrderPlaced(orderRes.data);
    } catch (err) {
      console.error('Checkout error:', err);
      const message = err.response?.data?.message || err.message || 'Error placing order';
      setError(message);
      alert(`Order failed: ${message}`);
    } finally {
      setPlacing(false);
    }
  };

  // Robust calculation helpers
  const getItemPrice = (item) => Number(item.price || item.unitPrice || item.product?.price || 0);
  const getItemSubtotal = (item) => Number(item.subtotal || (getItemPrice(item) * item.quantity) || 0);
  
  const calculatedSubtotal = cart?.items?.reduce((sum, item) => sum + getItemSubtotal(item), 0) 
    || Number(cart?.total || 0);

  const shippingFee = 7.000;
  const finalTotal = calculatedSubtotal > 0 ? calculatedSubtotal + shippingFee : 0;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Preparing your checkout...</p>
    </div>
  );

  if (error && !cart) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );

  // Order success screen
  if (orderPlaced) return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500 mb-8">Thank you for your purchase. We've received your order and are getting it ready to be shipped.</p>
        
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Number</p>
          <p className="text-2xl font-black text-blue-600 tracking-tight mb-4">{orderPlaced.orderNumber}</p>
          <div className="h-px bg-slate-200 w-full mb-4"></div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Total Paid</span>
            <span className="font-bold text-slate-900 text-lg">{Number(orderPlaced.totalTTC || finalTotal).toFixed(3)} TND</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders" className="flex-1 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
            View Order
          </Link>
          <Link href="/" className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="py-12 max-w-6xl mx-auto px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Checkout</h1>
          <p className="text-slate-500 mt-1">Please provide your delivery details to complete the order.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Forms */}
          <div className="flex-1">
            <form onSubmit={handlePlaceOrder}>
              
              {/* Address Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    1
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Delivery Address</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Street Address</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                      placeholder="e.g. 22 Rue de la Republique"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-1.5 block">City</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={e => {
                          setAddress({...address, city: e.target.value});
                          if(fieldErrors.city) setFieldErrors({...fieldErrors, city: null});
                        }}
                        className={`w-full bg-slate-50 border ${fieldErrors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'} rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-4 transition-all placeholder:text-slate-400`}
                        placeholder="e.g. Sfax"
                        required
                      />
                      {fieldErrors.city && (
                        <p className="mt-1.5 text-xs font-bold text-red-500">{fieldErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-1.5 block">Postal Code</label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={e => {
                          setAddress({...address, postalCode: e.target.value});
                          if(fieldErrors.postalCode) setFieldErrors({...fieldErrors, postalCode: null});
                        }}
                        className={`w-full bg-slate-50 border ${fieldErrors.postalCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'} rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-4 transition-all placeholder:text-slate-400`}
                        placeholder="e.g. 3000"
                        required
                      />
                      {fieldErrors.postalCode && (
                        <p className="mt-1.5 text-xs font-bold text-red-500">{fieldErrors.postalCode}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={e => setAddress({...address, country: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                      placeholder="Tunisia"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                </div>

                <div className="bg-blue-50/50 border-2 border-blue-500 rounded-xl p-5 flex items-start gap-4 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-0.5">Cash on Delivery</p>
                    <p className="text-sm text-slate-500 leading-relaxed">Pay with cash to the delivery agent when you receive your order at your address.</p>
                  </div>
                </div>
              </div>

              {/* Desktop Submit Button */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  disabled={placing || !cart?.items?.length}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
                >
                  {placing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      Place Order
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-8">
              <h2 className="text-lg font-black text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart?.items?.map((item, index) => (
                  <div key={item.itemId} className={`flex justify-between gap-4 text-sm ${index !== cart.items.length - 1 ? 'pb-4 border-b border-slate-100' : ''}`}>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 line-clamp-2">{item.productName}</p>
                      <p className="text-slate-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    {/* Fixed Item Subtotal */}
                    <span className="font-bold text-slate-900 shrink-0">
                      {getItemSubtotal(item).toFixed(3)} <span className="text-[10px] text-slate-500">TND</span>
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-50 rounded-xl p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  {/* Fixed Cart Subtotal */}
                  <span className="font-semibold text-slate-900">
                    {calculatedSubtotal.toFixed(3)} <span className="text-[10px] text-slate-500">TND</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {shippingFee.toFixed(3)} <span className="text-[10px] text-slate-500">TND</span>
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center mt-2">
                  <span className="font-bold text-slate-900">Total</span>
                  {/* Fixed Final Total */}
                  <span className="text-2xl font-black text-blue-600 tracking-tight">
                    {finalTotal.toFixed(3)} <span className="text-sm font-bold text-blue-600 uppercase">TND</span>
                  </span>
                </div>
              </div>

              {/* Mobile Submit Button */}
              <div className="block lg:hidden">
                <button
                  type="submit"
                  onClick={handlePlaceOrder}
                  disabled={placing || !cart?.items?.length}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {placing ? 'Processing...' : 'Place Order'}
                </button>
              </div>

              <div className="mt-6 flex items-start gap-3 text-xs text-slate-500">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p>Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}