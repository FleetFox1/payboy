'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { SelectField } from '@/components/SelectField';

interface SoloSellerFormData {
  displayName: string;
  sellerType: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  businessDescription: string;
  websiteUrl: string;
  socialMedia: string;
  acceptsReturns: boolean;
  shippingAvailable: boolean;
  customMessage: string;
}

const sellerTypes = [
  'Individual Seller',
  'Freelancer',
  'Artist/Creator',
  'Small Business Owner',
  'Crafter/Maker',
  'Reseller',
  'Service Provider',
  'Digital Creator',
  'Other'
];

export default function SoloSellerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<SoloSellerFormData>({
    displayName: '',
    sellerType: '',
    contactEmail: '',
    contactPhone: '',
    location: '',
    businessDescription: '',
    websiteUrl: '',
    socialMedia: '',
    acceptsReturns: false,
    shippingAvailable: true,
    customMessage: 'Thanks for choosing to buy from me! Pay securely with PYUSD.',
  });

  const updateFormData = (field: keyof SoloSellerFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.displayName || !formData.sellerType) {
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
          router.push('/onboarding/solo-seller/success');
          return;
        } else {
          setError(data.error || 'Failed to create seller account');
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
                <div className="text-4xl mb-3">👤</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Set Up Your Solo Seller Profile
                </h1>
                <p className="text-gray-600">
                  Start selling individual items and accept PYUSD payments
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
                label="Display Name"
                type="text"
                value={formData.displayName}
                onChange={(value: string) => updateFormData('displayName', value)}
                required
                placeholder="How you want to be known to buyers"
              />

              <SelectField
                label="Seller Type"
                value={formData.sellerType}
                onChange={(value) => updateFormData('sellerType', value)}
                options={sellerTypes.map(type => ({ value: type, label: type }))}
                required
                placeholder="Select seller type"
              />

              <FormField
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(value: string) => updateFormData('contactEmail', value)}
                placeholder="your@email.com"
              />

              <FormField
                label="Contact Phone"
                type="tel"
                value={formData.contactPhone}
                onChange={(value: string) => updateFormData('contactPhone', value)}
                placeholder="+1 (555) 123-4567"
              />

              <FormField
                label="Location"
                type="text"
                value={formData.location}
                onChange={(value: string) => updateFormData('location', value)}
                placeholder="City, State or General Area"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💰 Solo Seller Benefits</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• List individual items quickly</li>
                  <li>• Accept PYUSD payments instantly</li>
                  <li>• No monthly fees or subscription costs</li>
                  <li>• Simple payment links for any item</li>
                  <li>• Built-in buyer protection</li>
                </ul>
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
                disabled={!formData.displayName || !formData.sellerType}
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
                Business Details & Preferences
              </h1>
              <p className="text-gray-600">
                Tell buyers about yourself and set your selling preferences
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 2 of 3</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Your Business
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => updateFormData('businessDescription', e.target.value)}
                  placeholder="Tell buyers what you sell and what makes you unique..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <FormField
                label="Website/Portfolio (Optional)"
                type="url"
                value={formData.websiteUrl}
                onChange={(value: string) => updateFormData('websiteUrl', value)}
                placeholder="https://yourwebsite.com"
              />

              <FormField
                label="Social Media (Optional)"
                type="text"
                value={formData.socialMedia}
                onChange={(value: string) => updateFormData('socialMedia', value)}
                placeholder="@yourusername or profile link"
              />

              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.shippingAvailable}
                      onChange={(e) => updateFormData('shippingAvailable', e.target.checked)}
                      className="mr-3"
                    />
                    <span className="font-medium">I can ship physical items</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">
                    Check this if you sell physical products and can ship them
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.acceptsReturns}
                      onChange={(e) => updateFormData('acceptsReturns', e.target.checked)}
                      className="mr-3"
                    />
                    <span className="font-medium">I accept returns</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">
                    Accepting returns can increase buyer confidence
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎯 Selling Tips</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Use clear, high-quality photos</li>
                  <li>• Write detailed item descriptions</li>
                  <li>• Respond quickly to buyer questions</li>
                  <li>• Set fair and competitive prices</li>
                  <li>• Build trust with honest reviews</li>
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
                Final Setup & Launch
              </h1>
              <p className="text-gray-600">
                Customize your buyer experience and start selling
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message for Buyers
                </label>
                <textarea
                  value={formData.customMessage}
                  onChange={(e) => updateFormData('customMessage', e.target.value)}
                  placeholder="Message that appears on your payment pages..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This message will appear on your payment pages to buyers
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 You're ready to start selling!</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Create listings for items you want to sell</li>
                  <li>• Generate payment links instantly</li>
                  <li>• Accept PYUSD payments on Arbitrum</li>
                  <li>• Track your sales and earnings</li>
                  <li>• Communicate with buyers securely</li>
                  {formData.shippingAvailable && <li>• Manage shipping and tracking</li>}
                  {formData.acceptsReturns && <li>• Handle returns and refunds</li>}
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Profile Summary:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Display Name:</strong> {formData.displayName}</p>
                  <p><strong>Seller Type:</strong> {formData.sellerType}</p>
                  <p><strong>Location:</strong> {formData.location || 'Not specified'}</p>
                  <p><strong>Shipping:</strong> {formData.shippingAvailable ? 'Available' : 'Digital/Local only'}</p>
                  <p><strong>Returns:</strong> {formData.acceptsReturns ? 'Accepted' : 'Not accepted'}</p>
                  {formData.websiteUrl && <p><strong>Website:</strong> {formData.websiteUrl}</p>}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💰 Payment Processing</h3>
                <p className="text-sm text-blue-800">
                  All payments will be processed using PYUSD on Arbitrum One network. 
                  Fast, secure, and low-cost transactions for you and your buyers.
                </p>
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
                {loading ? 'Setting Up Profile...' : '🚀 Start Selling'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}