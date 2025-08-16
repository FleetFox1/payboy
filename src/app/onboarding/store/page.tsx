'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function StoreDashboard() {
  const router = useRouter();
  const { authenticated, user, login } = usePrivy();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempted, setLoginAttempted] = useState(false);

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
        setBalance(120.5);
        setTransactions([
          { id: 'tx1', type: 'Payment Received', amount: 40.0, date: '2025-08-15' },
          { id: 'tx2', type: 'Withdrawal', amount: -20.0, date: '2025-08-14' },
        ]);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [authenticated, router]); // Remove login from dependencies

  // Show loading state
  if (isLoading || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we connect your wallet</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Storefront Dashboard</h1>

      <section className="border rounded-lg p-4">
        <p className="text-gray-600 text-sm">Wallet Address:</p>
        <p className="font-mono">{user?.wallet?.address ?? '(not connected)'}</p>

        <div className="mt-4">
          <p className="text-gray-600 text-sm">PYUSD Balance:</p>
          <p className="text-xl font-semibold">${balance.toFixed(2)}</p>
        </div>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{tx.type}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
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

      <section className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/store/products/new')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Add Product
        </button>
        <button
          onClick={() => router.push('/store/products')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Manage Listings
        </button>
        <button
          onClick={() => router.push('/store/orders')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Orders
        </button>
        <button
          onClick={() => router.push('/store/withdraw')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Withdraw PYUSD
        </button>
        <button
          onClick={() => router.push('/store/settings')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition col-span-2"
        >
          Store Settings
        </button>
      </section>
    </main>
  );
}

  return null;
}