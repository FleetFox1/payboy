import { TokenConfig, SUPPORTED_TOKENS } from './token';

export interface ChainConfig {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    escrowFactory?: string;
    merchantRegistry?: string;
    paymentProcessor?: string;
    feeCollector?: string;
  };
  supportedTokens: string[]; // Token symbols supported on this chain
  enabled: boolean;
  isTestnet: boolean;
  gasSettings: {
    gasLimit: number;
    maxFeePerGas?: string; // In gwei
    maxPriorityFeePerGas?: string; // In gwei
  };
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  // Arbitrum One - Primary chain
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ARB',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    contracts: {
      escrowFactory: process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS,
      merchantRegistry: process.env.NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS,
      paymentProcessor: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS,
      feeCollector: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS,
    },
    supportedTokens: ['PYUSD', 'USDC', 'USDT'], // What we support on Arbitrum
    enabled: true,
    isTestnet: false,
    gasSettings: {
      gasLimit: 500000,
      maxFeePerGas: '1', // 1 gwei
      maxPriorityFeePerGas: '0.1', // 0.1 gwei
    },
  },

  // Polygon - Future support
  137: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    contracts: {
      // Will be filled when we deploy
    },
    supportedTokens: ['PYUSD', 'USDC', 'USDT'],
    enabled: false, // Not supported yet
    isTestnet: false,
    gasSettings: {
      gasLimit: 500000,
      maxFeePerGas: '30', // 30 gwei
      maxPriorityFeePerGas: '30', // 30 gwei
    },
  },

  // Base - Future support
  8453: {
    id: 8453,
    name: 'Base',
    symbol: 'BASE',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    contracts: {
      // Will be filled when we deploy
    },
    supportedTokens: ['USDC'], // Base mainly has USDC
    enabled: false, // Not supported yet
    isTestnet: false,
    gasSettings: {
      gasLimit: 500000,
      maxFeePerGas: '1', // 1 gwei
      maxPriorityFeePerGas: '0.1', // 0.1 gwei
    },
  },

  // Arbitrum Sepolia - Testnet
  421614: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    contracts: {
      escrowFactory: process.env.NEXT_PUBLIC_TESTNET_ESCROW_FACTORY,
      merchantRegistry: process.env.NEXT_PUBLIC_TESTNET_MERCHANT_REGISTRY,
      paymentProcessor: process.env.NEXT_PUBLIC_TESTNET_PAYMENT_PROCESSOR,
      feeCollector: process.env.NEXT_PUBLIC_TESTNET_FEE_COLLECTOR,
    },
    supportedTokens: ['PYUSD', 'USDC'], // Test tokens
    enabled: process.env.NODE_ENV === 'development', // Only in dev
    isTestnet: true,
    gasSettings: {
      gasLimit: 500000,
      maxFeePerGas: '1',
      maxPriorityFeePerGas: '0.1',
    },
  },
};

export const DEFAULT_CHAIN_ID = 42161; // Arbitrum One

// Helper functions
export function getEnabledChains(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS).filter(chain => chain.enabled);
}

export function getProductionChains(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS).filter(chain => 
    chain.enabled && !chain.isTestnet
  );
}

export function getChainById(chainId: number): ChainConfig | null {
  return SUPPORTED_CHAINS[chainId] || null;
}

export function isChainSupported(chainId: number): boolean {
  const chain = getChainById(chainId);
  return chain ? chain.enabled : false;
}

export function getChainTokens(chainId: number): TokenConfig[] {
  const chain = getChainById(chainId);
  if (!chain) return [];
  
  return Object.values(SUPPORTED_TOKENS).filter(token =>
    token.chainId === chainId && 
    chain.supportedTokens.includes(token.symbol)
  );
}

export function getEnabledChainTokens(chainId: number): TokenConfig[] {
  return getChainTokens(chainId).filter(token => token.enabled);
}

export function getDefaultChain(): ChainConfig {
  return SUPPORTED_CHAINS[DEFAULT_CHAIN_ID];
}

export function getBlockExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address' = 'tx'): string {
  const chain = getChainById(chainId);
  if (!chain) return '';
  
  return `${chain.blockExplorer}/${type}/${hash}`;
}

export function getChainDisplayName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain ? chain.name : `Chain ${chainId}`;
}

// Validation functions
export function validateChainContracts(chainId: number): boolean {
  const chain = getChainById(chainId);
  if (!chain || !chain.enabled) return false;
  
  // Check if required contracts are deployed
  return !!(
    chain.contracts.escrowFactory &&
    chain.contracts.merchantRegistry &&
    chain.contracts.paymentProcessor
  );
}

export function getRequiredContracts(): (keyof ChainConfig['contracts'])[] {
  return ['escrowFactory', 'merchantRegistry', 'paymentProcessor', 'feeCollector'];
}

// Network switching helpers
export function getNetworkSwitchData(chainId: number) {
  const chain = getChainById(chainId);
  if (!chain) return null;
  
  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [chain.rpcUrl],
    blockExplorerUrls: [chain.blockExplorer],
  };
}