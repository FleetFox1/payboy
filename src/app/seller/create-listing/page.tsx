'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function CreateListingPage() {
  const { user, getAccessToken } = usePrivy();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    images: [] as string[],
    paymentMethods: {
      pyusd: true,
      paypal: true,
      venmo: true,
      email: true
    }
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Books',
    'Sports',
    'Health & Beauty',
    'Toys & Games',
    'Automotive',
    'Art & Crafts',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Creating listing...');

      // Get auth token
      let token = null;
      try {
        token = await getAccessToken();
        console.log('✅ Got auth token');
      } catch (tokenError) {
        console.warn('⚠️ Could not get auth token, proceeding without');
      }

      const requestData = {
        ...formData,
        sellerId: user?.id,
        price: parseFloat(formData.price)
      };

      console.log('📦 Sending listing data:', {
        title: requestData.title,
        price: requestData.price,
        category: requestData.category,
        sellerId: requestData.sellerId
      });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/listing/create', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });

      console.log('📡 API response status:', response.status);

      const result = await response.json();
      console.log('📄 API response:', result);
      
      if (result.success) {
        console.log('✅ Listing created successfully!');
        console.log('🎯 Redirecting to dashboard...');
        router.push('/dashboard/solo-seller');
      } else {
        console.error('❌ API error:', result.error);
        setError(result.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('💥 Error creating listing:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create New Listing
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What are you selling?"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your product..."
                rows={4}
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Accepted Payment Methods
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries({
                  pyusd: 'PYUSD',
                  paypal: 'PayPal', 
                  venmo: 'Venmo',
                  email: 'Email Request'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods[key as keyof typeof formData.paymentMethods]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        paymentMethods: {
                          ...prev.paymentMethods,
                          [key]: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Upload (Placeholder) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-2">📷</div>
                <p className="text-sm text-gray-500">Image upload coming soon</p>
                <p className="text-xs text-gray-400">For now, add image URLs in the description</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/solo-seller')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : '🚀 Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}