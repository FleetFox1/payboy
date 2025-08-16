import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { MarketplaceModel } from "@/models/MarketplaceModel";
import { verifyJWT } from "@/lib/auth";
import mongoose from 'mongoose';

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📊 Marketplace ID API: Fetching marketplace data for ID:', params.id);
    
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

    console.log('✅ Marketplace ID API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Find the marketplace by ID and verify ownership
    // Support both MongoDB ObjectId and ENS name lookup
    let marketplace;
    
    try {
      // First try to find by MongoDB ID
      marketplace = await MarketplaceModel.findOne({
        _id: params.id,
        userId: decoded.userId // Ensure user owns this marketplace
      });
    } catch (err) {
      // If ID is not valid ObjectId, it might be an ENS name
      console.log('🔍 Marketplace ID API: Not a valid ObjectId, checking for ENS...');
    }

    // If not found by ID, try ENS name (future feature)
    if (!marketplace && params.id.includes('.')) {
      // TODO: Add ENS support for marketplaces
      // marketplace = await MarketplaceModel.findOne({
      //   ensName: params.id,
      //   userId: decoded.userId
      // });
      console.log('🔍 Marketplace ID API: ENS lookup not yet implemented');
    }

    if (!marketplace) {
      return NextResponse.json({ 
        error: 'Marketplace not found',
        message: 'Marketplace not found or you do not have permission to access it'
      }, { status: 404 });
    }

    console.log('✅ Marketplace ID API: Marketplace found:', marketplace.marketplaceName);

    // Get associated user data
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return full marketplace data (since this is authenticated and user owns the marketplace)
    return NextResponse.json({
      success: true,
      marketplace: {
        id: marketplace._id,
        marketplaceName: marketplace.marketplaceName,
        marketplaceType: marketplace.marketplaceType,
        businessEmail: marketplace.businessEmail,
        businessPhone: marketplace.businessPhone,
        description: marketplace.description,
        website: marketplace.website,
        walletAddress: marketplace.walletAddress,
        
        // Financial Settings
        commissionRate: marketplace.commissionRate,
        subscriptionFee: marketplace.subscriptionFee,
        chainPreference: marketplace.chainPreference,
        preferredToken: marketplace.preferredToken,
        
        // Escrow Settings
        autoRelease: marketplace.autoRelease,
        autoReleaseHours: marketplace.autoReleaseHours,
        
        // Integration
        webhookUrl: marketplace.webhookUrl,
        // Note: We don't return apiKeyHash for security
        
        // Stats
        totalEarnings: marketplace.totalEarnings,
        totalCommissions: marketplace.totalCommissions,
        totalSubscriptionRevenue: marketplace.totalSubscriptionRevenue,
        activeMerchants: marketplace.activeMerchants,
        totalTransactions: marketplace.totalTransactions,
        
        // Status
        isActive: marketplace.isActive,
        isVerified: marketplace.isVerified,
        
        // Timestamps
        createdAt: marketplace.createdAt,
        updatedAt: marketplace.updatedAt
      },
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        isVerified: user.isVerified,
        payoutMethods: user.payoutMethods,
        balance: user.balance
      }
    });

  } catch (error) {
    console.error('💥 Marketplace ID API: Error fetching marketplace:', error);
    return NextResponse.json({
      error: 'Failed to fetch marketplace data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT method to update marketplace
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Marketplace ID API: Updating marketplace:', params.id);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToMongoDB();

    const updateData = await req.json();
    
    // Validate commission rate if being updated
    if (updateData.commissionRate !== undefined) {
      if (updateData.commissionRate < 0 || updateData.commissionRate > 50) {
        return NextResponse.json({ 
          error: 'Invalid commission rate',
          details: 'Commission rate must be between 0% and 50%'
        }, { status: 400 });
      }
    }

    // Validate auto release hours if being updated
    if (updateData.autoReleaseHours !== undefined) {
      if (updateData.autoReleaseHours < 1 || updateData.autoReleaseHours > 720) { // Max 30 days
        return NextResponse.json({ 
          error: 'Invalid auto release hours',
          details: 'Auto release hours must be between 1 and 720 (30 days)'
        }, { status: 400 });
      }
    }

    // Find and update marketplace (ensure user owns it)
    const updatedMarketplace = await MarketplaceModel.findOneAndUpdate(
      { 
        _id: params.id,
        userId: decoded.userId // Security: only update if user owns the marketplace
      },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedMarketplace) {
      return NextResponse.json({ 
        error: 'Marketplace not found or permission denied',
        message: 'Marketplace not found or you do not have permission to update it'
      }, { status: 404 });
    }

    console.log('✅ Marketplace ID API: Marketplace updated:', updatedMarketplace.marketplaceName);

    return NextResponse.json({
      success: true,
      message: 'Marketplace updated successfully',
      marketplace: {
        id: updatedMarketplace._id,
        marketplaceName: updatedMarketplace.marketplaceName,
        marketplaceType: updatedMarketplace.marketplaceType,
        businessEmail: updatedMarketplace.businessEmail,
        businessPhone: updatedMarketplace.businessPhone,
        description: updatedMarketplace.description,
        website: updatedMarketplace.website,
        walletAddress: updatedMarketplace.walletAddress,
        commissionRate: updatedMarketplace.commissionRate,
        subscriptionFee: updatedMarketplace.subscriptionFee,
        chainPreference: updatedMarketplace.chainPreference,
        preferredToken: updatedMarketplace.preferredToken,
        autoRelease: updatedMarketplace.autoRelease,
        autoReleaseHours: updatedMarketplace.autoReleaseHours,
        webhookUrl: updatedMarketplace.webhookUrl,
        totalEarnings: updatedMarketplace.totalEarnings,
        totalCommissions: updatedMarketplace.totalCommissions,
        totalSubscriptionRevenue: updatedMarketplace.totalSubscriptionRevenue,
        activeMerchants: updatedMarketplace.activeMerchants,
        totalTransactions: updatedMarketplace.totalTransactions,
        isActive: updatedMarketplace.isActive,
        isVerified: updatedMarketplace.isVerified,
        createdAt: updatedMarketplace.createdAt,
        updatedAt: updatedMarketplace.updatedAt
      }
    });

  } catch (error) {
    console.error('💥 Marketplace ID API: Update error:', error);
    return NextResponse.json({
      error: 'Failed to update marketplace',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE method to deactivate marketplace
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Marketplace ID API: Deactivating marketplace:', params.id);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToMongoDB();

    // Deactivate marketplace instead of deleting (preserve data)
    const deactivatedMarketplace = await MarketplaceModel.findOneAndUpdate(
      { 
        _id: params.id,
        userId: decoded.userId
      },
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!deactivatedMarketplace) {
      return NextResponse.json({ 
        error: 'Marketplace not found or permission denied'
      }, { status: 404 });
    }

    console.log('✅ Marketplace ID API: Marketplace deactivated:', deactivatedMarketplace.marketplaceName);

    return NextResponse.json({
      success: true,
      message: 'Marketplace deactivated successfully',
      marketplace: {
        id: deactivatedMarketplace._id,
        isActive: deactivatedMarketplace.isActive,
        updatedAt: deactivatedMarketplace.updatedAt
      }
    });

  } catch (error) {
    console.error('💥 Marketplace ID API: Delete error:', error);
    return NextResponse.json({
      error: 'Failed to deactivate marketplace',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}