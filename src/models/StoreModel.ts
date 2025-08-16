import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  _id: string;
  // User connection
  userId: string;
  privyId: string;
  walletAddress: string;
  ensName?: string;
  
  // Store details
  storeName: string;
  storeType: string;
  storeEmail?: string;
  storePhone?: string;
  storeAddress: string;
  category: string;
  description?: string;
  website?: string;
  
  // QR Code settings
  qrCodeSize: string;
  printingEnabled: boolean;
  notificationEmail?: string;
  
  // Store status
  isActive: boolean;
  isVerified: boolean;
  
  // Payment info
  totalEarnings: number;
  totalTransactions: number;
  lastPayment?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  // User connection
  userId: {
    type: String,
    required: true,
    index: true
  },
  privyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  ensName: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  
  // Store details
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  storeType: {
    type: String,
    required: true,
    enum: [
      'Retail Store',
      'Restaurant/Food Service',
      'Gas Station',
      'Convenience Store',
      'Pharmacy',
      'Grocery Store',
      'Electronics Store',
      'Clothing Store',
      'Coffee Shop',
      'Other'
    ]
  },
  storeEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  storePhone: {
    type: String,
    trim: true
  },
  storeAddress: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining',
      'Retail & Shopping',
      'Automotive',
      'Health & Wellness',
      'Entertainment',
      'Services',
      'Beauty & Personal Care',
      'Other'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  website: {
    type: String,
    trim: true
  },
  
  // QR Code settings
  qrCodeSize: {
    type: String,
    default: 'Medium (4x4 inches)',
    enum: [
      'Small (2x2 inches)',
      'Medium (4x4 inches)',
      'Large (6x6 inches)',
      'Extra Large (8x8 inches)'
    ]
  },
  printingEnabled: {
    type: Boolean,
    default: true
  },
  notificationEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Store status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Payment info
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTransactions: {
    type: Number,
    default: 0,
    min: 0
  },
  lastPayment: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
StoreSchema.index({ userId: 1, isActive: 1 });
StoreSchema.index({ walletAddress: 1 });
StoreSchema.index({ ensName: 1 });
StoreSchema.index({ category: 1, storeType: 1 });
StoreSchema.index({ createdAt: -1 });

// Virtual for formatted earnings
StoreSchema.virtual('formattedEarnings').get(function() {
  return `$${this.totalEarnings.toFixed(2)}`;
});

export const StoreModel = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);