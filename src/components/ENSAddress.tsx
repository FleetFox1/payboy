'use client';

import { useState, useEffect } from 'react';
import { resolveENS, type ENSResult } from '@/lib/ens';

interface ENSAddressProps {
  address: string;
  showCopy?: boolean;
  showFullOnHover?: boolean;
  className?: string;
}

export default function ENSAddress({ 
  address, 
  showCopy = true, 
  showFullOnHover = true,
  className = "" 
}: ENSAddressProps) {
  const [ensResult, setEnsResult] = useState<ENSResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const result = await resolveENS(address);
        setEnsResult(result);
      } catch (error) {
        console.error('ENS resolution failed:', error);
        setEnsResult({
          displayName: address.slice(0, 6) + '...' + address.slice(-4),
          ensName: null,
          address,
          isENS: false
        });
      } finally {
        setLoading(false);
      }
    }

    resolve();
  }, [address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (loading) {
    return (
      <span className={`text-gray-500 ${className}`}>
        Loading...
      </span>
    );
  }

  if (!ensResult) {
    return (
      <span className={`font-mono text-gray-600 ${className}`}>
        {address}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span 
        className={`${ensResult.isENS ? 'text-blue-600 font-medium' : 'font-mono text-gray-600'}`}
        title={showFullOnHover ? `Full address: ${address}` : undefined}
      >
        {ensResult.displayName}
      </span>
      
      {ensResult.isENS && (
        <span className="ml-1 text-blue-500 text-xs">
          ✓
        </span>
      )}
      
      {showCopy && (
        <button
          onClick={handleCopy}
          className="ml-2 text-gray-400 hover:text-gray-600 text-xs"
          title="Copy full address"
        >
          {copied ? '✓' : '📋'}
        </button>
      )}
    </div>
  );
}