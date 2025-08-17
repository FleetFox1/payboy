'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

interface SellerData {
  id: string;
  displayName: string;
  ensName?: string;
  sellerType: string;
  contactEmail?: string;
  location?: string;
  walletAddress: string;
  isActive: boolean;
  isVerified: boolean;
  totalEarnings: number;
  totalSales: number;
  activeListings: number;
  lastSale?: string;
  createdAt: string;
}

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

// ✅ Add Listing interface
interface Listing {
  id: string;
  listingId: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  formattedPrice?: string;
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

// ✅ Simple ENS Address Component for this file
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
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]); // ✅ Add listings state
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false); // ✅ Add loading state for listings
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // ✅ Only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      // Only attempt login once
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

      // Load dashboard data only when authenticated and client-side
      if (authenticated && isClient) {
        await loadSellerData();
        await loadUserListings(); // ✅ Load listings when dashboard loads
      }
    }

    checkAuth();
  }, [authenticated, router, isClient]);

  // ✅ Function to load user's listings
  const loadUserListings = async () => {
    try {
      setLoadingListings(true);
      console.log('🔍 Loading user listings...');
      
      // Get auth token
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

      // Add user ID as URL parameter as fallback
      const userId = user?.id || 'demo-user';
      const url = `/api/listing/get?userId=${encodeURIComponent(userId)}`;
      
      console.log('🌐 Fetching listings from:', url);

      const response = await fetch(url, { headers });
      
      console.log('📡 Listings API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Listings API response:', data);
        
        if (data.success) {
          setListings(data.listings || []);
          console.log('✅ Loaded', data.listings?.length || 0, 'listings');
          
          // Update seller stats with actual listing count
          if (sellerStats) {
            setSellerStats({
              ...sellerStats,
              activeListings: data.listings?.length || 0,
              status: {
                ...sellerStats.status,
                hasActiveListings: (data.listings?.length || 0) > 0
              }
            });
          }
        } else {
          console.error('❌ Listings API error:', data.error);
        }
      } else {
        console.warn('⚠️ Listings API not available or failed:', response.status);
        // Don't set error - API might not exist yet
      }
    } catch (error) {
      console.error('💥 Error loading listings:', error);
      // Don't set error - this is optional for now
    } finally {
      setLoadingListings(false);
    }
  };

  const loadSellerData = async () => {
    try {
      setIsLoading(true);
      
      // ✅ Safe localStorage access
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken');
      }
      
      if (!token) {
        router.replace('/role');
        return;
      }

      // ✅ Try to use stored seller data first
      if (typeof window !== 'undefined') {
        const storedSellerData = localStorage.getItem('sellerData');
        if (storedSellerData) {
          try {
            const sellerData = JSON.parse(storedSellerData);
            console.log('✅ Solo Seller Dashboard: Using stored seller data:', sellerData);
            
            // Create stats from stored data
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

      // ✅ Try API if no stored data (will create the endpoint later)
      try {
        const statsResponse = await fetch('/api/seller/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setSellerStats(statsData.stats);
          } else {
            setError(statsData.error || 'Failed to load seller data');
          }
        } else if (statsResponse.status === 404) {
          // Seller not found - redirect to onboarding
          router.replace('/onboarding/solo-seller');
          return;
        } else {
          // API doesn't exist yet - use default data
          console.log('📝 Solo Seller Dashboard: API not ready, using default data');
          
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
        }
      } catch (apiError) {
        console.log('📝 Solo Seller Dashboard: API call failed, using default data');
        
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
      }

      // Mock recent sales for now (TODO: Create sales API)
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

  // ✅ Show loading until client-side hydration
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

  // Show loading state
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

  // Show error state
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
            {!sellerStats?.isActive && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                Inactive
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
              {sellerStats?.ensName ? (
                <ENSAddress address={user?.wallet?.address || ''} />
              ) : (
                <ENSAddress address={user?.wallet?.address || ''} />
              )}
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

      {/* Quick Actions - Solo Seller Focus */}
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

      {/* ✅ MY LISTINGS SECTION */}
      <section className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">📋 My Listings</h2>
          <button
            onClick={() => router.push('/seller/create-listing')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            + Create Listing
          </button>
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
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <p>• Add photos and descriptions of items you want to sell</p>
              <p>• Set competitive prices for quick sales</p>
              <p>• Choose multiple payment methods to reach more buyers</p>
              <p>• Share your listing links on social media</p>
            </div>
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
                      {!listing.isVisible && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      {listing.shortDescription || listing.description.substring(0, 100) + '...'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>📂 {listing.category}</span>
                      <span>👁️ {listing.views} views</span>
                      <span>💬 {listing.inquiries} inquiries</span>
                      <span>💰 {listing.sales} sales</span>
                      <span>📅 {new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      {listing.paymentMethods.pyusd && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">PYUSD</span>
                      )}
                      {listing.paymentMethods.paypal && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">PayPal</span>
                      )}
                      {listing.paymentMethods.venmo && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Venmo</span>
                      )}
                      {listing.paymentMethods.email && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Email</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => window.open(listing.paymentUrl, '_blank')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View Listing
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(listing.paymentUrl)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Add edit functionality
                        alert('Edit functionality coming soon!');
                      }}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {listings.length > 0 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => router.push('/seller/manage-listings')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All Listings →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Recent Sales */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Recent Sales</h2>
        {recentSales.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-500 mb-4">No sales yet! Ready to make your first sale?</p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Create a listing for an item you want to sell</p>
              <p>• Generate a payment link for a service</p>
              <p>• Share a QR code for in-person payments</p>
              <p>• Send an invoice to a client</p>
            </div>
            <button
              onClick={() => router.push('/seller/create-listing')}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{sale.itemName}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-gray-500">{sale.date}</p>
                    <span className="text-sm">→</span>
                    <ENSAddress address={sale.buyer} className="text-sm" />
                    <span className={`text-xs px-2 py-1 rounded ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
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

      {/* Seller Tools & Management */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Listing Analytics */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Listing Performance</h3>
          {listings.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Total Listings:</span>
                <span className="font-semibold text-blue-600">{listings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Views:</span>
                <span className="font-semibold">{listings.reduce((total, listing) => total + listing.views, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Inquiries:</span>
                <span className="font-semibold">{listings.reduce((total, listing) => total + listing.inquiries, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Sales:</span>
                <span className="font-semibold text-green-600">{listings.reduce((total, listing) => total + listing.sales, 0)}</span>
              </div>
              <button
                onClick={() => router.push('/seller/analytics')}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4"
              >
                View Analytics
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No listings to analyze yet</p>
              <button
                onClick={() => router.push('/seller/create-listing')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Create First Listing
              </button>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Account</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/seller/profile')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded flex justify-between items-center"
            >
              <span>Edit Profile</span>
              <span>→</span>
            </button>
            <button
              onClick={() => router.push('/seller/ens-setup')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded flex justify-between items-center"
            >
              <span>ENS Setup</span>
              {!sellerStats?.status.hasENS && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Setup</span>
              )}
            </button>
            <button
              onClick={() => router.push('/seller/payout-settings')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded flex justify-between items-center"
            >
              <span>Payout Settings</span>
              <span>→</span>
            </button>
            <button
              onClick={() => router.push('/seller/withdraw')}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-center"
            >
              💰 Withdraw Earnings
            </button>
          </div>
        </div>
      </section>

      {/* Tips for Solo Sellers */}
      <section className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Solo Seller Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">📸 Great Photos = More Sales</h4>
            <p className="text-blue-700">Use natural lighting and multiple angles for your items</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">💬 Quick Responses Win</h4>
            <p className="text-blue-700">Reply to buyer questions within a few hours</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🏷️ Competitive Pricing</h4>
            <p className="text-blue-700">Research similar items to price yours fairly</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">✨ ENS Names Build Trust</h4>
            <p className="text-blue-700">Custom names like "artist.eth" look more professional</p>
          </div>
        </div>
      </section>
    </main>
  );
}