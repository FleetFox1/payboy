export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logo?: string;
  enabled: boolean;
  isDefault?: boolean;
  isStablecoin: boolean;
  category: 'stablecoin' | 'crypto' | 'other';
}

// Token addresses by chain
export const TOKEN_ADDRESSES = {
  // Arbitrum One (42161)
  42161: {
    PYUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    ETH: '0x0000000000000000000000000000000000000000', // Native ETH
  },
  // Polygon (137) - for future
  137: {
    PYUSD: '0x9aA29aA6cF8ab7C1Ca015d3D6c1BB3E7fcA5EB9C',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  // Base (8453) - for future  
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  }
};

// Supported tokens configuration
export const SUPPORTED_TOKENS: Record<string, TokenConfig> = {
  // PayPal USD - Primary token
  PYUSD_ARB: {
    address: TOKEN_ADDRESSES[42161].PYUSD,
    symbol: 'PYUSD',
    name: 'PayPal USD',
    decimals: 6,
    chainId: 42161,
    enabled: true,
    isDefault: true,
    isStablecoin: true,
    category: 'stablecoin',
  },
  
  // USD Coin - Coming soon
  USDC_ARB: {
    address: TOKEN_ADDRESSES[42161].USDC,
    symbol: 'USDC', 
    name: 'USD Coin',
    decimals: 6,
    chainId: 42161,
    enabled: false, // Coming soon
    isDefault: false,
    isStablecoin: true,
    category: 'stablecoin',
  },
  
  // Tether - Future support
  USDT_ARB: {
    address: TOKEN_ADDRESSES[42161].USDT,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chainId: 42161,
    enabled: false, // Future
    isDefault: false,
    isStablecoin: true,
    category: 'stablecoin',
  },
  
  // Native ETH - For fees/advanced users
  ETH_ARB: {
    address: TOKEN_ADDRESSES[42161].ETH,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: 42161,
    enabled: false, // Advanced feature
    isDefault: false,
    isStablecoin: false,
    category: 'crypto',
  },
};

// Helper functions
export function getEnabledTokens(chainId?: number): TokenConfig[] {
  return Object.values(SUPPORTED_TOKENS).filter(token => {
    const chainMatches = chainId ? token.chainId === chainId : true;
    return token.enabled && chainMatches;
  });
}

export function getDefaultToken(chainId: number = 42161): TokenConfig | null {
  return Object.values(SUPPORTED_TOKENS).find(token => 
    token.isDefault && token.chainId === chainId
  ) || null;
}

export function getTokenBySymbol(symbol: string, chainId: number = 42161): TokenConfig | null {
  return Object.values(SUPPORTED_TOKENS).find(token => 
    token.symbol === symbol && token.chainId === chainId
  ) || null;
}

export function getStablecoins(chainId?: number): TokenConfig[] {
  return Object.values(SUPPORTED_TOKENS).filter(token => {
    const chainMatches = chainId ? token.chainId === chainId : true;
    return token.isStablecoin && chainMatches;
  });
}

export function formatTokenAmount(amount: string | number, token: TokenConfig): string {
  const amountStr = amount.toString();
  const padded = amountStr.padStart(token.decimals + 1, '0');
  const integerPart = padded.slice(0, -token.decimals) || '0';
  const decimalPart = padded.slice(-token.decimals).replace(/0+$/, '');
  
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

export function parseTokenAmount(amount: string, token: TokenConfig): string {
  const [integer = '0', decimal = ''] = amount.split('.');
  const paddedDecimal = decimal.padEnd(token.decimals, '0').slice(0, token.decimals);
  return integer + paddedDecimal;
}

// Token validation
export function isValidTokenAmount(amount: string, token: TokenConfig): boolean {
  try {
    const parsed = parseTokenAmount(amount, token);
    const num = BigInt(parsed);
    return num >= BigInt(0);
  } catch {
    return false;
  }
}

// Constants
export const DEFAULT_TOKEN_SYMBOL = 'PYUSD';
export const DEFAULT_CHAIN_ID = 42161;
export const MIN_PAYMENT_AMOUNT = '1'; // $1 minimum in any stablecoin