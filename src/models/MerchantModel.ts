export interface Merchant {
  id: string;
  userId: string; // FK to User (changed from user_id to match camelCase)
  
  // Business info
  businessName: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  
  // Stripe-like API features
  apiKey?: string; // For external integrations (hashed)
  apiKeyLast4?: string; // Show last 4 chars in UI
  webhookUrl?: string;
  webhookSecret?: string;
  
  // Platform settings
  feeBps: number; // Platform fee in basis points (default: 250 = 2.5%)
  chainPreference: number; // Preferred chain ID (default: 42161)
  autoRelease: boolean; // Auto-release after delivery confirmation
  autoReleaseHours: number; // Hours to wait before auto-release
  
  // Status & verification
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMerchantRequest {
  businessName: string;
  businessType?: string;
  businessEmail?: string;
  feeBps?: number;
  chainPreference?: number;
}

export interface UpdateMerchantRequest {
  businessName?: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  webhookUrl?: string;
  feeBps?: number;
  chainPreference?: number;
  autoRelease?: boolean;
  autoReleaseHours?: number;
}