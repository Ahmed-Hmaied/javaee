'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'addresses', 'orders'
  const [userEmail, setUserEmail] = useState('');

  // Profile form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'Tunisia',
    isPrimary: false,
  });

  // Recent orders state
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);
    fetchUserData(email);
  }, []);

  const fetchUserData = async (email) => {
    try {
      const res = await api.get(`/users/me?email=${email}`);
      setUser(res.data);
      setFormData({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        email: res.data.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Failed to fetch user', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get(`/addresses?email=${userEmail}`);
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchRecentOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get(`/orders/my?email=${userEmail}`);
      setRecentOrders(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'addresses' && addresses.length === 0) {
      fetchAddresses();
    }
    if (tab === 'orders' && recentOrders.length === 0) {
      fetchRecentOrders();
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };
      if (formData.newPassword) {
        payload.password = formData.newPassword;
        payload.currentPassword = formData.currentPassword;
      }

      await api.put(`/users/${user.id}`, payload);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}?email=${userEmail}`, addressForm);
      } else {
        await api.post(`/addresses?email=${userEmail}`, addressForm);
      }
      await fetchAddresses();
      resetAddressForm();
      setMessage({ type: 'success', text: `Address ${editingAddress ? 'updated' : 'added'} successfully.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save address.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}?email=${userEmail}`);
      await fetchAddresses();
      setMessage({ type: 'success', text: 'Address deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete address.' });
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await api.put(`/addresses/${id}/primary?email=${userEmail}`);
      await fetchAddresses();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to set primary address.' });
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      street: '',
      city: '',
      postalCode: '',
      country: 'Tunisia',
      isPrimary: false,
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const editAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country,
      isPrimary: addr.primary,
    });
    setShowAddressForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    // Note: Adjusted pt-24 down to pt-8/md:pt-12 to fix the gap issue
    <main className="min-h-screen bg-slate-50 pt-8 md:pt-12 pb-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your profile, delivery addresses, and track your recent orders.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Navigation Sidebar */}
          <aside className="md:w-64 shrink-0">
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 sticky top-24">
              <button
                onClick={() => handleTabChange('profile')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'profile' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white md:bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200 md:border-transparent'
                }`}
              >
                <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Personal Profile
              </button>
              <button
                onClick={() => handleTabChange('addresses')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'addresses' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white md:bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200 md:border-transparent'
                }`}
              >
                <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Saved Addresses
              </button>
              <button
                onClick={() => handleTabChange('orders')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'orders' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white md:bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200 md:border-transparent'
                }`}
              >
                <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                Recent Orders
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            
            {/* Global Message Toast */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                )}
                {message.text}
              </div>
            )}

            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <form onSubmit={handleProfileSubmit}>
                  
                  {/* Basic Info Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                      <h3 className="font-bold text-slate-900">Personal Information</h3>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                      <h3 className="font-bold text-slate-900">Security & Password</h3>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleProfileChange}
                          placeholder="Leave blank to keep current"
                          className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md shadow-slate-900/10 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving Changes...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- ADDRESSES TAB --- */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {!showAddressForm ? (
                  <>
                    {loadingAddresses ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div key={addr.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            {addr.primary && (
                              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                                Primary
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${addr.primary ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 line-clamp-1">{addr.street}</p>
                                  <p className="text-sm text-slate-500">{addr.city}, {addr.postalCode}</p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-500 font-medium pl-13">{addr.country}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                              {!addr.primary ? (
                                <button
                                  onClick={() => handleSetPrimary(addr.id)}
                                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                                >
                                  Set as Primary
                                </button>
                              ) : <div></div>}
                              <div className="flex gap-4">
                                <button onClick={() => editAddress(addr)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add New Button Card */}
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="h-full min-h-[160px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                        >
                          <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-3 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                          </div>
                          <span className="font-bold">Add New Address</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                      <button onClick={resetAddressForm} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <form onSubmit={handleAddressSubmit} className="p-6 md:p-8 space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Street Address</label>
                        <input
                          type="text"
                          name="street"
                          value={addressForm.street}
                          onChange={handleAddressFormChange}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressFormChange}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Postal Code</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={addressForm.postalCode}
                            onChange={handleAddressFormChange}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={addressForm.country}
                          onChange={handleAddressFormChange}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                      
                      <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              name="isPrimary"
                              checked={addressForm.isPrimary}
                              onChange={handleAddressFormChange}
                              className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                            />
                            <svg className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Set as my default primary address</span>
                        </label>
                      </div>

                      <div className="flex gap-3 pt-6 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
                        >
                          {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                        </button>
                        <button
                          type="button"
                          onClick={resetAddressForm}
                          className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>)}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">No orders yet</h3>
                    <p className="text-slate-500 font-medium">When you place an order, it will show up here.</p>
                  </div>
                ) : (
                  <>
                    {recentOrders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                          </div>
                          <div>
                            <p className="font-black text-slate-900">Order #{order.orderNumber}</p>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                            <p className="font-black text-slate-900">{order.totalTTC} <span className="text-xs text-slate-500 uppercase">TND</span></p>
                          </div>
                          
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ${
                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 
                            'bg-blue-50 text-blue-700 ring-blue-600/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 flex justify-center">
                      <Link
                        href="/orders"
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold transition-colors"
                      >
                        View All Order History
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}