import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { MarketplaceModel } from "@/models/MarketplaceModel";
import { verifyJWT } from "@/lib/auth";
import mongoose from 'mongoose';
import crypto from 'crypto';

// Use the SAME User schema from your auth API
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  privyId: String,
  walletAddress: String,
  displayName: String,
  userType: { type: String, enum: ['buyer', 'seller', 'merchant', 'store_owner', 'marketplace_owner'], default: 'buyer' },
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  
  // Privy-specific fields
  privyAccountType: { type: String, enum: ['email', 'wallet'], default: 'email' },
  embeddedWallet: { type: Boolean, default: true },
  onboardingCompleted: { type: Boolean, default: false },
  
  // Payout preferences with enhanced schema
  payoutMethods: [{
    type: { type: String, enum: ['crypto', 'venmo', 'paypal', 'bank', 'cashapp'] },
    address: String,
    label: String,
    isDefault: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    metadata: {
      chainId: Number,
      tokenSymbol: String,
      email: String,
      username: String,
      bankName: String,
      accountType: String,
      routingNumber: String,
      accountNumberLast4: String,
    }
  }],
  
  // Balance tracking
  balance: {
    available: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  lastLogin: Date,
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req: NextRequest) {
  try {
    console.log('🏪 Marketplace Create API: Creating new marketplace...');
    
    // Get auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Marketplace Create API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Get request data
    const marketplaceData = await req.json();
    console.log('📋 Marketplace Create API: Marketplace data received:', {
      marketplaceName: marketplaceData.marketplaceName,
      marketplaceType: marketplaceData.marketplaceType,
      commissionRate: marketplaceData.commissionRate
    });

    // Validate required fields
    if (!marketplaceData.marketplaceName || !marketplaceData.marketplaceType) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'marketplaceName and marketplaceType are required'
      }, { status: 400 });
    }

    // Validate commission rate
    if (marketplaceData.commissionRate && (marketplaceData.commissionRate < 0 || marketplaceData.commissionRate > 50)) {
      return NextResponse.json({ 
        error: 'Invalid commission rate',
        details: 'Commission rate must be between 0% and 50%'
      }, { status: 400 });
    }

    // Find the user
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a marketplace
    const existingMarketplace = await MarketplaceModel.findOne({ userId: decoded.userId });
    if (existingMarketplace) {
      return NextResponse.json({ 
        error: 'User already has a marketplace',
        details: 'Each user can only create one marketplace'
      }, { status: 400 });
    }

    // Generate API key for marketplace integrations
    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Create new marketplace
    const newMarketplace = new MarketplaceModel({
      userId: decoded.userId,
      privyId: user.privyId,
      walletAddress: user.walletAddress,
      
      // Business Information
      marketplaceName: marketplaceData.marketplaceName,
      marketplaceType: marketplaceData.marketplaceType,
      businessEmail: marketplaceData.businessEmail || user.email,
      businessPhone: marketplaceData.businessPhone,
      description: marketplaceData.description,
      website: marketplaceData.website,
      
      // Financial Settings
      commissionRate: marketplaceData.commissionRate || 2.5, // Default 2.5%
      subscriptionFee: marketplaceData.subscriptionFee || 0,
      chainPreference: marketplaceData.chainPreference || 42161, // Arbitrum One
      preferredToken: marketplaceData.preferredToken || 'PYUSD',
      
      // Escrow Settings
      autoRelease: marketplaceData.autoRelease !== false, // Default true
      autoReleaseHours: marketplaceData.autoReleaseHours || 72, // Default 72 hours
      
      // Integration
      webhookUrl: marketplaceData.webhookUrl,
      apiKeyHash,
      
      // Initial stats
      totalEarnings: 0,
      totalCommissions: 0,
      totalSubscriptionRevenue: 0,
      activeMerchants: 0,
      totalTransactions: 0,
      
      // Status
      isActive: true,
      isVerified: false // Marketplaces need manual verification
    });

    await newMarketplace.save();
    console.log('✅ Marketplace Create API: Marketplace created successfully:', newMarketplace._id);

    // Update user to marketplace owner
    await UserModel.findByIdAndUpdate(decoded.userId, {
      userType: 'marketplace_owner',
      onboardingCompleted: true,
      updatedAt: new Date()
    });

    console.log('✅ Marketplace Create API: User updated to marketplace_owner');

    return NextResponse.json({
      success: true,
      message: 'Marketplace created successfully',
      marketplace: {
        id: newMarketplace._id,
        marketplaceName: newMarketplace.marketplaceName,
        marketplaceType: newMarketplace.marketplaceType,
        businessEmail: newMarketplace.businessEmail,
        commissionRate: newMarketplace.commissionRate,
        preferredToken: newMarketplace.preferredToken,
        walletAddress: newMarketplace.walletAddress,
        isActive: newMarketplace.isActive,
        isVerified: newMarketplace.isVerified,
        totalEarnings: newMarketplace.totalEarnings,
        activeMerchants: newMarketplace.activeMerchants,
        createdAt: newMarketplace.createdAt
      },
      apiKey // Return API key only once during creation (store this securely!)
    });

  } catch (error) {
    console.error('💥 Marketplace Create API: Error creating marketplace:', error);
    
    // Handle duplicate key errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({
        error: 'Marketplace name already exists',
        details: 'Please choose a different marketplace name'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to create marketplace',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}