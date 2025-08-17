import { useMemo } from 'react';
import { useWallets } from '@privy-io/react-auth';
import type { PrivyWallet, WalletInfo, WalletClientType } from '@/types/privy';

export function usePrivyWallet() {
  const walletsHook = useWallets();
  
  // 🔍 Debug: Log what's actually available
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 useWallets hook keys:', Object.keys(walletsHook));
    console.log('🔍 useWallets hook object:', walletsHook);
  }

  const { wallets, ready } = walletsHook;
  
  // Safely extract createWallet if it exists
  const createWallet = (walletsHook as any).createWallet;

  const walletInfo = useMemo((): WalletInfo | null => {
    if (!wallets || wallets.length === 0) return null;
    
    const typedWallets = wallets as unknown as PrivyWallet[];
    const primaryWallet = typedWallets.find(w => w.walletClientType === 'privy') ?? typedWallets[0];
    
    if (!primaryWallet) return null;
    
    return {
      address: primaryWallet.address,
      chainId: primaryWallet.chainId,
      type: primaryWallet.walletClientType as any,
      isEmbedded: primaryWallet.walletClientType === 'privy',
      isPrimary: true
    };
  }, [wallets]);

  return {
    walletInfo,
    walletAddress: walletInfo?.address,
    isEmbeddedWallet: walletInfo?.isEmbedded ?? false,
    createWallet,
    ready,
    hasWallet: walletInfo !== null,
    chainId: walletInfo?.chainId || '42161',
    // Debug info
    availableMethods: Object.keys(walletsHook)
  };
}