'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import ENSAddress from '@/components/ENSAddress';

interface MarketplaceData {
  id: string;
  marketplaceName: string;
  marketplaceType: string;
  businessEmail: string;
  category: string;
  commissionRate: number;
  subscriptionFee?: number;
  walletAddress: string;
  isActive: boolean;
  isVerified: boolean;
  totalEarnings: number;
  totalCommissions: number;
  totalSubscriptionRevenue: number;
  activeMerchants: number;
  totalTransactions: number;
  disputesCount: number;
  createdAt: string;
}

interface MarketplaceStats {
  totalEarnings: number;
  totalCommissions: number;
  totalSubscriptionRevenue: number;
  activeMerchants: number;
  pendingMerchants: number;
  totalProducts: number;
  totalOrders: number;
  disputesOpen: number;
  disputesResolved: number;
  averageOrderValue: number;
  monthlyGrowth: {
    merchants: number;
    revenue: number;
    orders: number;
  };
  topPerformers: {
    merchantName: string;
    merchantId: string;
    revenue: number;
    orders: number;
  }[];
}

interface ConnectedMerchant {
  id: string;
  merchantName: string;
  ensName?: string;
  walletAddress: string;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  totalSales: number;
  commissionOwed: number;
  lastPayoutDate?: string;
  productsCount: number;
  ordersCount: number;
  disputesCount: number;
  rating: number;
}

interface RecentActivity {
  id: string;
  type: 'merchant_joined' | 'commission_earned' | 'payout_sent' | 'dispute_opened' | 'dispute_resolved' | 'subscription_payment';
  merchantName?: string;
  merchantId?: string;
  amount?: number;
  description: string;
  timestamp: string;
}

