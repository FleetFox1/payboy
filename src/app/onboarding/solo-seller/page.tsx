'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { SelectField } from '@/components/SelectField';
import { DEFAULT_CHAIN_ID } from '@/lib/chains';
import { DEFAULT_TOKEN_SYMBOL } from '@/lib/token';

interface SoloSellerFormData {
  displayName: string;
  sellerType: string;
  contactEmail: string;
  contactPhone: string;
  socialHandle: string; // Instagram, Twitter, etc.
  preferredToken: string;
  enableQRCodes: boolean;
  enablePaymentLinks: boolean;
  customMessage: string; // Message for payment requests
}

const sellerTypes = [
  'Individual Creator',
  'Freelancer',
  'Artist/Designer',
  'Content Creator',
  'Consultant',
  'Service Provider',
  'Small Business Owner',
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
    socialHandle: '',
    preferredToken: DEFAULT_TOKEN_SYMBOL, // PYUSD
    enableQRCodes: true,
    enablePaymentLinks: true,
    customMessage: 'Payment for services',
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
        router.push('/onboarding/success?type=seller');
      } else {
        setError(data.error || 'Failed to create seller account');
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
                  Get QR codes and payment links to accept PYUSD payments instantly
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
                placeholder="How customers will see you"
                helpText="This will appear on your payment requests"
              />

              <SelectField
                label="Seller Type"
                value={formData.sellerType}
                onChange={(value) => updateFormData('sellerType', value)}
                options={sellerTypes.map(type => ({ value: type, label: type }))}
                required
                placeholder="What best describes you?"
              />

              <FormField
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(value: string) => updateFormData('contactEmail', value)}
                placeholder="your@email.com"
                helpText="For payment notifications and receipts"
              />

              <FormField
                label="Phone Number (Optional)"
                type="tel"
                value={formData.contactPhone}
                onChange={(value: string) => updateFormData('contactPhone', value)}
                placeholder="+1 (555) 123-4567"
              />

              <FormField
                label="Social Handle (Optional)"
                type="text"
                value={formData.socialHandle}
                onChange={(value: string) => updateFormData('socialHandle', value)}
                placeholder="@yourusername or website"
                helpText="Instagram, Twitter, or website for customers to find you"
              />

              {/* PYUSD info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💰 Accept PYUSD Payments</h3>
                <p className="text-sm text-blue-800">
                  Get paid instantly with PayPal USD. Your customers can pay from Venmo, PayPal, 
                  or any crypto wallet with PYUSD.
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
                Payment Methods
              </h1>
              <p className="text-gray-600">
                Choose how you want to accept payments from customers
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 2 of 3</p>
            </div>

            <div className="space-y-6">
              {/* Payment Method Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Collection Methods
                </label>
                
                {/* QR Codes */}
                <div className="space-y-4">
                  <label className="flex items-start p-4 border-2 border-blue-200 bg-blue-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableQRCodes}
                      onChange={(e) => updateFormData('enableQRCodes', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">📱</span>
                        <h3 className="font-medium text-blue-900">QR Code Payments</h3>
                      </div>
                      <p className="text-sm text-blue-700">
                        Generate QR codes for customers to scan and pay instantly. 
                        Perfect for in-person transactions or social media posts.
                      </p>
                    </div>
                  </label>

                  {/* Payment Links */}
                  <label className="flex items-start p-4 border-2 border-green-200 bg-green-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enablePaymentLinks}
                      onChange={(e) => updateFormData('enablePaymentLinks', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">🔗</span>
                        <h3 className="font-medium text-green-900">Payment Links</h3>
                      </div>
                      <p className="text-sm text-green-700">
                        Share payment links via text, email, or social media. 
                        Customers click and pay - no app required.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Payment Message */}
              <FormField
                label="Default Payment Message"
                type="text"
                value={formData.customMessage}
                onChange={(value: string) => updateFormData('customMessage', value)}
                placeholder="Payment for services"
                helpText="This appears on your payment requests. You can customize it for each payment."
              />

              {/* Currency Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Currency
                </label>
                <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      P
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">PayPal USD (PYUSD)</h3>
                      <p className="text-sm text-blue-700">Stable, instant, and widely supported</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  More currencies coming soon! USDC support will be added next.
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Preview:</h3>
                <div className="text-sm text-gray-700">
                  <p><strong>From:</strong> {formData.displayName || 'Your Name'}</p>
                  <p><strong>Message:</strong> {formData.customMessage}</p>
                  <p><strong>Payment Methods:</strong> 
                    {formData.enableQRCodes && formData.enablePaymentLinks ? ' QR Code, Payment Link' :
                     formData.enableQRCodes ? ' QR Code' :
                     formData.enablePaymentLinks ? ' Payment Link' : ' None selected'}
                  </p>
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
                disabled={!formData.enableQRCodes && !formData.enablePaymentLinks}
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
                You're All Set!
              </h1>
              <p className="text-gray-600">
                Review your seller profile and complete setup
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 3 of 3</p>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 You'll be able to:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  {formData.enableQRCodes && <li>• Generate QR codes for instant payments</li>}
                  {formData.enablePaymentLinks && <li>• Create shareable payment links</li>}
                  <li>• Accept PYUSD from Venmo, PayPal, and crypto wallets</li>
                  <li>• Get instant payment notifications</li>
                  <li>• Track all your payment history</li>
                  <li>• Set custom amounts and messages</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Profile Summary:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Display Name:</strong> {formData.displayName}</p>
                  <p><strong>Type:</strong> {formData.sellerType}</p>
                  <p><strong>Contact:</strong> {formData.contactEmail}</p>
                  {formData.socialHandle && <p><strong>Social:</strong> {formData.socialHandle}</p>}
                  <p><strong>Currency:</strong> PYUSD</p>
                  <p><strong>Payment Methods:</strong> 
                    {formData.enableQRCodes && formData.enablePaymentLinks ? ' QR Code + Payment Links' :
                     formData.enableQRCodes ? ' QR Code' : ' Payment Links'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your QR code on social media for easy payments</li>
                  <li>• Use payment links in your email signature</li>
                  <li>• Customize payment messages for different services</li>
                  <li>• All payments are secured on Arbitrum blockchain</li>
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
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}