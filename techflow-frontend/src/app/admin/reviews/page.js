'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, ALL
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews?status=${filter}`);
      setReviews(res.data.content || res.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/reviews/${id}/approve`);
      showToast('Review approved', 'success');
      fetchReviews();
    } catch (err) {
      showToast('Failed to approve review', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/reviews/${id}/reject`);
      showToast('Review rejected', 'success');
      fetchReviews();
    } catch (err) {
      showToast('Failed to reject review', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      showToast('Review deleted', 'success');
      fetchReviews();
    } catch (err) {
      showToast('Failed to delete review', 'error');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl border flex items-center gap-3 ${
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {toast.type === 'error' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
            <span className="font-bold">{toast.message}</span>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reviews</h1>
          <p className="text-slate-500 mt-1 font-medium">Moderate customer reviews.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          {['PENDING', 'APPROVED', 'ALL'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>)
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">No {filter.toLowerCase()} reviews</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-900">
                        {review.customer?.firstName || ''} {review.customer?.lastName || ''}
                      </span>
                      <span className="text-sm text-slate-400">{review.customer?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {review.approvalStatus === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(review.id)} className="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold">Approve</button>
                        <button onClick={() => handleReject(review.id)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold">Reject</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(review.id)} className="text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg text-sm">Delete</button>
                  </div>
                </div>
                <p className="text-slate-600 mb-2">{review.comment}</p>
                <p className="text-sm text-slate-400">Product: <span className="font-medium">{review.product?.name}</span></p>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}