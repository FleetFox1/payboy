'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { QRCodeSVG } from 'qrcode.react';

interface SellerStats {
  totalEarnings: number;
  totalSales: number;
  activeListings: number;
  totalViews: number;
  averageSalePrice: number;
  sellerName: string;
  ensName?: string;
  sellerType: string;
  isVerified: boolean;
  isActive: boolean;
  sellerAge: {
    days: number;
    weeks: number;
    months: number;
  };
  lastSale?: string;
  daysSinceLastSale?: number;
  performance: {
    salesGoal: number;
    salesProgress: number;
    earningsGoal: number;
    earningsProgress: number;
  };
  status: {
    hasENS: boolean;
    profileCompletion: number;
    hasActiveListings: boolean;
  };
}

interface Listing {
  id: string;
  listingId: string;
  title: string;
  description: string;
  shortDescription?: string;
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
}

function ENSAddress({ address, className = '' }: { address: string; className?: string }) {
  return (
    <span className={`font-mono text-sm ${className}`}>
      {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'No address'}
    </span>
  );
}

export default function SoloSellerDashboard() {
  const router = useRouter();
  const { authenticated, user, login, getAccessToken } = usePrivy();
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      if (!authenticated && !loginAttempted) {
        setLoginAttempted(true);
        try {
          await login();
        } catch (err) {
          console.error('Login failed:', err);
          router.replace('/role');
        }
        return;
      }

      if (authenticated && isClient) {
        await loadSellerData();
        await loadUserListings();
      }
    }

    checkAuth();
  }, [authenticated, router, isClient]);

  const loadUserListings = async () => {
    try {
      setLoadingListings(true);
      console.log('🔍 Loading user listings...');
      
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken');
      }
      
      if (!token) {
        try {
          token = await getAccessToken();
          if (token && typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
          }
        } catch (tokenError) {
          console.warn('⚠️ Could not get auth token for listings');
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const userId = user?.id || 'demo-user';
      const url = `/api/listings/get?userId=${encodeURIComponent(userId)}`;
      
      console.log('🌐 Fetching listings from:', url);

      const response = await fetch(url, { headers });
      
      console.log('📡 Listings API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Listings API response:', data);
        
        if (data.success) {
          // Ensure each listing has a proper payment URL for demo
          const processedListings = (data.listings || []).map((listing: Listing) => ({
            ...listing,
            paymentUrl: listing.paymentUrl || `https://payboy.app/pay?item=${listing.id}&amount=${listing.price}&seller=${user?.wallet?.address || 'demo'}`,
            qrCodeData: listing.qrCodeData || `https://payboy.app/pay?item=${listing.id}&amount=${listing.price}&seller=${user?.wallet?.address || 'demo'}`
          }));
          
          setListings(processedListings);
          console.log('✅ Loaded', processedListings.length, 'listings');
          
          if (sellerStats) {
            setSellerStats({
              ...sellerStats,
              activeListings: processedListings.length,
              status: {
                ...sellerStats.status,
                hasActiveListings: processedListings.length > 0
              }
            });
          }
        } else {
          console.error('❌ Listings API error:', data.error);
        }
      } else {
        console.warn('⚠️ Listings API not available or failed:', response.status);
      }
    } catch (error) {
      console.error('💥 Error loading listings:', error);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleCopyLink = async (listing: Listing) => {
    try {
      await navigator.clipboard.writeText(listing.paymentUrl);
      setCopySuccess(listing.id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      const textArea = document.createElement('textarea');
      textArea.value = listing.paymentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(listing.id);
        setTimeout(() => setCopySuccess(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const loadSellerData = async () => {
    try {
      setIsLoading(true);
      
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken');
      }
      
      if (!token) {
        router.replace('/role');
        return;
      }

      if (typeof window !== 'undefined') {
        const storedSellerData = localStorage.getItem('sellerData');
        if (storedSellerData) {
          try {
            const sellerData = JSON.parse(storedSellerData);
            console.log('✅ Solo Seller Dashboard: Using stored seller data:', sellerData);
            
            const mockStats: SellerStats = {
              totalEarnings: sellerData.totalEarnings || 0,
              totalSales: sellerData.totalSales || 0,
              activeListings: sellerData.activeListings || 0,
              totalViews: sellerData.totalViews || 0,
              averageSalePrice: sellerData.averageSalePrice || 0,
              sellerName: sellerData.displayName || 'Solo Seller',
              ensName: sellerData.ensName,
              sellerType: sellerData.sellerType || 'Creator',
              isVerified: sellerData.isVerified || false,
              isActive: sellerData.isActive !== false,
              sellerAge: {
                days: sellerData.createdAt ? Math.floor((Date.now() - new Date(sellerData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
                weeks: 0,
                months: 0
              },
              lastSale: sellerData.lastSale,
              daysSinceLastSale: sellerData.lastSale ? Math.floor((Date.now() - new Date(sellerData.lastSale).getTime()) / (1000 * 60 * 60 * 24)) : undefined,
              performance: {
                salesGoal: 20,
                salesProgress: (sellerData.totalSales || 0) / 20 * 100,
                earningsGoal: 500,
                earningsProgress: (sellerData.totalEarnings || 0) / 500 * 100
              },
              status: {
                hasENS: !!sellerData.ensName,
                profileCompletion: 75,
                hasActiveListings: (sellerData.activeListings || 0) > 0
              }
            };
            
            setSellerStats(mockStats);
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing stored seller data:', parseError);
          }
        }
      }

      const defaultStats: SellerStats = {
        totalEarnings: 0,
        totalSales: 0,
        activeListings: 0,
        totalViews: 0,
        averageSalePrice: 0,
        sellerName: 'Solo Seller',
        sellerType: 'Creator',
        isVerified: false,
        isActive: true,
        sellerAge: { days: 0, weeks: 0, months: 0 },
        performance: {
          salesGoal: 20,
          salesProgress: 0,
          earningsGoal: 500,
          earningsProgress: 0
        },
        status: {
          hasENS: false,
          profileCompletion: 75,
          hasActiveListings: false
        }
      };
      
      setSellerStats(defaultStats);

      setRecentSales([
        { 
          id: 'sale1', 
          itemName: 'Handmade Ceramic Mug', 
          amount: 35.00, 
          date: '2025-08-15',
          buyer: 'buyer1.eth',
          status: 'completed'
        },
        { 
          id: 'sale2', 
          itemName: 'Digital Art Print', 
          amount: 25.00, 
          date: '2025-08-14',
          buyer: '0x742d35Cc6638Fd8593',
          status: 'completed'
        },
        { 
          id: 'sale3', 
          itemName: 'Custom Logo Design', 
          amount: 150.00, 
          date: '2025-08-13',
          buyer: 'creative.eth',
          status: 'pending'
        },
      ]);

    } catch (err) {
      console.error('Error loading seller data:', err);
      setError('Network error loading seller data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  if (isLoading || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3">👤</div>
          <h2 className="text-xl font-semibold mb-2">Loading Solo Seller Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your seller profile</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Seller Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.replace('/onboarding/solo-seller')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Set Up Seller Profile
          </button>
        </div>
      </div>
    );
  }

  const handleSettingsClick = () => {
    router.push('/dashboard/settings');
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            👤 {sellerStats?.sellerName || 'Solo Seller'} Dashboard
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-600">{sellerStats?.sellerType}</span>
            {sellerStats?.isVerified && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                ✓ Verified Seller
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm text-gray-600">
            <p>Selling since: {sellerStats?.sellerAge.days || 0} days ago</p>
            <p>Profile: {sellerStats?.status.profileCompletion || 0}% complete</p>
          </div>
          <button
            onClick={handleSettingsClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Seller Identity & Balance */}
      <section className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-2">Your Seller Identity:</p>
            <div className="font-mono">
              <ENSAddress address={user?.wallet?.address || ''} />
            </div>
            {sellerStats?.status.hasENS && (
              <p className="text-xs text-blue-600 mt-1">
                ✓ Custom ENS: {sellerStats.ensName}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              This is your seller identity that buyers will see
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">PYUSD Earnings:</p>
            <p className="text-3xl font-bold text-green-600">
              ${sellerStats?.totalEarnings.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500">
              {sellerStats?.totalSales || 0} sales • {listings.length || 0} active listings
            </p>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 text-sm">Total Earnings</h3>
          <p className="text-2xl font-bold text-green-600">
            ${sellerStats?.totalEarnings.toFixed(2) || '0.00'}
          </p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, sellerStats?.performance.earningsProgress || 0)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Goal: ${sellerStats?.performance.earningsGoal || 500}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 text-sm">Total Sales</h3>
          <p className="text-2xl font-bold text-blue-600">
            {sellerStats?.totalSales || 0}
          </p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, sellerStats?.performance.salesProgress || 0)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Goal: {sellerStats?.performance.salesGoal || 20} sales
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 text-sm">Average Sale</h3>
          <p className="text-2xl font-bold text-purple-600">
            ${sellerStats?.averageSalePrice.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {sellerStats?.daysSinceLastSale !== undefined 
              ? `${sellerStats.daysSinceLastSale} days ago`
              : 'No sales yet'
            }
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 text-sm">Active Listings</h3>
          <p className="text-2xl font-bold text-orange-600">
            {listings.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {listings.reduce((total, listing) => total + listing.views, 0)} total views
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">💰 Start Selling</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/seller/create-listing')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition text-center"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium">Create Listing</div>
            <div className="text-xs opacity-90">Add item for sale</div>
          </button>

          <button
            onClick={() => router.push('/seller/payment-link')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition text-center"
          >
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium">Payment Link</div>
            <div className="text-xs opacity-90">One-time payment</div>
          </button>

          <button
            onClick={() => router.push('/seller/qr-generator')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition text-center"
          >
            <div className="text-2xl mb-2">📱</div>
            <div className="font-medium">QR Code</div>
            <div className="text-xs opacity-90">Quick payment QR</div>
          </button>

          <button
            onClick={() => router.push('/seller/invoice')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition text-center"
          >
            <div className="text-2xl mb-2">📄</div>
            <div className="font-medium">Send Invoice</div>
            <div className="text-xs opacity-90">Professional billing</div>
          </button>
        </div>
      </section>

      {/* MY LISTINGS WITH QR CODES */}
      <section className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">📋 My Listings</h2>
          <div className="flex space-x-2">
            <button
              onClick={loadUserListings}
              disabled={loadingListings}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {loadingListings ? '⟳' : '🔄'} Refresh
            </button>
            <button
              onClick={() => router.push('/seller/create-listing')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              + Create Listing
            </button>
          </div>
        </div>

        {loadingListings ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">No listings yet! Create your first listing to start selling.</p>
            <button
              onClick={() => router.push('/seller/create-listing')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <span className="text-2xl font-bold text-green-600">
                        ${listing.price.toFixed(2)}
                      </span>
                      {!listing.isActive && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      {listing.shortDescription || listing.description.substring(0, 100) + '...'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span>📂 {listing.category}</span>
                      <span>👁️ {listing.views} views</span>
                      <span>💬 {listing.inquiries} inquiries</span>
                      <span>💰 {listing.sales} sales</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {listing.paymentMethods.pyusd && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">PYUSD</span>
                      )}
                      {listing.paymentMethods.paypal && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">PayPal</span>
                      )}
                      {listing.paymentMethods.venmo && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Venmo</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    {/* QR CODE DISPLAY */}
                    <div className="text-center">
                      <div className="bg-white p-2 border rounded-lg">
                        <QRCodeSVG 
                          value={listing.qrCodeData || listing.paymentUrl} 
                          size={80}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">QR Code</p>
                    </div>
                    
                    {/* BUTTONS */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => setExpandedListing(expandedListing === listing.id ? null : listing.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        {expandedListing === listing.id ? '🔽 Hide' : '📱 Show QR'}
                      </button>
                      <button
                        onClick={() => handleCopyLink(listing)}
                        className={`px-3 py-1 rounded text-sm transition ${
                          copySuccess === listing.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        {copySuccess === listing.id ? '✓ Copied!' : '📋 Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* EXPANDED QR CODE SECTION */}
                {expandedListing === listing.id && (
                  <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Large QR Code */}
                      <div className="text-center">
                        <div className="bg-white p-6 rounded-lg shadow-sm inline-block">
                          <QRCodeSVG 
                            value={listing.qrCodeData || listing.paymentUrl} 
                            size={200}
                            level="M"
                            includeMargin={true}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Scan to buy this item</p>
                        <button
                          onClick={() => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const svg = document.querySelector(`#qr-${listing.id}`) as SVGElement;
                            // Simple download functionality could be added here
                            alert('QR Code download feature coming soon!');
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          💾 Download QR
                        </button>
                      </div>
                      
                      {/* Payment Link */}
                      <div>
                        <h4 className="font-semibold mb-2">Payment Link:</h4>
                        <div className="bg-white border rounded p-3 mb-3">
                          <p className="text-xs font-mono text-gray-600 break-all">
                            {listing.paymentUrl}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => handleCopyLink(listing)}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                          >
                            📋 Copy Payment Link
                          </button>
                          <button
                            onClick={() => window.open(listing.paymentUrl, '_blank')}
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                          >
                            👁️ Preview Payment Page
                          </button>
                        </div>
                        
                        {copySuccess === listing.id && (
                          <p className="text-green-600 text-sm mt-2">✅ Link copied to clipboard!</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Sales - Simplified */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">💰 Recent Sales</h2>
        {recentSales.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-500">No sales yet! Create listings to start selling.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{sale.itemName}</p>
                  <p className="text-sm text-gray-500">{sale.date} → {sale.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+${sale.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">PYUSD</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}