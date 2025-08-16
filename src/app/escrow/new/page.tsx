'use client';

import { useState } from 'react';

export default function CreateEscrowPage() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulated escrow link creation
    const escrowId = crypto.randomUUID();
    const url = `${window.location.origin}/checkout/${escrowId}`;
    setLink(url);

    // TODO: send `amount`, `recipient`, `note` to your backend
  };

  return (
    <main className="mx-auto max-w-lg p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Escrow Link</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (USDC)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Recipient Wallet Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Generate Escrow Link
        </button>
      </form>

      {link && (
        <div className="mt-6 p-4 rounded-md border bg-gray-50">
          <p className="text-sm text-gray-700">Escrow Link:</p>
          <a href={link} className="text-blue-600 underline break-all">{link}</a>
        </div>
      )}
    </main>
  );
}
