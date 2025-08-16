'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

export default function Dashboard() {
  const { authenticated, user, login, logout } = usePrivy();
  const [businessType, setBusinessType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pb.businessType');
      setBusinessType(saved);
    }
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {businessType && (
        <p className="text-sm text-gray-600">
          Business type: <span className="font-semibold">{businessType}</span>
        </p>
      )}

      {authenticated ? (
        <>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Connected Wallet:</p>
            <p className="font-mono">{user?.wallet?.address ?? '(no address)'}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/escrow/new">
              <a className="rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700">
                Create Escrow Link
              </a>
            </Link>

            <button
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              onClick={() => alert('Funding modal coming soon')}
            >
              Fund Wallet
            </button>
          </div>

          <button
            onClick={() => logout()}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 mt-4"
          >
            Disconnect Wallet
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You are not connected. To create escrow links or fund your wallet, please connect your wallet below.
          </p>
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => login()}
          >
            Connect Wallet
          </button>
        </div>
      )}
    </main>
  );
}
