'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function WithdrawPage() {
  const { authenticated, user } = usePrivy();
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mock balance (backend will provide real balance)
  const availableBalance = 120.50;

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const withdrawAmount = parseFloat(amount);
      
      if (withdrawAmount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      
      if (withdrawAmount > availableBalance) {
        throw new Error('Insufficient balance');
      }

      if (!destination) {
        throw new Error('Destination address is required');
      }

      // Mock API call (backend dev will implement real withdrawal)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setAmount('');
      setDestination('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600">Withdrawal Initiated</h1>
          <p className="text-gray-600">Your PYUSD withdrawal is being processed and will arrive shortly.</p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Make Another Withdrawal
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Withdraw PYUSD</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900">Available Balance</h2>
        <p className="text-2xl font-bold text-blue-600">${availableBalance.toFixed(2)} PYUSD</p>
      </div>

      {error && (
        <div className="p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleWithdraw} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount (PYUSD)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toString())}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700"
              >
                Max
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Address
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the wallet address where you want to receive your PYUSD
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Withdrawal Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${amount || '0.00'} PYUSD</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee:</span>
                <span>$0.50 PYUSD</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>You'll Receive:</span>
                <span>${amount ? (parseFloat(amount) - 0.50).toFixed(2) : '0.00'} PYUSD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || !amount || !destination}
            className={`px-6 py-2 rounded font-medium transition ${
              isProcessing || !amount || !destination
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Withdraw PYUSD'}
          </button>
        </div>
      </form>
    </main>
  );
}