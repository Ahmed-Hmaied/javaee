'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import api from '@/lib/api';

// Helper to extract array from various backend responses
const extractCategoriesArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.content && Array.isArray(data.content)) return data.content;
  if (data.categories && Array.isArray(data.categories)) return data.categories;
  return [];
};

// Recursive category tree item component
const CategoryTreeItem = ({ category, selectedIds, onToggle, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.subCategories && category.subCategories.length > 0;
  const isSelected = selectedIds.includes(category.id);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-slate-100 transition-colors ${
          level > 0 ? 'ml-6' : ''
        }`}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        )}
        
        <input
          type="checkbox"
          id={`cat-${category.id}`}
          checked={isSelected}
          onChange={() => onToggle(category.id)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        
        <label 
          htmlFor={`cat-${category.id}`}
          className={`text-sm font-medium cursor-pointer flex-1 ${
            isSelected ? 'text-blue-600' : 'text-slate-700'
          }`}
        >
          {category.name}
        </label>
        
        {hasChildren && (
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {category.subCategories.length}
          </span>
        )}
      </div>
      
      {hasChildren && expanded && (
        <div className="border-l-2 border-slate-200 ml-3">
          {category.subCategories.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProductForm({ initialData = {}, onSubmit, onCancel, submitLabel = 'Save', isAdmin = false }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    stock: '',
    active: true,
    categoryIds: [],
    sellerEmail: '',
    imageUrl: '',
    imageUrls: [],
  });
  
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [initialDataProcessed, setInitialDataProcessed] = useState(false);

  // Build a flat map of all categories (id -> category) and name -> id mapping
  const { categoryMap, categoryNameToIdMap } = useMemo(() => {
    const map = new Map();
    const nameMap = new Map();
    const flatten = (cats) => {
      cats.forEach(cat => {
        map.set(cat.id, cat);
        nameMap.set(cat.name.toLowerCase().trim(), cat.id);
        if (cat.subCategories) flatten(cat.subCategories);
      });
    };
    flatten(categories);
    return { categoryMap: map, categoryNameToIdMap: nameMap };
  }, [categories]);

  // Fetch categories and sellers on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      if (isAdmin) {
        await fetchSellers();
      }
    };
    loadData();
  }, [isAdmin]);

  // Once categories are loaded, process initialData if it hasn't been processed yet
  useEffect(() => {
    if (categoriesLoaded && !initialDataProcessed && initialData && Object.keys(initialData).length > 0) {
      console.log('🔍 Processing initialData with categories loaded:', initialData);
      
      let catIds = [];
      
      // First, try to get valid IDs from initialData.categoryIds
      if (Array.isArray(initialData.categoryIds)) {
        const validIds = initialData.categoryIds.filter(id => id != null && !isNaN(id) && Number.isInteger(Number(id)));
        if (validIds.length > 0) {
          catIds = validIds.map(id => Number(id));
          console.log('✅ Using provided categoryIds:', catIds);
        }
      }
      
      // Fallback: map from category names if no valid IDs
      if (catIds.length === 0 && Array.isArray(initialData.categories) && initialData.categories.length > 0) {
        console.log('⚠️ No valid categoryIds, mapping from categories names:', initialData.categories);
        catIds = initialData.categories
          .map(name => {
            const id = categoryNameToIdMap.get(name.trim().toLowerCase());
            if (!id) console.warn(`Could not find category ID for name: "${name}"`);
            return id;
          })
          .filter(id => id != null);
        console.log('✅ Mapped category IDs:', catIds);
      }
      
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        promoPrice: initialData.promoPrice || '',
        stock: initialData.stock || '',
        active: initialData.active !== undefined ? initialData.active : true,
        categoryIds: catIds,
        sellerEmail: initialData.sellerEmail || '',
        imageUrl: initialData.imageUrl || '',
        imageUrls: initialData.imageUrls || [],
      });
      
      setInitialDataProcessed(true);
    }
  }, [categoriesLoaded, initialData, initialDataProcessed, categoryNameToIdMap]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats = extractCategoriesArray(res.data);
      setCategories(cats);
      setCategoriesLoaded(true);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setCategories([]);
      setCategoriesLoaded(true); // Still mark as loaded to avoid hanging
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await api.get('/users/sellers');
      const sellersArray = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setSellers(sellersArray);
    } catch (err) {
      console.error('Failed to fetch sellers', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Category toggle
  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const current = prev.categoryIds || [];
      let newIds;
      
      if (current.includes(categoryId)) {
        newIds = current.filter(id => id !== categoryId);
      } else {
        newIds = [...current, categoryId];
        // Optional: auto-select parent categories (if parent info available)
        let parentId = categoryMap.get(categoryId)?.parent?.id;
        while (parentId) {
          if (!newIds.includes(parentId)) {
            newIds.push(parentId);
          }
          parentId = categoryMap.get(parentId)?.parent?.id;
        }
      }
      
      return { ...prev, categoryIds: newIds };
    });
  };

  // --- Multi-image handlers ---
  const handleMainImageChange = (e) => {
    setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newUrls }));
  };

  const addImageUrlField = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const removeImageUrlField = (index) => {
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, imageUrls: newUrls }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        promoPrice: formData.promoPrice && formData.promoPrice !== '' ? parseFloat(formData.promoPrice) : null,
        stock: parseInt(formData.stock) || 0,
        active: formData.active,
        categoryIds: formData.categoryIds,
        imageUrl: formData.imageUrl || '',
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
      };
      console.log('Submitting payload:', payload);
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <h4 className="text-red-800 font-bold mb-1">Submission Error</h4>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Product Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. RTX 4090 Graphics Card"
            required
            className={inputStyles}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the product details..."
            rows="4"
            className={`${inputStyles} resize-none`}
          />
        </div>

        {/* Main Image URL */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Main Image URL</label>
          <input
            type="text"
            value={formData.imageUrl || ''}
            onChange={handleMainImageChange}
            placeholder="https://example.com/main-image.jpg"
            className={inputStyles}
          />
          {formData.imageUrl && (
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-2">Preview:</p>
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="h-24 w-24 object-cover rounded-lg border border-slate-200"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>

        {/* Additional Images */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-wide">Additional Images</label>
            <button
              type="button"
              onClick={addImageUrlField}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
            >
              + Add Image
            </button>
          </div>
          {formData.imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder={`Image URL #${index + 1}`}
                  className={inputStyles}
                />
                {url && (
                  <div className="mt-2">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImageUrlField(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          ))}
          {formData.imageUrls.length === 0 && (
            <p className="text-sm text-slate-400 italic">No additional images added.</p>
          )}
        </div>

        {/* Seller Dropdown (Admin only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Seller <span className="text-red-500">*</span></label>
            <select
              name="sellerEmail"
              value={formData.sellerEmail}
              onChange={handleChange}
              required
              className={inputStyles}
            >
              <option value="">Select a seller</option>
              {sellers.map(seller => (
                <option key={seller.id} value={seller.email}>{seller.email}</option>
              ))}
            </select>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Regular Price (TND) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">TND</span>
              <input
                type="number"
                step="0.001"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.000"
                required
                className={`${inputStyles} pl-14`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Promo Price (Optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">TND</span>
              <input
                type="number"
                step="0.001"
                name="promoPrice"
                value={formData.promoPrice || ''}
                onChange={handleChange}
                placeholder="0.000"
                className={`${inputStyles} pl-14`}
              />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Inventory Stock <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            required
            className={inputStyles}
          />
        </div>

        {/* Categories Tree */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wide">Categories</label>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-80 overflow-y-auto">
            {!categoriesLoaded ? (
              <p className="text-sm text-slate-400 font-medium text-center py-4">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium text-center py-4">No categories available.</p>
            ) : (
              <div className="space-y-1">
                {categories.map(category => (
                  <CategoryTreeItem
                    key={category.id}
                    category={category}
                    selectedIds={formData.categoryIds || []}
                    onToggle={handleCategoryToggle}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Selected: {formData.categoryIds?.length || 0} categories
          </p>
        </div>

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div>
            <h4 className="text-slate-900 font-black tracking-tight">Product Visibility</h4>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Allow customers to see and purchase this product.</p>
          </div>
          <button
            type="button"
            role="switch"
            onClick={() => handleChange({ target: { name: 'active', type: 'checkbox', checked: !formData.active } })}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
              formData.active ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                formData.active ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}