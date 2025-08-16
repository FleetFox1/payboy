'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function StoreOnboardingPage() {
  const router = useRouter();
  const { authenticated, user } = usePrivy();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!authenticated) {
      const savedRole = localStorage.getItem('selectedRole');
      if (savedRole) {
        router.replace(`/onboarding/${savedRole}`);
      } else {
        router.replace('/role');
      }
    } else {
      // Simulated data for testing
      setBalance(120.5);
      setTransactions([
        { id: 'tx1', type: 'Payment Received', amount: 40.0, date: '2025-08-15' },
        { id: 'tx2', type: 'Withdrawal', amount: -20.0, date: '2025-08-14' },
      ]);
    }
  }, [authenticated, router]);

  if (!authenticated) return null;

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
    </main>
  );
}

