export interface Seller {
  id: string;
  userId: string; // FK to User
  
  // Profile info
  displayName: string;
  sellerType: string;
  contactEmail?: string;
  contactPhone?: string;
  socialHandle?: string; // Instagram, Twitter, website, etc.
  
  // Payment settings
  preferredToken: string; // Default: 'PYUSD'
  chainPreference: number; // Preferred chain ID (default: 42161)
  
  // Payment methods
  enableQRCodes: boolean; // Generate QR codes for payments
  enablePaymentLinks: boolean; // Generate shareable payment links
  customMessage: string; // Default message for payment requests
  
  // Generated identifiers
  sellerId: string; // Unique seller ID for payment URLs (seller_abc123)
  qrCodeData: string; // Base QR code data/URL
  
  // Status & verification
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  
  // Analytics & stats
  totalPayments: number; // Count of completed payments
  totalAmount: number; // Total amount received (in preferred token)
  lastPaymentAt?: Date; // When they last received a payment
  
  // Settings
  notificationPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    webhookUrl?: string; // Optional webhook for advanced users
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSellerRequest {
  displayName: string;
  sellerType: string;
  contactEmail?: string;
  contactPhone?: string;
  socialHandle?: string;
  preferredToken?: string;
  enableQRCodes?: boolean;
  enablePaymentLinks?: boolean;
  customMessage?: string;
}

export interface UpdateSellerRequest {
  displayName?: string;
  sellerType?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialHandle?: string;
  preferredToken?: string;
  enableQRCodes?: boolean;
  enablePaymentLinks?: boolean;
  customMessage?: string;
  notificationPreferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    webhookUrl?: string;
  };
}

// Payment request types for sellers
export interface PaymentRequest {
  id: string;
  sellerId: string;
  
  // Payment details
  amount: number; // Amount in token units
  token: string; // PYUSD, USDC, etc.
  chainId: number;
  message: string;
  
  // Customer info (optional)
  customerEmail?: string;
  customerName?: string;
  
  // Request specifics
  requestType: 'qr' | 'link' | 'direct'; // How payment was initiated
  expiresAt?: Date; // Optional expiration
  
  // Status
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentTxHash?: string; // Transaction hash when paid
  paidAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequestRequest {
  amount: number;
  message?: string;
  customerEmail?: string;
  customerName?: string;
  expiresIn?: number; // Hours until expiration
}

// Seller analytics/stats
export interface SellerStats {
  sellerId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  
  totalPayments: number;
  totalAmount: number;
  averagePayment: number;
  
  // Payment method breakdown
  qrCodePayments: number;
  linkPayments: number;
  directPayments: number;
  
  // Token breakdown
  tokenBreakdown: {
    [token: string]: {
      count: number;
      amount: number;
    };
  };
  
  // Timeline data
  dailyPayments?: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

// Seller validation helpers
export const SELLER_TYPES = [
  'Individual Creator',
  'Freelancer',
  'Artist/Designer',
  'Content Creator',
  'Consultant',
  'Service Provider',
  'Small Business Owner',
  'Other'
] as const;

export type SellerType = typeof SELLER_TYPES[number];

export const SELLER_VALIDATION = {
  displayName: {
    minLength: 2,
    maxLength: 50,
    required: true
  },
  sellerType: {
    required: true,
    enum: SELLER_TYPES
  },
  customMessage: {
    maxLength: 200,
    default: 'Payment for services'
  },
  socialHandle: {
    maxLength: 100,
    pattern: /^[a-zA-Z0-9@._-]*$/ // Allow @, ., _, - for social handles
  }
};

// Helper functions for seller operations
export function generateSellerId(): string {
  return 'seller_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function generatePaymentUrl(sellerId: string, baseUrl?: string): string {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://payboy.app';
  return `${url}/pay/${sellerId}`;
}

export function isValidSellerType(type: string): type is SellerType {
  return SELLER_TYPES.includes(type as SellerType);
}

export function validateSellerData(data: CreateSellerRequest | UpdateSellerRequest): string[] {
  const errors: string[] = [];
  
  if ('displayName' in data && data.displayName) {
    if (data.displayName.length < SELLER_VALIDATION.displayName.minLength) {
      errors.push(`Display name must be at least ${SELLER_VALIDATION.displayName.minLength} characters`);
    }
    if (data.displayName.length > SELLER_VALIDATION.displayName.maxLength) {
      errors.push(`Display name must be no more than ${SELLER_VALIDATION.displayName.maxLength} characters`);
    }
  }
  
  if ('sellerType' in data && data.sellerType && !isValidSellerType(data.sellerType)) {
    errors.push('Invalid seller type');
  }
  
  if ('socialHandle' in data && data.socialHandle) {
    if (!SELLER_VALIDATION.socialHandle.pattern.test(data.socialHandle)) {
      errors.push('Social handle contains invalid characters');
    }
  }
  
  if ('customMessage' in data && data.customMessage) {
    if (data.customMessage.length > SELLER_VALIDATION.customMessage.maxLength) {
      errors.push(`Custom message must be no more than ${SELLER_VALIDATION.customMessage.maxLength} characters`);
    }
  }
  
  return errors;
}