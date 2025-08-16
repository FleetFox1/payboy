// src/app/checkout/[id]/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

type Escrow = {
  id: string;
  token: { address: string; symbol: string; decimals: number };
  amount: string; // smallest units
  payee: string;  // address or email
  chainId: number;
};

type FundIntent = {
  needsApproval: boolean;
  approve?: { to: string; data: string };
  fund: { to: string; data: string };
  amount: string;
  token: { address: string; symbol: string; decimals: number };
};

function formatAmount(raw: string, decimals: number) {
  if (!raw) return '0';
  const s = raw.padStart(decimals + 1, '0');
  const i = s.length - decimals;
  const a = s.slice(0, i);
  const b = s.slice(i).replace(/0+$/, '');
  return b ? `${a}.${b}` : a;
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const qs = useSearchParams();
  const demo = qs.get('demo') === '1';

  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [intent, setIntent] = useState<FundIntent | null>(null);
  const [step, setStep] = useState<'idle'|'approving'|'funding'|'done'>('idle');

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch escrow details
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true); setErr(null);

        if (demo) {
          // demo payload so page works without backend
          const mock: Escrow = {
            id,
            token: { address: '0xToken', symbol: 'USDC', decimals: 6 },
            amount: '2500000',
            payee: '0xPayeeOrEmail',
            chainId: 42161,
          };
          if (!cancelled) setEscrow(mock);
          return;
        }

        const res = await fetch(`${backend}/api/escrows/${id}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const json: Escrow = await res.json();
        if (!cancelled) setEscrow(json);
      } catch (e: any) {
        if (!cancelled) setErr(e.message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [id, backend, demo]);

  // Request fund-intent
  async function getIntent() {
    try {
      setErr(null);
      if (demo) {
        const mock: FundIntent = {
          needsApproval: true,
          approve: { to: '0xToken', data: '0xabcdef' },
          fund: { to: '0xEscrow', data: '0xdeadbeef' },
          amount: escrow!.amount,
          token: escrow!.token,
        };
        setIntent(mock);
        return;
      }
      const res = await fetch(`${backend}/api/escrows/${id}/fund-intent`, { method: 'POST' });
      if (!res.ok) throw new Error(`fund-intent failed: ${res.status}`);
      const json: FundIntent = await res.json();
      setIntent(json);
    } catch (e: any) {
      setErr(e.message ?? 'Unknown error');
    }
  }

  // Simulate sending transactions (replace with wagmi/viem writes)
  async function doApprove() {
    setStep('approving');
    await new Promise(r => setTimeout(r, 900)); // stub
    setStep('idle');
  }
  async function doFund() {
    setStep('funding');
    await new Promise(r => setTimeout(r, 1200)); // stub
    setStep('done');
    window.location.href = `/receipts/${id}?demo=${demo ? 1 : 0}`;
  }

  const human = useMemo(() => {
    if (!escrow) return '';
    return `${formatAmount(escrow.amount, escrow.token.decimals)} ${escrow.token.symbol}`;
  }, [escrow]);

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      {loading && <p>Loading escrow…</p>}
      {err && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {escrow && (
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex justify-between"><span>Amount</span><span className="font-medium">{human}</span></div>
          <div className="flex justify-between"><span>Payee</span><span className="font-mono">{escrow.payee}</span></div>
          <div className="flex justify-between"><span>Chain</span><span>{escrow.chainId}</span></div>
        </div>
      )}

      {!intent && escrow && (
        <button
          onClick={getIntent}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Continue
        </button>
      )}

      {intent && step !== 'done' && (
        <div className="space-y-3">
          {intent.needsApproval && (
            <button
              disabled={step !== 'idle'}
              onClick={doApprove}
              className={`rounded-md px-4 py-2 text-white ${step==='idle' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400'}`}
            >
              {step==='approving' ? 'Approving…' : 'Approve'}
            </button>
          )}
          <button
            disabled={step!=='idle'}
            onClick={doFund}
            className={`rounded-md px-4 py-2 text-white ${step==='idle' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-400'}`}
          >
            {step==='funding' ? 'Funding…' : 'Fund'}
          </button>
          <p className="text-xs text-gray-500">
            (Tx sending is stubbed for now; this will call wagmi/viem with the provided <code>to</code> and <code>data</code>.)
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Tip: append <code>?demo=1</code> to this URL to test without a backend.
      </p>
    </main>
  );
}
