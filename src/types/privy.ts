export interface PrivyWallet {
  address: string;
  chainId: string;
  walletClient: string;
  walletClientType: 'privy' | 'metamask' | 'walletconnect' | 'coinbase_wallet' | 'rainbow' | string;
  connectorType: string;
  imported: boolean;
  delegated: boolean;
  recovery?: {
    rootEntropy: string;
  };
}

export interface PrivyUser {
  id: string;
  createdAt: Date;
  linkedAccounts: Array<{
    type: string;
    address?: string;
    email?: string;
    phone?: string;
    subject?: string;
  }>;
  mfaMethods: Array<any>;
}

export type WalletClientType = 'privy' | 'metamask' | 'walletconnect' | 'coinbase_wallet' | 'rainbow';

export interface WalletInfo {
  address: string;
  chainId: string;
  type: WalletClientType;
  isEmbedded: boolean;
  isPrimary: boolean;
}