'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FormField } from '@/components/FormField';
import QRCode from 'qrcode';

interface SellerData {
  id: string;
  sellerId: string;
  displayName: string;
  sellerType: string;
  socialHandle?: string;
  preferredToken: string;
  customMessage: string;
  isActive: boolean;
  isVerified: boolean;
}

interface PaymentData {
  amount: string;
  message: string;
  customerName: string;
  customerEmail: string;
}

export default function PaySellerPage() {
  const params = useParams();
  const sellerId = params.sellerId as string;
  
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'qr' | 'processing' | 'success'>('form');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    message: '',
    customerName: '',
    customerEmail: '',
  });

  // Load seller data
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await fetch(`/api/seller/public/${sellerId}`);
        const data = await response.json();
        
        if (data.success) {
          setSeller(data.seller);
          setPaymentData(prev => ({
            ...prev,
            message: data.seller.customMessage
          }));
        } else {
          setError('Seller not found or inactive');
        }
      } catch (err) {
        setError('Failed to load seller information');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSeller();
    }
  }, [sellerId]);

  const updatePaymentData = (field: keyof PaymentData, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const generateQRCode = async () => {
    if (!seller || !paymentData.amount) return;

    try {
      setPaymentStep('qr');
      
      // Create payment URL with parameters
      const paymentUrl = new URL(window.location.href);
      paymentUrl.searchParams.set('amount', paymentData.amount);
      paymentUrl.searchParams.set('message', paymentData.message);
      if (paymentData.customerName) paymentUrl.searchParams.set('customer', paymentData.customerName);
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(paymentUrl.toString(), {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      setPaymentStep('form');
    }
  };

  const handleDirectPayment = async () => {
    if (!seller || !paymentData.amount) return;

    try {
      setPaymentStep('processing');
      
      // Create payment request
      const response = await fetch(`/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: seller.sellerId,
          amount: parseFloat(paymentData.amount),
          token: seller.preferredToken,
          message: paymentData.message,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          requestType: 'direct'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to payment processor or show success
        setPaymentStep('success');
      } else {
        setError(data.error || 'Failed to create payment');
        setPaymentStep('form');
      }
    } catch (err) {
      setError('Payment processing failed');
      setPaymentStep('form');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </main>
    );
  }

  if (error || !seller) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Page Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Go to PayBoy
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (paymentStep === 'form') {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Seller Info */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {seller.displayName.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Pay {seller.displayName}
              </h1>
              <p className="text-gray-600">{seller.sellerType}</p>
              {seller.socialHandle && (
                <p className="text-sm text-blue-600 mt-1">{seller.socialHandle}</p>
              )}
              {seller.isVerified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 mt-2">
                  ✓ Verified Seller
                </span>
              )}
            </div>

            {/* Payment Form */}
            <div className="space-y-6">
              <FormField
                label="Payment Amount"
                type="number"
                value={paymentData.amount}
                onChange={(value: string) => updatePaymentData('amount', value)}
                required
                placeholder="0.00"
                helpText={`Amount in ${seller.preferredToken}`}
              />

              <FormField
                label="Payment Message"
                type="text"
                value={paymentData.message}
                onChange={(value: string) => updatePaymentData('message', value)}
                placeholder={seller.customMessage}
              />

              <FormField
                label="Your Name (Optional)"
                type="text"
                value={paymentData.customerName}
                onChange={(value: string) => updatePaymentData('customerName', value)}
                placeholder="Enter your name"
              />

              <FormField
                label="Your Email (Optional)"
                type="email"
                value={paymentData.customerEmail}
                onChange={(value: string) => updatePaymentData('customerEmail', value)}
                placeholder="For payment receipt"
              />

              {/* Currency Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    P
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">PayPal USD (PYUSD)</h3>
                    <p className="text-sm text-blue-700">Pay from Venmo, PayPal, or crypto wallet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-4 mt-8">
              <button
                onClick={generateQRCode}
                disabled={!paymentData.amount}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                📱 Generate QR Code
              </button>
              
              <button
                onClick={handleDirectPayment}
                disabled={!paymentData.amount}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                💳 Pay Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Powered by PayBoy • Secure blockchain payments
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (paymentStep === 'qr') {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Scan to Pay {seller.displayName}
            </h1>
            
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-6 inline-block">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="Payment QR Code" className="w-64 h-64" />
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Amount:</strong> {paymentData.amount} {seller.preferredToken}
              </p>
              {paymentData.message && (
                <p className="text-sm text-gray-700">
                  <strong>Message:</strong> {paymentData.message}
                </p>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-6">
              <p className="mb-2">🔹 Open your Venmo or PayPal app</p>
              <p className="mb-2">🔹 Tap the scan button</p>
              <p className="mb-2">🔹 Point camera at the QR code</p>
              <p>🔹 Confirm and send payment</p>
            </div>

            <button
              onClick={() => setPaymentStep('form')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              ← Back to Form
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h1>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      </main>
    );
  }

  if (paymentStep === 'success') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your payment to {seller.displayName} has been completed successfully.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Done
          </button>
        </div>
      </main>
    );
  }

  return null;
}