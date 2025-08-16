import { ethers, JsonRpcProvider, isAddress } from 'ethers';

// ENS resolution - must use Ethereum mainnet
const getENSProvider = () => {
  return new JsonRpcProvider(
    process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 
    'https://eth-mainnet.g.alchemy.com/v2/demo'
  );
};

// Contract interactions - use Arbitrum Sepolia
const getContractProvider = () => {
  return new JsonRpcProvider(
    process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 
    'https://arb-sepolia.g.alchemy.com/v2/demo'
  );
};

export interface ENSResult {
  displayName: string;
  ensName: string | null;
  address: string;
  isENS: boolean;
}

export async function resolveENS(address: string): Promise<ENSResult> {
  try {
    if (!address || !isAddress(address)) {
      throw new Error('Invalid address');
    }

    // Use Ethereum mainnet for ENS resolution
    const provider = getENSProvider();
    
    console.log('🔍 ENS: Looking up reverse record for', address);
    const ensName = await provider.lookupAddress(address);
    
    if (!ensName) {
      console.log('❌ ENS: No reverse record found');
      return {
        displayName: formatAddress(address),
        ensName: null,
        address,
        isENS: false
      };
    }

    console.log('✅ ENS: Found ENS name:', ensName);

    // Verify forward resolution
    const resolvedAddress = await provider.resolveName(ensName);
    
    if (!resolvedAddress || resolvedAddress.toLowerCase() !== address.toLowerCase()) {
      console.log('❌ ENS: Forward resolution mismatch');
      return {
        displayName: formatAddress(address),
        ensName: null,
        address,
        isENS: false
      };
    }

    console.log('✅ ENS: Forward resolution verified');

    return {
      displayName: ensName,
      ensName,
      address,
      isENS: true
    };

  } catch (error) {
    console.error('💥 ENS: Resolution failed:', error);
    return {
      displayName: formatAddress(address),
      ensName: null,
      address,
      isENS: false
    };
  }
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Export contract provider for smart contract interactions
export { getContractProvider };