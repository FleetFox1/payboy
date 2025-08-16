'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
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
  desiredENSName: string;
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
  const { user } = usePrivy();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ensAvailable, setEnsAvailable] = useState<boolean | null>(null);
  const [checkingENS, setCheckingENS] = useState(false);
  
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
    desiredENSName: '',
  });

  // Generate ENS name suggestion from store name
  const generateENSName = (storeName: string): string => {
    return storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces for ENS
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      + '.eth'; // Use standard .eth domain
  };

  const updateFormData = (field: keyof StoreFormData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    
    // Auto-generate ENS name when store name changes
    if (field === 'storeName' && typeof value === 'string') {
      newData.desiredENSName = generateENSName(value);
    }
    
    setFormData(newData);
  };

  // Check ENS availability (placeholder - implement when ENS API is ready)
  const checkENSAvailability = async (ensName: string) => {
    if (!ensName) return;
    
    setCheckingENS(true);
    try {
      // TODO: Implement actual ENS availability check
      // For now, simulate the check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEnsAvailable(Math.random() > 0.5); // Random for demo
    } catch (error) {
      console.error('ENS check failed:', error);
      setEnsAvailable(null);
    } finally {
      setCheckingENS(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.storeName || !formData.storeType || !formData.storeAddress) {
      setError('Please fill in required fields');
      return;
    }

    if (!user?.wallet?.address) {
      setError('Please connect your wallet to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/store/create', { // ✅ Fixed API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName: formData.storeName,
          storeType: formData.storeType,
          storeEmail: formData.storeEmail,
          storePhone: formData.storePhone,
          storeAddress: formData.storeAddress,
          category: formData.category,
          description: formData.description,
          website: formData.website,
          qrCodeSize: formData.qrCodeSize,
          printingEnabled: formData.printingEnabled,
          notificationEmail: formData.notificationEmail,
          desiredENSName: formData.desiredENSName,
          userType: 'store_owner', // ✅ Correct user type
          walletAddress: user.wallet.address
        })
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Store store data for dashboard
        localStorage.setItem('storeData', JSON.stringify(data.store));
        localStorage.setItem('userType', 'store_owner'); // ✅ Set user type
        localStorage.setItem('storeENS', formData.desiredENSName);
        
        // ✅ Redirect to store dashboard
        router.push('/dashboard/store');
      } else {
        setError(data.error || 'Failed to create store account');
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
                  Accept PYUSD payments with QR codes and professional store identity
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
                helpText="This will appear on customer receipts and QR codes"
              />

              {/* ENS Setup Section */}
              {formData.storeName && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">🌐 Your Store ENS Identity</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-purple-800 mb-1">
                        Suggested ENS Name
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={formData.desiredENSName}
                          onChange={(e) => updateFormData('desiredENSName', e.target.value)}
                          className="flex-1 px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="yourstore.eth"
                        />
                        <button
                          type="button"
                          onClick={() => checkENSAvailability(formData.desiredENSName)}
                          disabled={checkingENS}
                          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
                        >
                          {checkingENS ? '...' : 'Check'}
                        </button>
                      </div>
                      
                      {ensAvailable === true && (
                        <p className="text-sm text-green-600 mt-1">✅ Available for registration!</p>
                      )}
                      {ensAvailable === false && (
                        <p className="text-sm text-red-600 mt-1">❌ Not available. Try a different name.</p>
                      )}
                    </div>
                    
                    <div className="bg-purple-100 p-3 rounded">
                      <h5 className="font-medium text-purple-900 mb-1">ENS Benefits for Your Store:</h5>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Customers pay to <strong>{formData.desiredENSName}</strong> instead of long wallet address</li>
                        <li>• Professional identity for your business</li>
                        <li>• Easy to remember and share</li>
                        <li>• Works across all crypto wallets</li>
                      </ul>
                    </div>
                    
                    <a 
                      href="https://app.ens.domains" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-purple-700 underline hover:text-purple-900"
                    >
                      Register ENS Domain After Setup →
                    </a>
                  </div>
                </div>
              )}

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
                helpText="For payment notifications and customer communications"
              />

              <FormField
                label="Store Phone"
                type="tel"
                value={formData.storePhone}
                onChange={(value: string) => updateFormData('storePhone', value)}
                placeholder="+1 (555) 123-4567"
                helpText="Displayed on payment receipts for customer support"
              />

              {/* PYUSD + QR Code Benefits */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">💰 PYUSD + QR Code Payments</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• Generate instant QR codes for any amount</p>
                  <p>• Customers pay with Venmo, PayPal, or crypto wallets</p>
                  <p>• Fast, secure transactions on Arbitrum network</p>
                  <p>• Automatic payment confirmation and receipts</p>
                </div>
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
                Store Location & Details
              </h1>
              <p className="text-gray-600">
                Help customers find your store and understand what you offer
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
                helpText="Full address where customers can find your store"
              />

              <SelectField
                label="Business Category"
                value={formData.category}
                onChange={(value) => updateFormData('category', value)}
                options={categories.map(cat => ({ value: cat, label: cat }))}
                required
                placeholder="Select primary category"
              />

              <FormField
                label="Store Description"
                type="textarea"
                value={formData.description}
                onChange={(value: string) => updateFormData('description', value)}
                placeholder="Describe your store, products, and services..."
                helpText="This helps customers understand what you offer"
              />

              <FormField
                label="Website (Optional)"
                type="url"
                value={formData.website}
                onChange={(value: string) => updateFormData('website', value)}
                placeholder="https://yourstore.com"
                helpText="Your store's website or social media page"
              />

              {/* QR Code Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">📱 QR Code Preview</h3>
                <div className="text-sm text-blue-800">
                  <p className="mb-2">Your QR codes will display:</p>
                  <div className="bg-white p-3 border border-blue-200 rounded">
                    <p><strong>Pay:</strong> {formData.storeName || 'Your Store'}</p>
                    <p><strong>Address:</strong> {formData.storeAddress || 'Store Address'}</p>
                    <p><strong>ENS:</strong> {formData.desiredENSName || 'yourstore.eth'}</p>
                    <p><strong>Currency:</strong> PYUSD</p>
                  </div>
                </div>
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
                QR Code Settings & Launch
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
                helpText="Size for printed QR codes at your store"
              />

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.printingEnabled}
                    onChange={(e) => updateFormData('printingEnabled', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-medium">Enable high-resolution QR codes for printing</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  Generate print-ready QR codes with your store branding and ENS name
                </p>
              </div>

              <FormField
                label="Notification Email (Optional)"
                type="email"
                value={formData.notificationEmail}
                onChange={(value: string) => updateFormData('notificationEmail', value)}
                placeholder="notifications@yourstore.com"
                helpText="Receive instant notifications for all payments (uses store email if empty)"
              />

              {/* Store Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Store Summary:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Name:</strong> {formData.storeName}</p>
                  <p><strong>Type:</strong> {formData.storeType}</p>
                  <p><strong>Category:</strong> {formData.category}</p>
                  <p><strong>Address:</strong> {formData.storeAddress}</p>
                  <p><strong>ENS Name:</strong> {formData.desiredENSName}</p>
                  <p><strong>Currency:</strong> PYUSD on Arbitrum</p>
                  <p><strong>QR Size:</strong> {formData.qrCodeSize}</p>
                  {formData.website && <p><strong>Website:</strong> {formData.website}</p>}
                </div>
              </div>

              {/* Launch Benefits */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 Your store will include:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Instant QR code generator for any payment amount</li>
                  <li>• Accept PYUSD from Venmo, PayPal, and crypto wallets</li>
                  <li>• Real-time payment notifications and confirmations</li>
                  <li>• Customer receipt generation with store details</li>
                  <li>• Transaction history and sales analytics dashboard</li>
                  <li>• Print-ready QR codes with your ENS branding</li>
                  <li>• Secure escrow protection for all transactions</li>
                </ul>
              </div>

              {/* ENS Reminder */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">🌐 Don't Forget Your ENS!</h3>
                <p className="text-sm text-purple-800 mb-2">
                  After setup, register <strong>{formData.desiredENSName}</strong> to complete your professional store identity.
                </p>
                <a 
                  href="https://app.ens.domains" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-purple-700 underline hover:text-purple-900"
                >
                  Register ENS Domain →
                </a>
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