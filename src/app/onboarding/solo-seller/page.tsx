'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth'; // ✅ Added Privy import
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
  description: string;
  website: string;
  preferredToken: string;
  enableQRCodes: boolean;
  enablePaymentLinks: boolean;
  enableInvoices: boolean;
  enableListings: boolean;
  customMessage: string; // Message for payment requests
  defaultPricing: number;
}

const sellerTypes = [
  'Individual Creator',
  'Freelancer',
  'Artist/Designer',
  'Content Creator',
  'Consultant',
  'Service Provider',
  'Small Business Owner',
  'Photographer',
  'Writer/Blogger',
  'Coach/Trainer',
  'Musician',
  'Other'
];

export default function SoloSellerOnboarding() {
  const router = useRouter();
  const { user, getAccessToken, authenticated } = usePrivy(); // ✅ Added Privy hooks
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<SoloSellerFormData>({
    displayName: '',
    sellerType: '',
    contactEmail: '',
    contactPhone: '',
    socialHandle: '',
    description: '',
    website: '',
    preferredToken: DEFAULT_TOKEN_SYMBOL, // PYUSD
    enableQRCodes: true,
    enablePaymentLinks: true,
    enableInvoices: true,
    enableListings: false,
    customMessage: 'Payment for services',
    defaultPricing: 50,
  });

  const updateFormData = (field: keyof SoloSellerFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log('🚀 Solo Seller: Starting submission...');
    
    if (!formData.displayName || !formData.sellerType) {
      setError('Please fill in required fields');
      return;
    }

    // ✅ Check authentication first
    if (!authenticated) {
      console.error('❌ Solo Seller: User not authenticated');
      setError('Please connect your wallet to continue');
      router.push('/');
      return;
    }

    if (!user?.wallet?.address) {
      console.error('❌ Solo Seller: No wallet address found');
      setError('Wallet address required. Please connect your wallet.');
      return;
    }

    console.log('✅ Solo Seller: User authenticated with wallet:', user.wallet.address);

    setLoading(true);
    setError('');

    try {
      // ✅ Enhanced token handling
      let token = localStorage.getItem('authToken');
      console.log('🔐 Solo Seller: Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      // If no authToken or it's invalid, try getting from Privy
      if (!token || token === 'null' || token.trim() === '') {
        console.log('🔄 Solo Seller: Getting fresh token from Privy...');
        try {
          token = await getAccessToken();
          console.log('✅ Solo Seller: Fresh token obtained:', token ? `${token.substring(0, 20)}...` : 'null');
          
          if (token) {
            localStorage.setItem('authToken', token);
            console.log('💾 Solo Seller: Token saved to localStorage');
          }
        } catch (tokenError) {
          console.error('💥 Solo Seller: Failed to get access token:', tokenError);
          setError('Failed to get authentication token. Please try logging in again.');
          return;
        }
      }

      if (!token) {
        console.error('❌ Solo Seller: No token available after all attempts');
        setError('Authentication required. Please log in again.');
        router.push('/');
        return;
      }

      // ✅ Prepare request data
      const requestData = {
        displayName: formData.displayName,
        sellerType: formData.sellerType,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        socialHandle: formData.socialHandle,
        description: formData.description,
        website: formData.website,
        preferredToken: formData.preferredToken,
        enableQRCodes: formData.enableQRCodes,
        enablePaymentLinks: formData.enablePaymentLinks,
        enableInvoices: formData.enableInvoices,
        enableListings: formData.enableListings,
        customMessage: formData.customMessage,
        defaultPricing: formData.defaultPricing,
        userType: 'solo_seller',
        walletAddress: user.wallet.address // ✅ Include wallet address
      };

      console.log('📦 Solo Seller: Request data prepared:', {
        ...requestData,
        displayName: requestData.displayName,
        sellerType: requestData.sellerType,
        walletAddress: requestData.walletAddress
      });

      console.log('🌐 Solo Seller: Making API request to /api/seller/create...');
      
      const response = await fetch('/api/seller/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Solo Seller: API response status:', response.status);
      console.log('📡 Solo Seller: API response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📄 Solo Seller: API response data:', data);

      if (data.success) {
        console.log('✅ Solo Seller: Account created successfully!');
        
        // ✅ Store seller data for dashboard
        localStorage.setItem('sellerData', JSON.stringify(data.seller));
        localStorage.setItem('userType', 'solo_seller');
        console.log('💾 Solo Seller: Data saved to localStorage');
        
        // ✅ Redirect to solo seller dashboard
        console.log('🎯 Solo Seller: Redirecting to dashboard...');
        router.push('/dashboard/solo-seller');
      } else {
        console.error('❌ Solo Seller: API returned error:', data.error);
        setError(data.error || 'Failed to create solo seller account');
        
        // ✅ Handle specific auth errors
        if (data.code === 'INVALID_TOKEN' || data.code === 'EXPIRED_TOKEN') {
          console.log('🔄 Solo Seller: Token invalid, clearing localStorage...');
          localStorage.removeItem('authToken');
          setError('Session expired. Please refresh and try again.');
        }
      }
    } catch (err) {
      console.error('💥 Solo Seller: Network/submission error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debug info in console
  console.log('🔍 Solo Seller Debug Info:', {
    authenticated,
    hasUser: !!user,
    hasWallet: !!user?.wallet?.address,
    walletAddress: user?.wallet?.address,
    step,
    hasAuthToken: !!localStorage.getItem('authToken')
  });

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
                  Get QR codes, payment links, and invoices to accept PYUSD payments instantly
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

            {/* ✅ Debug info for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">🔍 Debug Info:</h4>
                <p className="text-xs text-yellow-800">
                  Authenticated: {authenticated ? '✅' : '❌'} | 
                  Wallet: {user?.wallet?.address ? `${user.wallet.address.substring(0, 8)}...` : '❌'} | 
                  Token: {localStorage.getItem('authToken') ? '✅' : '❌'}
                </p>
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
                helpText="This will appear on your payment requests and QR codes"
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
                helpText="For payment notifications and customer communication"
              />

              <FormField
                label="Phone Number (Optional)"
                type="tel"
                value={formData.contactPhone}
                onChange={(value: string) => updateFormData('contactPhone', value)}
                placeholder="+1 (555) 123-4567"
              />

              <FormField
                label="Social Handle or Website (Optional)"
                type="text"
                value={formData.socialHandle}
                onChange={(value: string) => updateFormData('socialHandle', value)}
                placeholder="@yourusername or website.com"
                helpText="Instagram, Twitter, LinkedIn, or personal website"
              />

              <FormField
                label="Description (Optional)"
                type="textarea"
                value={formData.description}
                onChange={(value: string) => updateFormData('description', value)}
                placeholder="Describe your services or what you sell..."
                helpText="Helps customers understand what you offer"
              />

              {/* ENS Setup Prompt */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">🌐 ENS Identity Setup</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Get a professional ENS name like <strong>yourname.eth</strong> for easy payments and professional credibility
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Professional Identity
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Easy Payments
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Web3 Native
                  </span>
                </div>
              </div>

              {/* PYUSD info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💰 Accept PYUSD Payments</h3>
                <p className="text-sm text-blue-800">
                  Get paid instantly with PayPal USD. Your customers can pay from Venmo, PayPal, 
                  or any crypto wallet with PYUSD on Arbitrum.
                </p>
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
                Payment Tools & Settings
              </h1>
              <p className="text-gray-600">
                Choose the tools you want for accepting payments from customers
              </p>
              <div className="flex items-center mt-4">
                <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
                <div className="flex-1 bg-blue-600 h-2 rounded-full ml-2"></div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Step 2 of 3</p>
            </div>

            <div className="space-y-6">
              {/* Payment Tool Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Tools (Select all that apply)
                </label>
                
                <div className="space-y-4">
                  {/* QR Codes */}
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
                        Perfect for in-person transactions, social media posts, or printed materials.
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

                  {/* Invoices */}
                  <label className="flex items-start p-4 border-2 border-purple-200 bg-purple-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableInvoices}
                      onChange={(e) => updateFormData('enableInvoices', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">📄</span>
                        <h3 className="font-medium text-purple-900">Professional Invoices</h3>
                      </div>
                      <p className="text-sm text-purple-700">
                        Create professional invoices with payment links. 
                        Perfect for freelancers and service providers.
                      </p>
                    </div>
                  </label>

                  {/* Product Listings */}
                  <label className="flex items-start p-4 border-2 border-orange-200 bg-orange-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableListings}
                      onChange={(e) => updateFormData('enableListings', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">🏷️</span>
                        <h3 className="font-medium text-orange-900">Product Listings</h3>
                      </div>
                      <p className="text-sm text-orange-700">
                        Create simple product listings with photos and descriptions. 
                        Great for artists, creators, and small product sellers.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Default Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Service Price (USD)
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">$</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="5"
                    value={formData.defaultPricing}
                    onChange={(e) => updateFormData('defaultPricing', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This will pre-fill your payment requests. You can always change it later.
                </p>
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
                disabled={!formData.enableQRCodes && !formData.enablePaymentLinks && !formData.enableInvoices && !formData.enableListings}
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
                Your Solo Seller Profile is Ready!
              </h1>
              <p className="text-gray-600">
                Review your setup and complete your solo seller registration
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
                <h3 className="font-medium text-green-900 mb-2">🎉 Your solo seller toolkit includes:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  {formData.enableQRCodes && <li>• Generate QR codes for instant payments</li>}
                  {formData.enablePaymentLinks && <li>• Create shareable payment links</li>}
                  {formData.enableInvoices && <li>• Professional invoice generation</li>}
                  {formData.enableListings && <li>• Simple product listing tools</li>}
                  <li>• Accept PYUSD from Venmo, PayPal, and crypto wallets</li>
                  <li>• Instant payment notifications and tracking</li>
                  <li>• Customer payment history and analytics</li>
                  <li>• ENS domain integration support</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Profile Summary:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Display Name:</strong> {formData.displayName}</p>
                  <p><strong>Type:</strong> {formData.sellerType}</p>
                  <p><strong>Contact:</strong> {formData.contactEmail}</p>
                  {formData.socialHandle && <p><strong>Social/Website:</strong> {formData.socialHandle}</p>}
                  <p><strong>Currency:</strong> PYUSD on Arbitrum</p>
                  <p><strong>Default Price:</strong> ${formData.defaultPricing}</p>
                  <p><strong>Enabled Tools:</strong> 
                    {[
                      formData.enableQRCodes && 'QR Codes',
                      formData.enablePaymentLinks && 'Payment Links', 
                      formData.enableInvoices && 'Invoices',
                      formData.enableListings && 'Listings'
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {/* ENS Registration Reminder */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">🌐 Next Step: Get Your ENS Name!</h3>
                <p className="text-sm text-purple-800 mb-2">
                  Register <strong>{formData.displayName.toLowerCase().replace(/\s+/g, '')}.eth</strong> to make payments even easier for your customers
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 Solo Seller Pro Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Add your QR code to business cards and social media</li>
                  <li>• Use payment links in your email signature</li>
                  <li>• Create professional invoices for larger projects</li>
                  <li>• Share product listings on social platforms</li>
                  <li>• All payments are secured by blockchain escrow</li>
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
                {loading ? 'Creating Solo Seller Profile...' : '🚀 Launch Solo Seller Profile'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}