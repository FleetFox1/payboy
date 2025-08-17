import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { MarketplaceModel } from "@/models/MarketplaceModel";
import mongoose from 'mongoose';
import crypto from 'crypto';

// ✅ DEMO MODE: Same User schema from auth API
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

// ✅ DEMO MODE: Auth bypass utility (same as store route)
function createDemoUser(req: NextRequest, body: any) {
  console.log('🎭 DEMO MODE: Creating demo user for marketplace');
  
  const authHeader = req.headers.get('authorization');
  let userId = body.userId || body.privyId;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('🎭 DEMO MODE: Found auth token, extracting user ID');
    userId = userId || `user_${token.substring(0, 8)}`;
  }
  
  userId = userId || `demo_marketplace_${Date.now()}`;
  
  const demoUser = {
    id: userId,
    privyId: userId,
    email: body.email || `${userId}@demo.com`,
    userType: 'marketplace_owner',
    wallet: { address: body.walletAddress || `0x${Math.random().toString(16).substr(2, 40)}` }
  };
  
  console.log('🎭 DEMO MODE: Created demo user:', { id: demoUser.id, email: demoUser.email });
  return demoUser;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 DEMO MODE: Starting marketplace creation (auth bypassed)');
    
    // Connect to database
    await connectToMongoDB();

    // Get request data
    const body = await req.json();
    console.log('📦 DEMO MODE: Request body received:', Object.keys(body));
    
    // ✅ DEMO MODE: Use demo user instead of JWT verification
    const user = createDemoUser(req, body);
    console.log('👤 DEMO MODE: Using demo user:', user.id);

    console.log('📋 DEMO MODE: Marketplace data received:', {
      marketplaceName: body.marketplaceName,
      marketplaceType: body.marketplaceType,
      commissionRate: body.commissionRate
    });

    // Validate required fields
    if (!body.marketplaceName || !body.marketplaceType) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'marketplaceName and marketplaceType are required'
      }, { status: 400 });
    }

    // Validate commission rate
    if (body.commissionRate && (body.commissionRate < 0 || body.commissionRate > 50)) {
      return NextResponse.json({ 
        error: 'Invalid commission rate',
        details: 'Commission rate must be between 0% and 50%'
      }, { status: 400 });
    }

    // ✅ DEMO MODE: Check if marketplace already exists (allow updates)
    const existingMarketplace = await MarketplaceModel.findOne({ userId: user.id });
    if (existingMarketplace) {
      console.log('🔄 DEMO MODE: Marketplace exists, updating instead of blocking');
      
      // Update existing marketplace
      existingMarketplace.marketplaceName = body.marketplaceName;
      existingMarketplace.marketplaceType = body.marketplaceType;
      existingMarketplace.businessEmail = body.businessEmail || user.email;
      existingMarketplace.businessPhone = body.businessPhone;
      existingMarketplace.description = body.description;
      existingMarketplace.website = body.website;
      existingMarketplace.commissionRate = body.commissionRate || 2.5;
      existingMarketplace.subscriptionFee = body.subscriptionFee || 0;
      existingMarketplace.chainPreference = body.chainPreference || 42161;
      existingMarketplace.preferredToken = body.preferredToken || 'PYUSD';
      existingMarketplace.autoRelease = body.autoRelease !== false;
      existingMarketplace.autoReleaseHours = body.autoReleaseHours || 72;
      existingMarketplace.webhookUrl = body.webhookUrl;
      
      await existingMarketplace.save();
      
      const responseData = {
        success: true,
        message: 'Marketplace updated successfully (demo mode)',
        marketplace: {
          id: existingMarketplace._id,
          marketplaceName: existingMarketplace.marketplaceName,
          marketplaceType: existingMarketplace.marketplaceType,
          businessEmail: existingMarketplace.businessEmail,
          commissionRate: existingMarketplace.commissionRate,
          preferredToken: existingMarketplace.preferredToken,
          walletAddress: existingMarketplace.walletAddress,
          isActive: existingMarketplace.isActive,
          isVerified: existingMarketplace.isVerified,
          totalEarnings: existingMarketplace.totalEarnings,
          activeMerchants: existingMarketplace.activeMerchants,
          createdAt: existingMarketplace.createdAt,
          updatedAt: existingMarketplace.updatedAt
        }
      };
      
      console.log('✅ DEMO MODE: Marketplace updated successfully:', responseData.marketplace.id);
      return NextResponse.json(responseData, { status: 200 });
    }

    // Find or create user
    let existingUser = await UserModel.findOne({ privyId: user.privyId });
    if (!existingUser) {
      console.log('➕ DEMO MODE: Creating new marketplace user');
      existingUser = new UserModel({
        privyId: user.privyId,
        email: user.email,
        walletAddress: user.wallet?.address,
        userType: 'marketplace_owner',
        onboardingCompleted: true
      });
      await existingUser.save();
    }

    // Generate API key for marketplace integrations
    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Create new marketplace
    const newMarketplace = new MarketplaceModel({
      userId: user.id,
      privyId: user.privyId,
      walletAddress: user.wallet?.address,
      
      // Business Information
      marketplaceName: body.marketplaceName,
      marketplaceType: body.marketplaceType,
      businessEmail: body.businessEmail || user.email,
      businessPhone: body.businessPhone,
      description: body.description,
      website: body.website,
      
      // Financial Settings
      commissionRate: body.commissionRate || 2.5, // Default 2.5%
      subscriptionFee: body.subscriptionFee || 0,
      chainPreference: body.chainPreference || 42161, // Arbitrum One
      preferredToken: body.preferredToken || 'PYUSD',
      
      // Escrow Settings
      autoRelease: body.autoRelease !== false, // Default true
      autoReleaseHours: body.autoReleaseHours || 72, // Default 72 hours
      
      // Integration
      webhookUrl: body.webhookUrl,
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
    console.log('✅ DEMO MODE: Marketplace created successfully:', newMarketplace._id);

    // Update user to marketplace owner
    await UserModel.findByIdAndUpdate(existingUser._id, {
      userType: 'marketplace_owner',
      onboardingCompleted: true,
      updatedAt: new Date()
    });

    console.log('✅ DEMO MODE: User updated to marketplace_owner');

    return NextResponse.json({
      success: true,
      message: 'Marketplace created successfully (demo mode)',
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
    console.error('💥 DEMO MODE: Marketplace creation error:', error);
    
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