'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

interface StoreFormData {
  storeName: string;
  storeType: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  description: string;
  shippingEnabled: boolean;
  acceptsReturns: boolean;
  customMessage: string;
}

const storeTypes = [
  'Clothing & Fashion',
  'Electronics & Tech',
  'Home & Garden',
  'Art & Collectibles',
  'Health & Beauty',
  'Sports & Fitness',
  'Books & Media',
  'Food & Beverages',
  'Handmade & Crafts',
  'Digital Products',
  'Services',
  'Other'
];

export default function StoreOnboarding() {
  const router = useRouter();
  const { authenticated, user, login } = usePrivy();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<StoreFormData>({
    storeName: '',
    storeType: '',
    businessEmail: '',
    businessPhone: '',
    website: '',
    description: '',
    shippingEnabled: true,
    acceptsReturns: true,
    customMessage: 'Welcome to our store! Pay securely with PYUSD.',
  });

  const updateFormData = (field: keyof StoreFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.storeName || !formData.storeType) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call - backend dev will implement real store creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to store dashboard after successful setup
      router.push('/store/dashboard');
    } catch (err) {
      setError('Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🏪</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Set Up Your Store
                </h1>
                <p className="text-gray-600">
                  Create your storefront to sell products and accept PYUSD payments
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 1 of 3</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => updateFormData('storeName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Store Name"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">This will be displayed to customers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Category *
                </label>
                <select
                  value={formData.storeType}
                  onChange={(e) => updateFormData('storeType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {storeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email *
                </label>
                <input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => updateFormData('businessEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="business@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Phone
                </label>
                <input
                  type="tel"
                  value={formData.businessPhone}
                  onChange={(e) => updateFormData('businessPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourstore.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell customers about your store..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">🚀 Your Store Will Include:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Product catalog with images and descriptions</li>
                  <li>• PYUSD payment processing</li>
                  <li>• Order management system</li>
                  <li>• Customer communication tools</li>
                  <li>• Sales analytics and reporting</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => router.push('/role')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.storeName || !formData.storeType || !formData.businessEmail}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Step 2 and 3 would continue with store-specific configuration...
  // Similar to the solo seller but focused on store features

  if (step === 2) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Store Features
              </h1>
              <p className="text-gray-600">
                Configure how your store will operate
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>  {/* Step 1 - completed */}
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>  {/* Step 2 - current */}
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>  {/* Step 3 - pending */}
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 2 of 3</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enable Shipping
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.shippingEnabled}
                    onChange={(e) => updateFormData('shippingEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">
                    Yes, I will ship products to customers
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepts Returns
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.acceptsReturns}
                    onChange={(e) => updateFormData('acceptsReturns', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">
                    Yes, I accept returns and exchanges
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message to Buyers
                </label>
                <textarea
                  value={formData.customMessage}
                  onChange={(e) => updateFormData('customMessage', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Thank you for visiting my store!"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">🛠️ Configure Your Store:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Set up shipping options and rates</li>
                  <li>• Manage return and exchange policies</li>
                  <li>• Customize your store's appearance</li>
                  <li>• Add products to your catalog</li>
                  <li>• Configure payment settings</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Finish Setup
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (step === 3) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎉</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Store Setup Complete!
                </h1>
                <p className="text-gray-600">
                  Your store is ready to start selling
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 h-2 rounded-full"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 3 of 3</p>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ What's Next?</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Share your store link with potential customers</li>
                  <li>• Start adding products to your catalog</li>
                  <li>• Configure your payment and shipping settings</li>
                  <li>• Customize your store's appearance</li>
                  <li>• Monitor your sales and customer interactions</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => router.push('/store/dashboard')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Go to My Store Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
