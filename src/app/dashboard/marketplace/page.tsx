'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

interface MarketplaceData {
  marketplaceName: string;
  marketplaceType: string;
  businessEmail: string;
  category: string;
  commissionRate: string;
  createdAt: string;
}

export default function MarketplaceDashboard() {
  const { authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const marketplace = localStorage.getItem('marketplaceInfo');
      if (marketplace) {
        setMarketplaceData(JSON.parse(marketplace));
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Marketplace...</h2>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please connect your wallet</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Marketplace Dashboard</h1>
          {marketplaceData ? (
            <p className="text-lg text-gray-600 mt-1">Welcome to {marketplaceData.marketplaceName}</p>
          ) : (
            <p className="text-lg text-gray-600 mt-1">Manage your marketplace platform</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Connected Wallet</p>
          <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
            {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
          </p>
        </div>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-2xl font-bold text-gray-900">0</h3>
          <p className="text-gray-600">Active Sellers</p>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="text-2xl font-bold text-gray-900">0</h3>
          <p className="text-gray-600">Total Products</p>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-2xl font-bold text-gray-900">$0.00</h3>
          <p className="text-gray-600">Commission Earned</p>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-2xl font-bold text-gray-900">0</h3>
          <p className="text-gray-600">Total Orders</p>
        </div>
      </div>

      {/* Marketplace Management */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">🏬</span>
          Marketplace Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/marketplace/sellers')}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition font-medium text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
            <div className="font-semibold">Manage Sellers</div>
            <div className="text-sm opacity-90">Onboard & approve sellers</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/products')}
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition font-medium text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
            <div className="font-semibold">Product Catalog</div>
            <div className="text-sm opacity-90">Browse all listings</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/orders')}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition font-medium text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
            <div className="font-semibold">Order Management</div>
            <div className="text-sm opacity-90">Track all transactions</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/analytics')}
            className="bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition font-medium text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <div className="font-semibold">Analytics</div>
            <div className="text-sm opacity-90">Performance insights</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/payments')}
            className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition font-medium text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💰</div>
            <div className="font-semibold">Payments</div>
            <div className="text-sm opacity-90">Commission & payouts</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/settings')}
            className="bg-gray-600 text-white p-6 rounded-lg hover:bg-gray-700 transition font-medium text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
            <div className="font-semibold">Settings</div>
            <div className="text-sm opacity-90">Configure marketplace</div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => router.push('/marketplace/invite-seller')}
            className="bg-green-100 border-2 border-green-300 text-green-800 p-4 rounded-lg hover:bg-green-200 transition text-center"
          >
            <div className="text-2xl mb-1">➕</div>
            <div className="font-medium">Invite Seller</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/moderate')}
            className="bg-yellow-100 border-2 border-yellow-300 text-yellow-800 p-4 rounded-lg hover:bg-yellow-200 transition text-center"
          >
            <div className="text-2xl mb-1">🔍</div>
            <div className="font-medium">Review Listings</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/commission-settings')}
            className="bg-blue-100 border-2 border-blue-300 text-blue-800 p-4 rounded-lg hover:bg-blue-200 transition text-center"
          >
            <div className="text-2xl mb-1">💱</div>
            <div className="font-medium">Commission Rates</div>
          </button>
          
          <button 
            onClick={() => router.push('/marketplace/withdraw')}
            className="bg-purple-100 border-2 border-purple-300 text-purple-800 p-4 rounded-lg hover:bg-purple-200 transition text-center"
          >
            <div className="text-2xl mb-1">💸</div>
            <div className="font-medium">Withdraw Funds</div>
          </button>
        </div>
      </div>

      {/* Marketplace Info */}
      {marketplaceData && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-medium">{marketplaceData.marketplaceName}</p>
            </div>
            <div>
              <p className="text-gray-600">Type:</p>
              <p className="font-medium">{marketplaceData.marketplaceType}</p>
            </div>
            <div>
              <p className="text-gray-600">Category:</p>
              <p className="font-medium">{marketplaceData.category}</p>
            </div>
            <div>
              <p className="text-gray-600">Commission Rate:</p>
              <p className="font-medium">{marketplaceData.commissionRate}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact:</p>
              <p className="font-medium">{marketplaceData.businessEmail}</p>
            </div>
            <div>
              <p className="text-gray-600">Created:</p>
              <p className="font-medium">{new Date(marketplaceData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* PYUSD Integration */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">💱</span>
          PYUSD Integration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold text-green-900">Payment Processing</h3>
            <p className="text-sm text-green-700">All transactions use PYUSD on Arbitrum</p>
          </div>
          
          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-semibold text-blue-900">Auto Commission</h3>
            <p className="text-sm text-blue-700">Earn {marketplaceData?.commissionRate || '3.5%'} on every sale</p>
          </div>
          
          <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-purple-900">Instant Settlements</h3>
            <p className="text-sm text-purple-700">Fast payouts to sellers and marketplace</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t">
        <button
          onClick={() => logout()}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          Disconnect Wallet
        </button>
      </div>
    </main>
  );
}