'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CategoryForm({ initialData = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: null,   // stores { id: number } or null
    ...initialData
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      // Flatten tree for dropdown, exclude self to prevent cycles
      const flatten = (cats, prefix = '') => {
        let result = [];
        for (const cat of cats) {
          if (cat.id === initialData.id) continue;
          result.push({ id: cat.id, name: prefix + cat.name });
          if (cat.subCategories) {
            result.push(...flatten(cat.subCategories, prefix + '— '));
          }
        }
        return result;
      };
      setCategories(flatten(res.data));
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'parentId') {
      setFormData(prev => ({
        ...prev,
        parent: value ? { id: parseInt(value) } : null
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 font-medium">{error}</div>
      )}

      <div>
        <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Graphics Cards"
          required
          className={inputStyles}
        />
      </div>

      <div>
        <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description..."
          rows="3"
          className={`${inputStyles} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Parent Category</label>
        <select
          name="parentId"
          value={formData.parent?.id || ''}
          onChange={handleChange}
          className={inputStyles}
        >
          <option value="">None (Top Level)</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Leave empty for a top-level category.</p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}