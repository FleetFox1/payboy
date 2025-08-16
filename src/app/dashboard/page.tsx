'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { authenticated, user, login, logout } = usePrivy();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('selectedRole');
      const store = localStorage.getItem('storeInfo');
      setUserRole(role);
      if (store) {
        setStoreInfo(JSON.parse(store));
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="text-center space-y-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to PayBoy</h1>
            <p className="text-xl text-gray-600">Connect your wallet to get started</p>
          </div>
          
          <div className="bg-white rounded-lg border p-8 shadow-sm">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to start accepting PYUSD payments and manage your business
            </p>
            <button
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              onClick={() => login()}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          {storeInfo ? (
            <p className="text-lg text-gray-600 mt-1">Welcome back to {storeInfo.storeName}</p>
          ) : userRole === 'solo-seller' ? (
            <p className="text-lg text-gray-600 mt-1">Your solo seller dashboard</p>
          ) : (
            <p className="text-lg text-gray-600 mt-1">Manage your PayBoy account</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Connected Wallet</p>
          <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
            {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
          </p>
        </div>
      </div>

      {/* Wallet Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl">💰</div>
          <h3 className="text-lg font-semibold text-gray-900">Wallet Information</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">Full Address:</p>
        <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
          {user?.wallet?.address ?? '(no address)'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          This is where you'll receive PYUSD payments
        </p>
      </div>

      {/* Store Owner Dashboard */}
      {userRole === 'store' && (
        <>
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🏪</span>
              Store Management
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/store/products/new')}
                className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition font-medium text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                <div className="font-semibold">Add Product</div>
                <div className="text-sm opacity-90">Create new listings</div>
              </button>
              
              <button 
                onClick={() => router.push('/store/products')}
                className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition font-medium text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                <div className="font-semibold">Manage Products</div>
                <div className="text-sm opacity-90">Edit your catalog</div>
              </button>
              
              <button 
                onClick={() => router.push('/store/orders')}
                className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition font-medium text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                <div className="font-semibold">View Orders</div>
                <div className="text-sm opacity-90">Track sales</div>
              </button>
              
              <button 
                onClick={() => router.push('/store/withdraw')}
                className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition font-medium text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💰</div>
                <div className="font-semibold">Withdraw</div>
                <div className="text-sm opacity-90">Cash out earnings</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => router.push('/store/settings')}
              className="bg-gray-600 text-white p-6 rounded-lg hover:bg-gray-700 transition text-center group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
              <div className="font-semibold">Store Settings</div>
              <div className="text-sm opacity-90">Configure your store</div>
            </button>
            
            <button 
              onClick={() => router.push('/onboarding/store/tutorial')}
              className="bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition text-center group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
              <div className="font-semibold">Store Tutorial</div>
              <div className="text-sm opacity-90">Learn how to use PayBoy</div>
            </button>
          </div>
        </>
      )}

      {/* Solo Seller Dashboard */}
      {userRole === 'solo-seller' && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">👤</span>
            Solo Seller Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition font-medium text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📱</div>
              <div className="font-semibold">Sell Item</div>
              <div className="text-sm opacity-90">Quick listing</div>
            </button>
            
            <button className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition font-medium text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
              <div className="font-semibold">My Listings</div>
              <div className="text-sm opacity-90">Manage items</div>
            </button>
            
            <button className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition font-medium text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
              <div className="font-semibold">Sales History</div>
              <div className="text-sm opacity-90">Track earnings</div>
            </button>
            
            <button className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition font-medium text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💰</div>
              <div className="font-semibold">Withdraw</div>
              <div className="text-sm opacity-90">Cash out</div>
            </button>
          </div>
        </div>
      )}

      {/* General Tools */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">🛠️</span>
          PayBoy Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/escrow/new">
            <a className="block bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔒</div>
              <div className="font-semibold">Create Escrow</div>
              <div className="text-sm opacity-90">Secure transactions</div>
            </a>
          </Link>

          <button
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition text-center group"
            onClick={() => alert('Funding modal coming soon')}
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💳</div>
            <div className="font-semibold">Fund Wallet</div>
            <div className="text-sm opacity-90">Add PYUSD</div>
          </button>

          <Link href="/receipts">
            <a className="block bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧾</div>
              <div className="font-semibold">View Receipts</div>
              <div className="text-sm opacity-90">Transaction history</div>
            </a>
          </Link>
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
