'use client';

import { Dialog } from '@headlessui/react';
import { QRCodeSVG } from 'qrcode.react'; // ✅ Changed import
import { useState } from 'react';

// Define the Listing interface
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
  isVisible: boolean;
  views: number;
  inquiries: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  sellerId?: string;
  sellerWallet?: string; // Keep for backward compatibility
}

// Define the props interface
interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
}

export default function ListingModal({ isOpen, onClose, listing }: ListingModalProps) {
  const [copied, setCopied] = useState(false);
  
  if (!listing) return null;

  // Use the actual payment URL from MongoDB, or fallback to generated one
  const paymentLink = listing.paymentUrl || 
    `https://payboy.app/pay?seller=${listing.sellerWallet || listing.userId}&amount=${listing.price}&memo=${encodeURIComponent(listing.title)}`;

  // Use the actual QR code data from MongoDB, or fallback to payment link
  const qrCodeValue = listing.qrCodeData || paymentLink;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownloadQR = () => {
    // Convert SVG to PNG for download
    const svg = document.querySelector('#qr-code-svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 250;
      canvas.height = 250;
      
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 250, 250);
          
          const link = document.createElement('a');
          link.download = `${listing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />

        {/* Center the modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <Dialog.Panel className="inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-1">
                  {listing.title}
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  {listing.listingId ? `Listing ID: ${listing.listingId}` : 'Quick Payment'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Listing Info */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-3">{listing.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">
                  ${listing.price.toFixed(2)}
                </span>
                <div className="flex items-center space-x-2">
                  {listing.category && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {listing.category}
                    </span>
                  )}
                  {listing.isActive === false && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="mb-6">
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-6">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG 
                    id="qr-code-svg" // ✅ Added ID for download functionality
                    value={qrCodeValue} 
                    size={200}
                    level="M"
                    includeMargin={true}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center max-w-xs">
                  Scan this QR code to view and purchase this item
                </p>
                <button
                  onClick={handleDownloadQR}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  💾 Download QR Code
                </button>
              </div>
            </div>

            {/* Payment Link */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Link:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={paymentLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-mono text-xs"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      copied
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            {listing.paymentMethods && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods:</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.paymentMethods.pyusd && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      💰 PYUSD
                    </span>
                  )}
                  {listing.paymentMethods.paypal && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      💳 PayPal
                    </span>
                  )}
                  {listing.paymentMethods.venmo && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      📱 Venmo
                    </span>
                  )}
                  {listing.paymentMethods.email && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      📧 Email
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Stats (if available) */}
            {(listing.views !== undefined || listing.inquiries !== undefined || listing.sales !== undefined) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Listing Stats:</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-blue-600">{listing.views || 0}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">{listing.inquiries || 0}</p>
                    <p className="text-xs text-gray-500">Inquiries</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-purple-600">{listing.sales || 0}</p>
                    <p className="text-xs text-gray-500">Sales</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={() => window.open(paymentLink, '_blank')}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              👁️ Preview
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}