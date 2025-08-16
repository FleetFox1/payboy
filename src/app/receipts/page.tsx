// src/app/receipts/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type Receipt = {
  id: string;
  payer: { address: string; ens?: string; avatar?: string };
  payee: { address: string; ens?: string; avatar?: string };
  token: { symbol: string; decimals: number; address: string };
  amount: string; // smallest units
  chainId: number;
  txHash: string;
  timestamp: string; // ISO
  block: number;
};

function format(amount: string, decimals: number) {
  const s = amount.padStart(decimals + 1, '0');
  const i = s.length - decimals;
  const a = s.slice(0, i);
  const b = s.slice(i).replace(/0+$/, '');
  return b ? `${a}.${b}` : a;
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const qs = useSearchParams();
  const demo = qs.get('demo') === '1';

  const [data, setData] = useState<Receipt | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setErr(null);

        if (demo) {
          const mock: Receipt = {
            id,
            payer: { address: '0xPayer…' },
            payee: { address: '0xPayee…' },
            token: { symbol: 'USDC', decimals: 6, address: '0xToken' },
            amount: '2500000',
            chainId: 42161,
            txHash: '0xdeadbeef',
            timestamp: new Date().toISOString(),
            block: 123456789,
          };
          if (!cancelled) setData(mock);
          return;
        }

        const res = await fetch(`${backend}/api/receipts/${id}`);
        if (!res.ok) throw new Error(`Receipt fetch failed: ${res.status}`);
        const json: Receipt = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e.message ?? 'Unknown error');
      }
    }

    run();
    return () => { cancelled = true; };
  }, [id, backend, demo]);

  function downloadJSON() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (err) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>
      </main>
    );
  }

  if (!data) return <main className="mx-auto max-w-xl p-6">Loading receipt…</main>;

  const human = `${format(data.amount, data.token.decimals)} ${data.token.symbol}`;

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Payment Receipt</h1>

      <div className="space-y-3 rounded-md border p-4">
        <div className="flex justify-between"><span>Amount</span><span className="font-medium">{human}</span></div>
        <div className="flex justify-between"><span>Chain</span><span>{data.chainId}</span></div>
        <div className="flex justify-between"><span>Tx</span>
          <a className="text-blue-600 underline" target="_blank" href={`https://arbiscan.io/tx/${data.txHash}`}>
            {data.txHash.slice(0, 10)}…</a>
        </div>
        <div className="flex justify-between"><span>Block</span><span>{data.block}</span></div>
        <div className="flex justify-between"><span>Timestamp</span><span>{new Date(data.timestamp).toLocaleString()}</span></div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-600">Payer</p>
        <p className="font-mono">{data.payer.ens ?? data.payer.address}</p>
        <p className="text-sm text-gray-600 mt-3">Payee</p>
        <p className="font-mono">{data.payee.ens ?? data.payee.address}</p>
      </div>

      <button
        onClick={downloadJSON}
        className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-black"
      >
        Download JSON
      </button>

      <p className="text-xs text-gray-500">
        Tip: append <code>?demo=1</code> to this URL to test without a backend.
      </p>
    </main>
  );
}
