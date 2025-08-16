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

// TODO: Create MerchantModel - For now using placeholder data
const getMerchantData = (merchantId: string) => {
  // Placeholder merchant data - replace with actual database queries
  const merchants = {
    'merchant1': {
      id: 'merchant1',
      merchantName: 'Sample Electronics Store',
      ensName: null,
      walletAddress: '0x742d35Cc6638Fd8593742d35Cc6638Fd8593',
      status: 'active',
      joinedAt: '2025-08-10T00:00:00Z',
      totalSales: 1250.00,
      commissionOwed: 31.25,
      commissionPaid: 95.75,
      lastPayoutDate: '2025-08-01T00:00:00Z',
      productsCount: 15,
      ordersCount: 42,
      disputesCount: 1,
      rating: 4.8,
      businessEmail: 'electronics@example.com',
      businessPhone: '+1-555-0123',
      description: 'Premium electronics and gadgets marketplace',
      category: 'Electronics',
      website: 'https://electronics-store.example.com'
    },
    'merchant2': {
      id: 'merchant2',
      merchantName: 'Artisan Crafts Co',
      ensName: 'artisan.eth',
      walletAddress: '0x123d35Cc6638Fd8593742d35Cc6638Fd8593',
      status: 'active',
      joinedAt: '2025-08-05T00:00:00Z',
      totalSales: 890.00,
      commissionOwed: 22.25,
      commissionPaid: 67.50,
      lastPayoutDate: '2025-07-28T00:00:00Z',
      productsCount: 8,
      ordersCount: 28,
      disputesCount: 0,
      rating: 4.9,
      businessEmail: 'hello@artisancrafts.com',
      businessPhone: '+1-555-0456',
      description: 'Handmade crafts and artisan goods',
      category: 'Arts & Crafts',
      website: 'https://artisancrafts.com'
    },
    'merchant3': {
      id: 'merchant3',
      merchantName: 'Digital Services Hub',
      ensName: null,
      walletAddress: '0x456d35Cc6638Fd8593742d35Cc6638Fd8593',
      status: 'pending',
      joinedAt: '2025-08-14T00:00:00Z',
      totalSales: 0,
      commissionOwed: 0,
      commissionPaid: 0,
      lastPayoutDate: null,
      productsCount: 3,
      ordersCount: 0,
      disputesCount: 0,
      rating: 0,
      businessEmail: 'support@digitalservices.com',
      businessPhone: '+1-555-0789',
      description: 'Digital marketing and web services',
      category: 'Digital Services',
      website: 'https://digitalservices.com'
    }
  };
  
  return merchants[merchantId as keyof typeof merchants] || null;
};

