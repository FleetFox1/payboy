'use client'

import { useParams } from 'next/navigation';

export default function EscrowDetail() {
  const { id } = useParams();

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Escrow ID: {id}</h1>
      
      {/* Placeholder content */}
      <div className="border p-4 rounded-md shadow-sm">
        <p><strong>Status:</strong> Pending</p>
        <p><strong>Amount:</strong> 0.5 ETH</p>
        <p><strong>Buyer:</strong> 0x123...abcd</p>
        <p><strong>Seller:</strong> 0x456...efgh</p>
      </div>

      <div className="flex gap-4 mt-4">
        <button className="px-4 py-2 rounded-md bg-green-600 text-white">
          Release Funds
        </button>
        <button className="px-4 py-2 rounded-md bg-red-600 text-white">
          Refund
        </button>
      </div>
    </main>
  );
}