export default function MarketplaceDashboard() {
  const { authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceData | null>(null);
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null);
  const [connectedMerchants, setConnectedMerchants] = useState<ConnectedMerchant[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'merchants' | 'payouts' | 'disputes'>('overview');

  useEffect(() => {
    if (authenticated) {
      loadMarketplaceData();
    }
  }, [authenticated]);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.replace('/role');
        return;
      }

      // Fetch marketplace stats
      const statsResponse = await fetch('/api/marketplace/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setMarketplaceStats(statsData.stats);
          setMarketplaceData(statsData.marketplace);
        }
      } else if (statsResponse.status === 404) {
        // Marketplace not found - redirect to onboarding
        router.replace('/onboarding/marketplace');
        return;
      }

      // Fetch connected merchants
      const merchantsResponse = await fetch('/api/marketplace/merchants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (merchantsResponse.ok) {
        const merchantsData = await merchantsResponse.json();
        if (merchantsData.success) {
          setConnectedMerchants(merchantsData.merchants);
        }
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/marketplace/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setRecentActivity(activityData.activities);
        }
      }

    } catch (err) {
      console.error('Error loading marketplace data:', err);
      setError('Failed to load marketplace data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayoutMerchant = async (merchantId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/marketplace/merchants/${merchantId}/payout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Refresh data after payout
        loadMarketplaceData();
      }
    } catch (err) {
      console.error('Payout failed:', err);
    }
  };

  if (isLoading || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Marketplace Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your marketplace data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Marketplace</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.replace('/onboarding/marketplace')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Set Up Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {marketplaceData?.marketplaceName || 'Marketplace'} Dashboard
          </h1>
          <div className="flex items-center space-x-3 mt-2">
            <span className="text-lg text-gray-600">{marketplaceData?.marketplaceType}</span>
            {marketplaceData?.isVerified && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                ✓ Verified
              </span>
            )}
            <span className="text-sm text-gray-500">
              Commission: {marketplaceData?.commissionRate}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Marketplace Wallet</p>
          <ENSAddress address={user?.wallet?.address || ''} className="font-mono text-sm" />
          <p className="text-xs text-gray-400 mt-1">
            {marketplaceStats?.activeMerchants || 0} active merchants
          </p>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-2xl font-bold text-green-600">
            ${marketplaceStats?.totalEarnings.toFixed(2) || '0.00'}
          </h3>
          <p className="text-gray-600">Total Revenue</p>
          <p className="text-xs text-gray-400 mt-1">
            Commission + Subscriptions
          </p>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">📈</div>
          <h3 className="text-2xl font-bold text-blue-600">
            ${marketplaceStats?.totalCommissions.toFixed(2) || '0.00'}
          </h3>
          <p className="text-gray-600">Commission Earned</p>
          <p className="text-xs text-gray-400 mt-1">
            {marketplaceData?.commissionRate}% per transaction
          </p>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">🔄</div>
          <h3 className="text-2xl font-bold text-purple-600">
            ${marketplaceStats?.totalSubscriptionRevenue.toFixed(2) || '0.00'}
          </h3>
          <p className="text-gray-600">Subscription Revenue</p>
          <p className="text-xs text-gray-400 mt-1">
            Monthly merchant fees
          </p>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-2xl font-bold text-gray-900">
            {marketplaceStats?.activeMerchants || 0}
          </h3>
          <p className="text-gray-600">Active Merchants</p>
          <p className="text-xs text-gray-400 mt-1">
            {marketplaceStats?.pendingMerchants || 0} pending approval
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'merchants', label: 'Merchants', icon: '👥' },
            { id: 'payouts', label: 'Payouts', icon: '💸' },
            { id: 'disputes', label: 'Disputes', icon: '⚖️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'disputes' && (marketplaceStats?.disputesOpen ?? 0) > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {marketplaceStats?.disputesOpen ?? 0}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">📦 Products & Orders</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Products:</span>
                  <span className="font-semibold">{marketplaceStats?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-semibold">{marketplaceStats?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Order Value:</span>
                  <span className="font-semibold">${marketplaceStats?.averageOrderValue.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Monthly Growth</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>New Merchants:</span>
                  <span className="font-semibold text-green-600">+{marketplaceStats?.monthlyGrowth.merchants || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue Growth:</span>
                  <span className="font-semibold text-green-600">+{marketplaceStats?.monthlyGrowth.revenue || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Growth:</span>
                  <span className="font-semibold text-green-600">+{marketplaceStats?.monthlyGrowth.orders || 0}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">⚖️ Disputes</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Open:</span>
                  <span className="font-semibold text-red-600">{marketplaceStats?.disputesOpen || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved:</span>
                  <span className="font-semibold text-green-600">{marketplaceStats?.disputesResolved || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution Rate:</span>
                  <span className="font-semibold">
                    {marketplaceStats?.disputesResolved && marketplaceStats?.disputesOpen 
                      ? Math.round((marketplaceStats.disputesResolved / (marketplaceStats.disputesResolved + marketplaceStats.disputesOpen)) * 100)
                      : 100
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Merchants */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">🏆 Top Performing Merchants</h3>
            {marketplaceStats?.topPerformers.length ? (
              <div className="space-y-3">
                {marketplaceStats.topPerformers.map((merchant, index) => (
                  <div key={merchant.merchantId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
                      <div>
                        <p className="font-medium">{merchant.merchantName}</p>
                        <p className="text-sm text-gray-500">{merchant.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${merchant.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">total sales</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No merchant data available yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'merchants' && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Connected Merchants</h3>
            <button
              onClick={() => router.push('/marketplace/invite-merchant')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Invite Merchant
            </button>
          </div>
          
          {connectedMerchants.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Owed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connectedMerchants.map((merchant) => (
                    <tr key={merchant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{merchant.merchantName}</p>
                          <ENSAddress address={merchant.walletAddress} className="text-sm text-gray-500" />
                          <p className="text-xs text-gray-400">
                            {merchant.productsCount} products • {merchant.ordersCount} orders
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          merchant.status === 'active' ? 'bg-green-100 text-green-800' :
                          merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {merchant.status}
                        </span>
                        {merchant.rating > 0 && (
                          <p className="text-xs text-gray-500 mt-1">⭐ {merchant.rating.toFixed(1)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold">${merchant.totalSales.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(merchant.joinedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-orange-600">${merchant.commissionOwed.toFixed(2)}</p>
                        {merchant.lastPayoutDate && (
                          <p className="text-xs text-gray-500">
                            Last: {new Date(merchant.lastPayoutDate).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePayoutMerchant(merchant.id)}
                            disabled={merchant.commissionOwed <= 0}
                            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                          >
                            Pay Out
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No merchants connected yet</p>
              <button
                onClick={() => router.push('/marketplace/invite-merchant')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Invite Your First Merchant
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-6">Payout Management</h3>
          
          {/* Payout Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900">Pending Payouts</h4>
              <p className="text-2xl font-bold text-orange-600">
                ${connectedMerchants.reduce((sum, m) => sum + m.commissionOwed, 0).toFixed(2)}
              </p>
              <p className="text-sm text-orange-700">
                {connectedMerchants.filter(m => m.commissionOwed > 0).length} merchants
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Paid This Month</h4>
              <p className="text-2xl font-bold text-green-600">$0.00</p>
              <p className="text-sm text-green-700">0 transactions</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Your Balance</h4>
              <p className="text-2xl font-bold text-blue-600">
                ${marketplaceStats?.totalEarnings.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-blue-700">Available for withdrawal</p>
            </div>
          </div>

          {/* Bulk Payout Actions */}
          <div className="flex space-x-4 mb-6">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Pay All Pending
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Schedule Payouts
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Export Report
            </button>
          </div>

          {/* Recent Payouts */}
          <h4 className="font-medium mb-4">Recent Payout History</h4>
          <div className="text-center py-8 text-gray-500">
            <p>No payout history available yet</p>
            <p className="text-sm">Payouts will appear here once you start processing them</p>
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-6">Dispute Management</h3>
          
          <div className="text-center py-8 text-gray-500">
            <p>No disputes to review</p>
            <p className="text-sm">Disputes between merchants and customers will appear here</p>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {recentActivity.length ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                {activity.amount && (
                  <span className="font-semibold text-green-600">
                    +${activity.amount.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/marketplace/invite-merchant')}
          className="bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition font-medium"
        >
          ➕ Invite Merchant
        </button>
        <button
          onClick={() => router.push('/marketplace/analytics')}
          className="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition font-medium"
        >
          📊 View Analytics
        </button>
        <button
          onClick={() => router.push('/marketplace/settings')}
          className="bg-gray-600 text-white py-3 px-4 rounded hover:bg-gray-700 transition font-medium"
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => router.push('/marketplace/withdraw')}
          className="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition font-medium"
        >
          💰 Withdraw
        </button>
      </div>
    </main>
  );
}