// GET - Fetch individual merchant details
export async function GET(
  req: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    console.log('👤 Marketplace Merchant API: Fetching merchant details for:', params.merchantId);
    
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

    console.log('✅ Marketplace Merchant API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Find the marketplace to ensure user owns it
    const marketplace = await MarketplaceModel.findOne({ userId: decoded.userId });
    if (!marketplace) {
      return NextResponse.json({ error: 'Marketplace not found' }, { status: 404 });
    }

    // Get merchant data (TODO: Replace with actual MerchantModel query)
    const merchant = getMerchantData(params.merchantId);
    if (!merchant) {
      return NextResponse.json({ 
        error: 'Merchant not found',
        message: 'This merchant is not connected to your marketplace'
      }, { status: 404 });
    }

    console.log('✅ Marketplace Merchant API: Merchant found:', merchant.merchantName);

    // Calculate additional metrics
    const averageOrderValue = merchant.ordersCount > 0 
      ? (merchant.totalSales / merchant.ordersCount) 
      : 0;

    const commissionRate = marketplace.commissionRate;
    const totalCommissionGenerated = merchant.commissionOwed + merchant.commissionPaid;

    return NextResponse.json({
      success: true,
      merchant: {
        ...merchant,
        // Add calculated fields
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        commissionRate,
        totalCommissionGenerated: parseFloat(totalCommissionGenerated.toFixed(2)),
        
        // Performance metrics
        performance: {
          conversionRate: merchant.ordersCount > 0 ? 85 : 0, // TODO: Calculate from actual data
          customerSatisfaction: merchant.rating,
          responseTime: '2.3 hours', // TODO: Calculate from actual data
          disputeRate: merchant.ordersCount > 0 
            ? parseFloat(((merchant.disputesCount / merchant.ordersCount) * 100).toFixed(2))
            : 0
        },
        
        // Status info
        daysActive: Math.floor((new Date().getTime() - new Date(merchant.joinedAt).getTime()) / (1000 * 60 * 60 * 24)),
        lastActivity: merchant.lastPayoutDate || merchant.joinedAt,
        
        // Marketplace context
        marketplaceCommissionRate: commissionRate,
        marketplaceName: marketplace.marketplaceName
      }
    });

  } catch (error) {
    console.error('💥 Marketplace Merchant API: Error fetching merchant:', error);
    return NextResponse.json({
      error: 'Failed to fetch merchant details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update merchant status or settings
export async function PUT(
  req: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    console.log('📝 Marketplace Merchant API: Updating merchant:', params.merchantId);
    
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

    // Find the marketplace to ensure user owns it
    const marketplace = await MarketplaceModel.findOne({ userId: decoded.userId });
    if (!marketplace) {
      return NextResponse.json({ error: 'Marketplace not found' }, { status: 404 });
    }

    const updateData = await req.json();
    console.log('📋 Marketplace Merchant API: Update data:', updateData);

    // Get current merchant data
    const merchant = getMerchantData(params.merchantId);
    if (!merchant) {
      return NextResponse.json({ 
        error: 'Merchant not found'
      }, { status: 404 });
    }

    // Validate update data
    const allowedUpdates = ['status', 'notes', 'customCommissionRate'];
    const updateKeys = Object.keys(updateData);
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

    if (!isValidUpdate) {
      return NextResponse.json({ 
        error: 'Invalid update fields',
        details: `Allowed fields: ${allowedUpdates.join(', ')}`
      }, { status: 400 });
    }

    // Validate status if being updated
    if (updateData.status && !['active', 'pending', 'suspended', 'rejected'].includes(updateData.status)) {
      return NextResponse.json({ 
        error: 'Invalid status',
        details: 'Status must be: active, pending, suspended, or rejected'
      }, { status: 400 });
    }

    // TODO: Update actual MerchantModel in database
    // For now, simulate the update
    const updatedMerchant = {
      ...merchant,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    console.log('✅ Marketplace Merchant API: Merchant updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Merchant updated successfully',
      merchant: updatedMerchant
    });

  } catch (error) {
    console.error('💥 Marketplace Merchant API: Update error:', error);
    return NextResponse.json({
      error: 'Failed to update merchant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove/suspend merchant from marketplace
export async function DELETE(
  req: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    console.log('🗑️ Marketplace Merchant API: Removing merchant:', params.merchantId);
    
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

    // Find the marketplace to ensure user owns it
    const marketplace = await MarketplaceModel.findOne({ userId: decoded.userId });
    if (!marketplace) {
      return NextResponse.json({ error: 'Marketplace not found' }, { status: 404 });
    }

    // Get merchant data to check if they exist
    const merchant = getMerchantData(params.merchantId);
    if (!merchant) {
      return NextResponse.json({ 
        error: 'Merchant not found'
      }, { status: 404 });
    }

    // Check if merchant has outstanding commission owed
    if (merchant.commissionOwed > 0) {
      return NextResponse.json({ 
        error: 'Cannot remove merchant with outstanding commission',
        details: `Please process final payout of $${merchant.commissionOwed.toFixed(2)} before removing merchant`
      }, { status: 400 });
    }

    // TODO: Update actual MerchantModel to set status to 'removed'
    // For now, simulate the removal
    console.log('✅ Marketplace Merchant API: Merchant removed from marketplace');

    return NextResponse.json({
      success: true,
      message: 'Merchant removed from marketplace successfully',
      merchantId: params.merchantId,
      finalCommissionPaid: merchant.commissionPaid,
      removedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Marketplace Merchant API: Delete error:', error);
    return NextResponse.json({
      error: 'Failed to remove merchant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}