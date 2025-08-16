import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketplace extends Document {
  _id: string;
  userId: string; // Owner of the marketplace
  privyId?: string;
  walletAddress: string;
  
  // Business Information
  marketplaceName: string;
  marketplaceType: string;
  businessEmail: string;
  businessPhone?: string;
  description?: string;
  website?: string;
  
  // Financial Settings
  commissionRate: number; // Percentage (e.g., 2.5 for 2.5%)
  subscriptionFee?: number; // Monthly fee per merchant
  chainPreference: number;
  preferredToken: string;
  
  // Escrow Settings
  autoRelease: boolean;
  autoReleaseHours: number;
  
  // Integration
  webhookUrl?: string;
  apiKeyHash?: string;
  
  // Stats
  totalEarnings: number;
  totalCommissions: number;
  totalSubscriptionRevenue: number;
  activeMerchants: number;
  totalTransactions: number;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceSchema = new Schema<IMarketplace>({
  userId: { type: String, required: true, index: true },
  privyId: { type: String, index: true },
  walletAddress: { type: String, required: true, index: true },
  
  // Business Information
  marketplaceName: { type: String, required: true },
  marketplaceType: { 
    type: String, 
    required: true,
    enum: [
      'E-commerce Store',
      'Digital Marketplace',
      'Freelance/Consulting',
      'SaaS Platform',
      'Creator Platform',
      'NFT Marketplace',
      'Content Creator',
      'Other'
    ]
  },
  businessEmail: { type: String, required: true },
  businessPhone: String,
  description: String,
  website: String,
  
  // Financial Settings
  commissionRate: { type: Number, required: true, min: 0, max: 50 },
  subscriptionFee: { type: Number, default: 0 },
  chainPreference: { type: Number, default: 42161 }, // Arbitrum One
  preferredToken: { type: String, default: 'PYUSD' },
  
  // Escrow Settings
  autoRelease: { type: Boolean, default: true },
  autoReleaseHours: { type: Number, default: 72 },
  
  // Integration
  webhookUrl: String,
  apiKeyHash: String,
  
  // Stats
  totalEarnings: { type: Number, default: 0 },
  totalCommissions: { type: Number, default: 0 },
  totalSubscriptionRevenue: { type: Number, default: 0 },
  activeMerchants: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes
MarketplaceSchema.index({ userId: 1 });
MarketplaceSchema.index({ walletAddress: 1 });
MarketplaceSchema.index({ marketplaceName: 1 });

export const MarketplaceModel = mongoose.models.Marketplace || mongoose.model<IMarketplace>('Marketplace', MarketplaceSchema);