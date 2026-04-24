'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useCart } from '@/app/Context/CartContext';

// Star Icon Component
const StarIcon = ({ filled, className = "w-5 h-5" }) => (
  <svg 
    className={`${className} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} 
    viewBox="0 0 20 20" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Image Gallery Component with Carousel & Thumbnails
const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="relative bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-[2.5rem] p-12 flex items-center justify-center min-h-[500px] shadow-sm">
        <div className="text-center text-slate-300">
          <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span className="text-sm font-semibold">No Image Available</span>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display */}
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-blue-50 rounded-[2.5rem] transform -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
        <div className="relative bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-[2.5rem] p-8 flex items-center justify-center min-h-[400px] md:min-h-[500px] shadow-sm overflow-hidden">
          <img 
            src={images[currentIndex]} 
            alt={`Product image ${currentIndex + 1}`} 
            className="max-w-full max-h-[450px] object-contain drop-shadow-xl transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23cbd5e1\' stroke-width=\'1\'%3E%3Cpath d=\'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4\'/%3E%3C/svg%3E';
            }}
          />
          
          {/* Navigation Arrows (only show if more than one image) */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide snap-x">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 transition-all duration-200 snap-center ${
                idx === currentIndex 
                  ? 'border-blue-600 shadow-md scale-[1.02]' 
                  : 'border-slate-200 hover:border-blue-400 opacity-60 hover:opacity-100'
              }`}
              aria-label={`Select image ${idx + 1}`}
            >
              <img 
                src={img} 
                alt={`Product thumbnail ${idx + 1}`} 
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23cbd5e1\' stroke-width=\'1\'%3E%3Cpath d=\'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4\'/%3E%3C/svg%3E';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const email = localStorage.getItem('userEmail');
      await api.post(`/reviews?email=${email}`, {
        productId: product.id,
        rating,
        comment
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Review {product.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <StarIcon 
                  filled={star <= (hoveredStar || rating)} 
                  className="w-10 h-10 drop-shadow-sm transition-colors duration-200"
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows="4"
            className="w-full border border-slate-200 rounded-2xl p-4 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700 resize-none"
            required
          />
          {error && <p className="text-red-500 text-sm font-medium mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userEmail, setUserEmail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) setUserEmail(email);

    fetchProduct();
    fetchReviews();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${params.id}`);
      const reviewList = res.data;
      setReviews(reviewList);

      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalScore = 0;
      
      reviewList.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          counts[r.rating] = (counts[r.rating] || 0) + 1;
          totalScore += r.rating;
        }
      });
      
      setRatingCounts(counts);
      
      if (reviewList.length > 0) {
        setAverageRating(totalScore / reviewList.length);
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const checkUserReviewStatus = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    try {
      const res = await api.get(`/reviews/check/${params.id}?email=${email}`);
      setUserHasReviewed(res.data.reviewed);
    } catch (err) {
      console.error('Failed to check review status', err);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    router.push('/checkout');
  };

  const handleReviewSuccess = () => {
    fetchReviews(); 
    setUserHasReviewed(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="pt-6 max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
            <div className="bg-slate-100 rounded-[2rem] aspect-square"></div>
            <div className="py-8 space-y-6">
              <div className="h-6 w-32 bg-slate-100 rounded-full"></div>
              <div className="h-12 w-3/4 bg-slate-100 rounded-xl"></div>
              <div className="h-10 w-48 bg-slate-100 rounded-xl"></div>
              <div className="space-y-3 pt-6">
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
              </div>
              <div className="pt-8 grid grid-cols-2 gap-4">
                <div className="h-14 bg-slate-100 rounded-2xl"></div>
                <div className="h-14 bg-slate-100 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-slate-500 mb-8">The item you're looking for doesn't exist or has been removed.</p>
          <Link href="/products" className="block w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const isInStock = product.stock > 0;
  const totalReviews = reviews.length;
  
  // Combine main image and additional images for gallery
  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.imageUrls || [])
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="pt-6 pb-24 lg:pt-8">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <span className="text-slate-800 truncate">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">
            {/* Left Column: Product Image Gallery */}
            <ImageGallery images={allImages} />

            {/* Right Column: Product Info */}
            <div className="flex flex-col justify-center">
              <div className="mb-4">
                <Link 
                  href={`/products?category=${encodeURIComponent(product.categories?.[0]?.name || 'Hardware')}`}
                  className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black tracking-widest uppercase hover:bg-blue-100 transition-colors"
                >
                  {product.categories?.[0]?.name || 'Hardware'}
                </Link>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-6">
                {product.name}
              </h1>

              <div className="mb-8">
                {product.promoPrice ? (
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-4xl font-black text-red-600">{parseFloat(product.promoPrice).toFixed(3)} TND</span>
                    <span className="text-xl font-bold text-slate-400 line-through decoration-2">{parseFloat(product.price).toFixed(3)} TND</span>
                    <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm shadow-red-200">
                      SAVE {(parseFloat(product.price) - parseFloat(product.promoPrice)).toFixed(3)} TND
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-black text-slate-900">{parseFloat(product.price).toFixed(3)} TND</span>
                )}
              </div>

              <div className="prose prose-slate prose-lg text-slate-600 leading-relaxed mb-8">
                <p>{product.description || 'Premium high-performance hardware designed for enthusiasts and professionals. Detailed specifications are currently unavailable.'}</p>
              </div>

              {isInStock && (
                <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Quantity</span>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 transition-colors active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"/></svg>
                    </button>
                    <span className="font-black text-slate-900 w-10 text-center text-lg">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} 
                      className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 transition-colors active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <button 
                  onClick={handleAddToCart} 
                  disabled={!isInStock} 
                  className={`py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                    isInStock 
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow} 
                  disabled={!isInStock} 
                  className={`py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                    isInStock 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Buy Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-slate-100">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2 text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Free Delivery</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Orders over 500 TND</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-2 text-emerald-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Secure Payment</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">100% Protected</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-2 text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700">1 Year Warranty</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Official Guarantee</span>
                </div>
              </div>

              {/* Specs / Meta */}
              <div className="mt-6">
                <div className="flex items-center gap-6 text-sm">
                  <div><span className="text-slate-400 mr-2">SKU:</span><span className="font-bold text-slate-800">TECH-{product.id}</span></div>
                  <div><span className="text-slate-400 mr-2">Availability:</span><span className="font-bold text-slate-800">{product.stock} Units</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-20 pt-12">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Reviews</h2>
              <p className="text-slate-500 mt-2">See what other hardware enthusiasts think about the {product.name}.</p>
            </div>

            {/* Rating Summary Card */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 shadow-sm mb-12">
              <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
                <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center justify-center text-center pb-8 md:pb-0 md:border-r md:border-slate-100 md:pr-8">
                  <div className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">
                    {averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="flex justify-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarIcon key={star} filled={star <= Math.round(averageRating || 0)} className="w-6 h-6" />
                    ))}
                  </div>
                  <div className="text-slate-500 font-medium mb-8">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </div>

                  {userEmail && !userHasReviewed ? (
                    <button
                      onClick={() => {
                        checkUserReviewStatus();
                        setShowReviewModal(true);
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95"
                    >
                      Write a Review
                    </button>
                  ) : userEmail && userHasReviewed ? (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      You reviewed this product
                    </div>
                  ) : null}
                </div>
                
                <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center space-y-4">
                  {totalReviews > 0 ? (
                    [5, 4, 3, 2, 1].map(star => {
                      const count = ratingCounts[star] || 0;
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-4 text-sm font-medium">
                          <div className="w-12 text-slate-600 flex items-center gap-1">
                            {star} <StarIcon filled={true} className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-slate-400 text-right">{percentage.toFixed(0)}%</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 py-8">
                      No ratings to display yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <p className="text-lg font-bold text-slate-900 mb-1">No reviews yet</p>
                  <p className="text-slate-500">Be the first to share your thoughts on this product!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-lg">
                            {review.customer?.firstName?.[0] || review.customer?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900">
                                {review.customer?.firstName 
                                  ? `${review.customer.firstName} ${review.customer.lastName || ''}` 
                                  : review.customer?.email?.split('@')[0] || 'Anonymous'}
                              </p>
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                Verified
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <StarIcon key={star} filled={star <= review.rating} className="w-4 h-4" />
                                ))}
                              </div>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-sm font-medium text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-16">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        product={product}
        onSuccess={handleReviewSuccess}
      />
    </main>
  );
}