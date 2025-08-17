'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import ENSAddress from '@/components/ENSAddress';

interface StoreData {
  id: string;
  storeName: string;
  ensName?: string;
  storeType: string;
  storeAddress: string;
  category: string;
  walletAddress: string;
  isActive: boolean;
  isVerified: boolean;
  totalEarnings: number;
  totalTransactions: number;
  lastPayment?: string;
  createdAt: string;
}

interface StoreStats {
  totalEarnings: number;
  totalTransactions: number;
  averageTransaction: number;
  storeName: string;
  ensName?: string;
  storeType: string;
  isVerified: boolean;
  isActive: boolean;
  storeAge: {
    days: number;
    weeks: number;
    months: number;
  };
  lastPayment?: string;
  daysSinceLastPayment?: number;
  performance: {
    earningsGoal: number;
    goalProgress: number;
    transactionGoal: number;
    transactionProgress: number;
  };
  status: {
    hasENS: boolean;
    profileCompletion: number;
  };
}

export default function StoreDashboard() {
  const router = useRouter();
  const { authenticated, user, login } = usePrivy();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Load dashboard data only when authenticated
      if (authenticated) {
        await loadStoreData();
      }
    }

    checkAuth();
  }, [authenticated, router]);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.replace('/role');
        return;
      }

      // Fetch store stats (includes most data we need)
      const statsResponse = await fetch('/api/store/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStoreStats(statsData.stats);
        } else {
          setError(statsData.error || 'Failed to load store data');
        }
      } else if (statsResponse.status === 404) {
        // Store not found - redirect to onboarding
        router.replace('/onboarding/store');
        return;
      } else {
        setError('Failed to fetch store data');
      }

      // Mock transactions for now (TODO: Create transaction API)
      setTransactions([
        { 
          id: 'tx1', 
          type: 'QR Payment Received', 
          amount: 25.50, 
          date: '2025-08-15',
          customer: 'customer1.eth'
        },
        { 
          id: 'tx2', 
          type: 'QR Payment Received', 
          amount: 15.00, 
          date: '2025-08-14',
          customer: '0x742d35Cc6638Fd8593'
        },
        { 
          id: 'tx3', 
          type: 'Withdrawal', 
          amount: -20.0, 
          date: '2025-08-13',
          customer: null
        },
      ]);

    } catch (err) {
      console.error('Error loading store data:', err);
      setError('Network error loading store data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsClick = () => {
    router.push('/dashboard/settings');
  };

  // Show loading state
  if (isLoading || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Store Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your store data</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Store</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.replace('/onboarding/store')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Set Up Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {storeStats?.storeName || 'Store'} Dashboard
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-600">{storeStats?.storeType}</span>
            {storeStats?.isVerified && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                ✓ Verified
              </span>
            )}
            {!storeStats?.isActive && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                Inactive
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm text-gray-600">
            <p>Store Age: {storeStats?.storeAge.days || 0} days</p>
            <p>Profile: {storeStats?.status.profileCompletion || 0}% complete</p>
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

      {/* Store Identity & Balance */}
      <section className="border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Store Identity:</p>
            <div className="font-mono">
              {storeStats?.ensName ? (
                <ENSAddress address={user?.wallet?.address || ''} />
              ) : (
                <ENSAddress address={user?.wallet?.address || ''} />
              )}
            </div>
            {storeStats?.status.hasENS && (
              <p className="text-xs text-blue-600 mt-1">
                ✓ Custom ENS: {storeStats.ensName}
              </p>
            )}
          </div>

          <div>
            <p className="text-gray-600 text-sm">PYUSD Balance:</p>
            <p className="text-2xl font-semibold text-green-600">
              ${storeStats?.totalEarnings.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500">
              {storeStats?.totalTransactions || 0} transactions total
            </p>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700">Total Earnings</h3>
          <p className="text-xl font-bold text-green-600">
            ${storeStats?.totalEarnings.toFixed(2) || '0.00'}
          </p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, storeStats?.performance.goalProgress || 0)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Goal: ${storeStats?.performance.earningsGoal || 1000}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700">Transactions</h3>
          <p className="text-xl font-bold text-blue-600">
            {storeStats?.totalTransactions || 0}
          </p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, storeStats?.performance.transactionProgress || 0)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Goal: {storeStats?.performance.transactionGoal || 50}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700">Average Sale</h3>
          <p className="text-xl font-bold text-purple-600">
            ${storeStats?.averageTransaction.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {storeStats?.daysSinceLastPayment !== undefined 
              ? `${storeStats.daysSinceLastPayment} days ago`
              : 'No payments yet'
            }
          </p>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No transactions yet.</p>
            <p className="text-sm text-gray-400">
              Generate a QR code to start accepting PYUSD payments!
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{tx.type}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">{tx.date}</p>
                    {tx.customer && (
                      <div className="text-xs">
                        from <ENSAddress address={tx.customer} className="text-xs" />
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    tx.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/qr/generate')}
          className="bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition font-medium"
        >
          🔗 Generate QR Code
        </button>
        <button
          onClick={() => router.push('/store/analytics')}
          className="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition font-medium"
        >
          📊 View Analytics
        </button>
        <button
          onClick={() => router.push('/store/settings')}
          className="bg-gray-600 text-white py-3 px-4 rounded hover:bg-gray-700 transition font-medium"
        >
          ⚙️ Store Settings
        </button>
        <button
          onClick={() => router.push('/store/withdraw')}
          className="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition font-medium"
        >
          💰 Withdraw PYUSD
        </button>
      </section>
    </main>
  );
}