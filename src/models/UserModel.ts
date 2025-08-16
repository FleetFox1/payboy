export interface User {
  id: string;
  email: string;
  passwordHash?: string; // For email/password auth (optional if using Privy only)
  
  // Privy integration
  privyId?: string; // Privy user ID
  walletAddress?: string; // Primary wallet address (embedded or connected)
  
  // Profile
  displayName?: string;
  avatar?: string;
  ens?: string; // ENS name if they have one
  
  // Contact info
  phone?: string;
  
  // Platform settings
  userType: 'buyer' | 'seller' | 'merchant';
  isVerified: boolean;
  emailVerified: boolean;
  
  // Privy-specific fields
  privyAccountType: 'email' | 'wallet'; // How they signed up
  embeddedWallet: boolean; // True if using Privy embedded wallet
  onboardingCompleted: boolean; // Track if they completed role selection
  
  // Wallet and payout management
  payoutMethods: PayoutMethod[];
  balance: UserBalance;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Payout method interface for multiple withdrawal options
export interface PayoutMethod {
  id?: string;
  type: 'crypto' | 'venmo' | 'paypal' | 'bank' | 'cashapp';
  address: string; // Wallet address, email, or account identifier
  label?: string; // User-friendly name like "My Main Wallet"
  isDefault: boolean;
  isVerified: boolean;
  
  // Additional metadata per type
  metadata?: {
    // For crypto
    chainId?: number; // 1 for Ethereum, 42161 for Arbitrum, etc.
    tokenSymbol?: string; // USDC, ETH, etc.
    
    // For Venmo/PayPal/CashApp
    email?: string;
    username?: string;
    
    // For bank
    bankName?: string;
    accountType?: 'checking' | 'savings';
    routingNumber?: string;
    accountNumberLast4?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Balance tracking for payouts
export interface UserBalance {
  available: number; // Available for withdrawal (in USD cents)
  pending: number;   // Pending settlements (in USD cents)
  total: number;     // Total lifetime earnings (in USD cents)
  currency: string;  // 'USD' by default
  lastUpdated: Date;
}

// Separate address interface for reusability (shipping/billing)
export interface Address {
  id?: string;
  userId: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  
  // Address fields
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// User creation requests
export interface CreateUserRequest {
  email: string;
  password?: string; // Optional if using Privy only
  displayName?: string;
  userType: 'buyer' | 'seller' | 'merchant';
  phone?: string;
  
  // Privy fields
  privyId?: string;
  walletAddress?: string;
  privyAccountType?: 'email' | 'wallet';
  embeddedWallet?: boolean;
}

export interface UpdateUserRequest {
  displayName?: string;
  avatar?: string;
  userType?: 'buyer' | 'seller' | 'merchant';
  phone?: string;
  onboardingCompleted?: boolean;
}

// Address management
export interface CreateAddressRequest {
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

// Payout method management
export interface CreatePayoutMethodRequest {
  type: 'crypto' | 'venmo' | 'paypal' | 'bank' | 'cashapp';
  address: string; // Wallet address, email, or account identifier
  label?: string;
  isDefault?: boolean;
  
  metadata?: {
    chainId?: number;
    tokenSymbol?: string;
    email?: string;
    username?: string;
    bankName?: string;
    accountType?: 'checking' | 'savings';
    routingNumber?: string;
    accountNumberLast4?: string;
  };
}

export interface UpdatePayoutMethodRequest {
  label?: string;
  isDefault?: boolean;
  isVerified?: boolean;
}

// Balance operations
export interface UpdateBalanceRequest {
  available?: number;
  pending?: number;
  total?: number;
  operation: 'add' | 'subtract' | 'set'; // How to apply the change
}

// Withdrawal request
export interface WithdrawalRequest {
  payoutMethodId: string;
  amount: number; // In USD cents
  currency: string;
  description?: string;
}

// Transaction history for payouts
export interface Transaction {
  id: string;
  userId: string;
  type: 'payment_received' | 'withdrawal' | 'fee' | 'refund';
  amount: number; // In USD cents
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // Related entities
  payoutMethodId?: string; // For withdrawals
  orderId?: string; // For payments
  sellerId?: string; // For seller payments
  
  // Metadata
  description?: string;
  externalTransactionId?: string; // From payment processor
  
  createdAt: Date;
  updatedAt: Date;
}