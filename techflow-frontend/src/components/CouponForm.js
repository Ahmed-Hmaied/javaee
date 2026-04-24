'use client';
import { useState } from 'react';

export default function CouponForm({ initialData = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENT',
    value: '',
    maxUses: '',
    expirationDate: '',
    active: true,
    ...initialData
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        expirationDate: formData.expirationDate || null
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-black text-slate-700 mb-2 uppercase">Code <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="e.g. SAVE20"
          required
          className={inputStyles}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase">Type</label>
          <select name="type" value={formData.type} onChange={handleChange} className={inputStyles}>
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (TND)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase">Value <span className="text-red-500">*</span></label>
          <input
            type="number"
            step="0.01"
            name="value"
            value={formData.value}
            onChange={handleChange}
            placeholder={formData.type === 'PERCENT' ? '20' : '10.000'}
            required
            className={inputStyles}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase">Max Uses</label>
          <input
            type="number"
            name="maxUses"
            value={formData.maxUses || ''}
            onChange={handleChange}
            placeholder="Unlimited"
            className={inputStyles}
          />
        </div>
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase">Expiration Date</label>
          <input
            type="date"
            name="expirationDate"
            value={formData.expirationDate || ''}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="rounded border-slate-300 text-blue-600"
          />
          <span className="text-sm font-bold text-slate-700">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}