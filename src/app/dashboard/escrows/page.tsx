'use client';

import { useEffect, useState } from 'react';

type Escrow = {
  id: string;
  amount: string;
  token: { symbol: string; decimals: number };
  payer: string;
  payee: string;
  status: 'pending' | 'funded' | 'released' | 'disputed';
  updated: string;
};

function formatAmount(amount: string, decimals: number) {
  const s = amount.padStart(decimals + 1, '0');
  const i = s.length - decimals;
  const a = s.slice(0, i);
  const b = s.slice(i).replace(/0+$/, '');
  return b ? `${a}.${b}` : a;
}

export default function EscrowDashboardPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        const res = await fetch(`${backend}/api/escrows`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data: Escrow[] = await res.json();
        if (!cancelled) setEscrows(data);
      } catch (e: any) {
        if (!cancelled) setErr(e.message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [backend]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Escrows</h1>

      {err && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 mb-6">
          {err}
        </div>
      )}

      {loading ? (
        <p>Loading escrows…</p>
      ) : escrows.length === 0 ? (
        <p>No escrows found.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payee</th>
              <th>Payer</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {escrows.map(e => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="py-2 text-blue-600 underline cursor-pointer">
                  <a href={`/escrow/${e.id}`}>{e.id.slice(0, 8)}…</a>
                </td>
                <td>{formatAmount(e.amount, e.token.decimals)} {e.token.symbol}</td>
                <td className="capitalize">{e.status}</td>
                <td className="font-mono">{e.payee.slice(0, 6)}…</td>
                <td className="font-mono">{e.payer.slice(0, 6)}…</td>
                <td>{new Date(e.updated).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
