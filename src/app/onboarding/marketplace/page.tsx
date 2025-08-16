'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { SelectField } from '@/components/SelectField';
import { getEnabledChains, getEnabledChainTokens, DEFAULT_CHAIN_ID } from '@/lib/chains';
import { getDefaultToken, DEFAULT_TOKEN_SYMBOL } from '@/lib/token';

interface MerchantFormData {
  businessName: string;
  businessType: string;
  businessEmail: string;
  businessPhone: string;
  feeBps: number;
  chainPreference: number;
  preferredToken: string; // Add token selection
  autoRelease: boolean;
  autoReleaseHours: number;
  webhookUrl: string;
}

const businessTypes = [
  'E-commerce Store',
  'Digital Marketplace', 
  'Freelance/Consulting',
  'SaaS Platform',
  'Creator Platform',
  'NFT Marketplace',
  'Content Creator',
  'Other'
];

export default function MarketplaceOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get enabled chains and tokens
  const enabledChains = getEnabledChains();
  const defaultToken = getDefaultToken();
  
  const [formData, setFormData] = useState<MerchantFormData>({
    businessName: '',
    businessType: '',
    businessEmail: '',
    businessPhone: '',
    feeBps: 250, // 2.5% default
    chainPreference: DEFAULT_CHAIN_ID, // Arbitrum One
    preferredToken: defaultToken?.symbol || DEFAULT_TOKEN_SYMBOL, // PYUSD
    autoRelease: true,
    autoReleaseHours: 72, // 3 days
    webhookUrl: '',
  });

  const updateFormData = (field: keyof MerchantFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.businessType) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/merchant/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          userType: 'merchant'
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push('/onboarding/success?type=merchant');
      } else {
        setError(data.error || 'Failed to create merchant account');
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
                  Set Up Your Marketplace Business
                </h1>
                <p className="text-gray-600">
                  Get started with PayBoy's merchant tools and smart contract escrow
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
                label="Business Name"
                type="text"
                value={formData.businessName}
                onChange={(value: string) => updateFormData('businessName', value)}
                required
                placeholder="Enter your business name"
              />

              <SelectField
                label="Business Type"
                value={formData.businessType}
                onChange={(value) => updateFormData('businessType', value)}
                options={businessTypes.map(type => ({ value: type, label: type }))}
                required
                placeholder="Select business type"
              />

              <FormField
                label="Business Email"
                type="email"
                value={formData.businessEmail}
                onChange={(value: string) => updateFormData('businessEmail', value)}
                placeholder="business@example.com"
              />

              <FormField
                label="Business Phone"
                type="tel"
                value={formData.businessPhone}
                onChange={(value: string) => updateFormData('businessPhone', value)}
                placeholder="+1 (555) 123-4567"
              />

              {/* Show PYUSD + Arbitrum info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💰 Powered by PYUSD on Arbitrum</h3>
                <p className="text-sm text-blue-800">
                  Accept PayPal USD payments with fast, low-cost transactions on Arbitrum One. 
                  More currencies and chains coming soon!
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
                disabled={!formData.businessName || !formData.businessType}
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
    // Get available tokens for current chain
    const availableTokens = getEnabledChainTokens(formData.chainPreference);
    
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment & Currency Settings
              </h1>
              <p className="text-gray-600">
                Configure payment currencies and smart contract escrow settings
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 2 of 3</p>
            </div>

            <div className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Payment Currency
                </label>
                <div className="space-y-3">
                  {/* PYUSD Option */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.preferredToken === 'PYUSD' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateFormData('preferredToken', 'PYUSD')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          P
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">PayPal USD (PYUSD)</h3>
                          <p className="text-sm text-gray-600">Stable, regulated, and widely accepted</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          Default
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          Available Now
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* USDC Option (Coming Soon) */}
                  <div className="p-4 border-2 border-gray-200 bg-gray-50 rounded-lg opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          U
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-700">USD Coin (USDC)</h3>
                          <p className="text-sm text-gray-500">Popular stablecoin option</p>
                        </div>
                      </div>
                      <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  More stablecoins coming soon! Your marketplace will be ready for multi-currency support.
                </p>
              </div>

              {/* Platform Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Fee
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="25"
                    value={formData.feeBps}
                    onChange={(e) => updateFormData('feeBps', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-medium w-20">
                    {(formData.feeBps / 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This fee is automatically collected by the smart contract in {formData.preferredToken}
                </p>
              </div>

              {/* Blockchain Network */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blockchain Network
                </label>
                <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">Arbitrum One</h3>
                      <p className="text-sm text-blue-700">Fast, low-cost Ethereum Layer 2</p>
                    </div>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      Default
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  More networks coming soon! Your contracts will be multi-chain ready.
                </p>
              </div>

              {/* Auto-release Settings */}
              <div className="border-t pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoRelease}
                    onChange={(e) => updateFormData('autoRelease', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-medium">Auto-release escrow payments</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  Automatically release {formData.preferredToken} from escrow after delivery confirmation
                </p>
                
                {formData.autoRelease && (
                  <div className="mt-4 ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-release timer (hours)
                    </label>
                    <select
                      value={formData.autoReleaseHours}
                      onChange={(e) => updateFormData('autoReleaseHours', parseInt(e.target.value))}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={24}>24 hours</option>
                      <option value={48}>48 hours</option>
                      <option value={72}>72 hours</option>
                      <option value={168}>1 week</option>
                    </select>
                  </div>
                )}
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
                API Integration & Webhooks
              </h1>
              <p className="text-gray-600">
                Set up developer tools for your marketplace (optional)
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 3 of 3</p>
            </div>

            <div className="space-y-6">
              <FormField
                label="Webhook URL (Optional)"
                type="url"
                value={formData.webhookUrl}
                onChange={(value: string) => updateFormData('webhookUrl', value)}
                placeholder="https://yourmarketplace.com/api/webhooks/payboy"
              />

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 Your marketplace will get:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• API keys for payment integration</li>
                  <li>• Real-time webhook notifications</li>
                  <li>• Smart contract escrow protection</li>
                  <li>• {formData.preferredToken} payment processing</li>
                  <li>• Multi-chain ready infrastructure</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Summary:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Business:</strong> {formData.businessName}</p>
                  <p><strong>Type:</strong> {formData.businessType}</p>
                  <p><strong>Currency:</strong> {formData.preferredToken}</p>
                  <p><strong>Platform Fee:</strong> {(formData.feeBps / 100).toFixed(2)}%</p>
                  <p><strong>Network:</strong> Arbitrum One</p>
                  <p><strong>Auto-release:</strong> {formData.autoRelease ? `${formData.autoReleaseHours}h` : 'Manual only'}</p>
                </div>
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
                {loading ? 'Creating Marketplace...' : 'Launch Marketplace'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}