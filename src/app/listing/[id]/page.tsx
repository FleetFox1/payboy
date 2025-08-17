'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

interface Listing {
  id: string;
  listingId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  paymentMethods: {
    pyusd: boolean;
    paypal: boolean;
    venmo: boolean;
    email: boolean;
  };
  paymentUrl: string;
  qrCodeData: string;
  isActive: boolean;
  views: number;
  inquiries: number;
  sales: number;
  createdAt: string;
}

export default function ListingPage() {
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadListing(params.id as string);
    }
  }, [params.id]);

  const loadListing = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/get?listingId=${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.listing) {
          setListing(data.listing);
        }
      }
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!listing) return;
    try {
      await navigator.clipboard.writeText(listing.paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-4">This listing doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const qrCodeValue = listing.qrCodeData || listing.paymentUrl;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <p className="text-gray-600">{listing.description}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-green-600">
              ${listing.price.toFixed(2)}
            </span>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {listing.category}
              </span>
              {!listing.isActive && (
                <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Scan to Pay</h2>
          <div className="flex justify-center mb-4">
            <div className="p-6 bg-white border-4 border-gray-100 rounded-xl">
              <QRCodeSVG 
                value={qrCodeValue} 
                size={250}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Scan this QR code with your phone to view and purchase this item
          </p>
        </div>

        {/* Payment Link */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Payment Link</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={listing.paymentUrl}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          {copied && (
            <p className="text-green-600 text-sm mt-2">Link copied! Share it anywhere.</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Accepted Payment Methods</h3>
          <div className="grid grid-cols-2 gap-3">
            {listing.paymentMethods.pyusd && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">💰</span>
                <span className="font-medium">PYUSD</span>
              </div>
            )}
            {listing.paymentMethods.paypal && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">💳</span>
                <span className="font-medium">PayPal</span>
              </div>
            )}
            {listing.paymentMethods.venmo && (
              <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl">📱</span>
                <span className="font-medium">Venmo</span>
              </div>
            )}
            {listing.paymentMethods.email && (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📧</span>
                <span className="font-medium">Email Pay</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-3">Listing Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{listing.views}</p>
              <p className="text-sm text-gray-600">Views</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{listing.inquiries}</p>
              <p className="text-sm text-gray-600">Inquiries</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{listing.sales}</p>
              <p className="text-sm text-gray-600">Sales</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={() => window.open(listing.paymentUrl, '_blank')}
            className="w-full bg-green-600 text-white py-4 rounded-lg text-xl font-semibold hover:bg-green-700 transition"
          >
            🛒 Buy Now - ${listing.price.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}