'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { SelectField } from '@/components/SelectField';

interface StoreFormData {
  storeName: string;
  storeType: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  category: string;
  description: string;
  website: string;
  qrCodeSize: string;
  printingEnabled: boolean;
  notificationEmail: string;
}

const storeTypes = [
  'Retail Store',
  'Restaurant/Food Service',
  'Gas Station',
  'Convenience Store',
  'Pharmacy',
  'Grocery Store',
  'Electronics Store',
  'Clothing Store',
  'Coffee Shop',
  'Other'
];

const categories = [
  'Food & Dining',
  'Retail & Shopping',
  'Automotive',
  'Health & Wellness',
  'Entertainment',
  'Services',
  'Beauty & Personal Care',
  'Other'
];

const qrCodeSizes = [
  'Small (2x2 inches)',
  'Medium (4x4 inches)',
  'Large (6x6 inches)',
  'Extra Large (8x8 inches)'
];

export default function StoreOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<StoreFormData>({
    storeName: '',
    storeType: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    category: '',
    description: '',
    website: '',
    qrCodeSize: 'Medium (4x4 inches)',
    printingEnabled: true,
    notificationEmail: '',
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
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const response = await fetch('/api/seller/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            userType: 'seller'
          })
        });

        const data = await response.json();

        if (data.success) {
          router.push('/onboarding/store/success');
          return;
        } else {
          setError(data.error || 'Failed to create store account');
          return;
        }
      } else {
        setError('Please login to continue');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
                  Set Up Your Physical Store
                </h1>
                <p className="text-gray-600">
                  Start accepting PYUSD payments at your location with QR codes
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
              <FormField
                label="Store Name"
                type="text"
                value={formData.storeName}
                onChange={(value: string) => updateFormData('storeName', value)}
                required
                placeholder="Enter your store name"
              />

              <SelectField
                label="Store Type"
                value={formData.storeType}
                onChange={(value) => updateFormData('storeType', value)}
                options={storeTypes.map(type => ({ value: type, label: type }))}
                required
                placeholder="Select store type"
              />

              <FormField
                label="Store Email"
                type="email"
                value={formData.storeEmail}
                onChange={(value: string) => updateFormData('storeEmail', value)}
                placeholder="store@example.com"
              />

              <FormField
                label="Store Phone"
                type="tel"
                value={formData.storePhone}
                onChange={(value: string) => updateFormData('storePhone', value)}
                placeholder="+1 (555) 123-4567"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💰 Powered by PYUSD on Arbitrum</h3>
                <p className="text-sm text-blue-800">
                  Generate QR codes for instant PayPal USD payments. Fast, secure, and low-cost transactions on Arbitrum One.
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => router.push('/onboarding/type')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.storeName || !formData.storeType}
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

  if (step === 2) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Store Details & Location
              </h1>
              <p className="text-gray-600">
                Help customers find your store and set up payment preferences
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 2 of 3</p>
            </div>

            <div className="space-y-6">
              <FormField
                label="Store Address"
                type="text"
                value={formData.storeAddress}
                onChange={(value: string) => updateFormData('storeAddress', value)}
                required
                placeholder="123 Main St, City, State 12345"
              />

              <SelectField
                label="Business Category"
                value={formData.category}
                onChange={(value) => updateFormData('category', value)}
                options={categories.map(cat => ({ value: cat, label: cat }))}
                required
                placeholder="Select category"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Brief description of your store and what you sell..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <FormField
                label="Website (Optional)"
                type="url"
                value={formData.website}
                onChange={(value: string) => updateFormData('website', value)}
                placeholder="https://yourstore.com"
              />
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
                disabled={!formData.storeAddress || !formData.category}
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

  if (step === 3) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                QR Code Setup & Launch
              </h1>
              <p className="text-gray-600">
                Configure your payment QR codes and launch your store
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 3 of 3</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <SelectField
                label="Default QR Code Size"
                value={formData.qrCodeSize}
                onChange={(value) => updateFormData('qrCodeSize', value)}
                options={qrCodeSizes.map(size => ({ value: size, label: size }))}
                placeholder="Select QR code size"
              />

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.printingEnabled}
                    onChange={(e) => updateFormData('printingEnabled', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-medium">Enable print-ready QR codes</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  Generate high-resolution QR codes with your store branding for printing
                </p>
              </div>

              <FormField
                label="Notification Email (Optional)"
                type="email"
                value={formData.notificationEmail}
                onChange={(value: string) => updateFormData('notificationEmail', value)}
                placeholder="notifications@yourstore.com"
              />

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 Your store will include:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Custom QR code generator dashboard</li>
                  <li>• PYUSD payment processing on Arbitrum</li>
                  <li>• Real-time payment notifications</li>
                  <li>• Transaction history & reporting</li>
                  <li>• Customer payment receipts</li>
                  <li>• Print-ready QR codes with branding</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 transition"
              >
                {loading ? 'Setting Up Store...' : '🚀 Launch Store'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}