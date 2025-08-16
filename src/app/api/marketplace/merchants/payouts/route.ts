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

// Mock merchant data with payout info
const getMerchantsWithPayouts = () => {
  return [
    {
      id: 'merchant1',
      merchantName: 'Sample Electronics Store',
      ensName: null,
      walletAddress: '0x742d35Cc6638Fd8593742d35Cc6638Fd8593',
      status: 'active',
      totalSales: 1250.00,
      commissionOwed: 31.25,
      commissionPaid: 95.75,
      lastPayoutDate: '2025-08-01T00:00:00Z',
      payoutSchedule: 'weekly',
      minimumPayout: 25.00,
      payoutMethod: 'crypto',
      ordersCount: 42,
      joinedAt: '2025-08-10T00:00:00Z'
    },
    {
      id: 'merchant2',
      merchantName: 'Artisan Crafts Co',
      ensName: 'artisan.eth',
      walletAddress: '0x123d35Cc6638Fd8593742d35Cc6638Fd8593',
      status: 'active',
      totalSales: 890.00,
      commissionOwed: 22.25,
      commissionPaid: 67.50,
      lastPayoutDate: '2025-07-28T00:00:00Z',
      payoutSchedule: 'monthly',
      minimumPayout: 20.00,
      payoutMethod: 'crypto',
      ordersCount: 28,
      joinedAt: '2025-08-05T00:00:00Z'
    },
    {
      id: 'merchant3',
      merchantName: 'Digital Services Hub',
      ensName: null,
      walletAddress: '0x456d35Cc6638Fd8593742d35Cc6638Fd8593',
      status: 'pending',
      totalSales: 0,
      commissionOwed: 0,
      commissionPaid: 0,
      lastPayoutDate: null,
      payoutSchedule: 'weekly',
      minimumPayout: 50.00,
      payoutMethod: 'crypto',
      ordersCount: 0,
      joinedAt: '2025-08-14T00:00:00Z'
    }
  ];
};

// Mock payout history
const getPayoutHistory = () => {
  return [
    {
      id: 'payout1',
      merchantId: 'merchant1',
      merchantName: 'Sample Electronics Store',
      amount: 75.00,
      status: 'completed',
      transactionHash: '0xabc123def456789012345678901234567890abcdef123456789012345678901234',
      processedAt: '2025-08-01T16:45:00Z',
      payoutMethod: 'crypto',
      gasUsed: 0.0025,
      notes: 'Weekly payout - 30 orders'
    },
    {
      id: 'payout2',
      merchantId: 'merchant2',
      merchantName: 'Artisan Crafts Co',
      amount: 45.25,
      status: 'completed',
      transactionHash: '0xdef456abc789012345678901234567890abcdef123456789012345678901234',
      processedAt: '2025-07-28T14:30:00Z',
      payoutMethod: 'crypto',
      gasUsed: 0.0025,
      notes: 'Monthly payout - 18 orders'
    },
    {
      id: 'payout3',
      merchantId: 'merchant1',
      merchantName: 'Sample Electronics Store',
      amount: 20.75,
      status: 'pending',
      transactionHash: null,
      processedAt: null,
      payoutMethod: 'crypto',
      gasUsed: 0,
      notes: 'Scheduled weekly payout'
    }
  ];
};

// GET - Fetch all payouts and pending payouts
export async function GET(req: NextRequest) {
  try {
    console.log('💸 Marketplace Payouts API: Fetching payout data...');
    
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

    console.log('✅ Marketplace Payouts API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Find the marketplace to ensure user owns it
    const marketplace = await MarketplaceModel.findOne({ userId: decoded.userId });
    if (!marketplace) {
      return NextResponse.json({ error: 'Marketplace not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'pending', 'completed', 'failed'
    const merchantId = searchParams.get('merchantId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get merchants with payout data
    const merchants = getMerchantsWithPayouts();
    
    // Get payout history
    let payoutHistory = getPayoutHistory();

    // Filter by merchant if specified
    if (merchantId) {
      payoutHistory = payoutHistory.filter(payout => payout.merchantId === merchantId);
    }

    // Filter by status if specified
    if (status) {
      payoutHistory = payoutHistory.filter(payout => payout.status === status);
    }

    // Apply pagination
    const paginatedPayouts = payoutHistory.slice(offset, offset + limit);

    // Calculate summary statistics
    const totalPendingAmount = merchants.reduce((sum, merchant) => sum + merchant.commissionOwed, 0);
    const totalPaidAmount = merchants.reduce((sum, merchant) => sum + merchant.commissionPaid, 0);
    const merchantsWithPendingPayouts = merchants.filter(merchant => merchant.commissionOwed > 0).length;

    const completedPayouts = payoutHistory.filter(p => p.status === 'completed');
    const pendingPayouts = payoutHistory.filter(p => p.status === 'pending');
    const failedPayouts = payoutHistory.filter(p => p.status === 'failed');

    console.log(`✅ Marketplace Payouts API: Found ${payoutHistory.length} payouts, ${merchants.length} merchants`);

    return NextResponse.json({
      success: true,
      summary: {
        totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2)),
        totalPaidAmount: parseFloat(totalPaidAmount.toFixed(2)),
        merchantsWithPendingPayouts,
        totalMerchants: merchants.length,
        completedPayoutsCount: completedPayouts.length,
        pendingPayoutsCount: pendingPayouts.length,
        failedPayoutsCount: failedPayouts.length,
        averagePayoutAmount: completedPayouts.length > 0 
          ? parseFloat((completedPayouts.reduce((sum, p) => sum + p.amount, 0) / completedPayouts.length).toFixed(2))
          : 0
      },
      merchants: merchants.map(merchant => ({
        id: merchant.id,
        merchantName: merchant.merchantName,
        ensName: merchant.ensName,
        walletAddress: merchant.walletAddress,
        status: merchant.status,
        commissionOwed: merchant.commissionOwed,
        commissionPaid: merchant.commissionPaid,
        lastPayoutDate: merchant.lastPayoutDate,
        payoutSchedule: merchant.payoutSchedule,
        minimumPayout: merchant.minimumPayout,
        payoutMethod: merchant.payoutMethod,
        isEligibleForPayout: merchant.commissionOwed >= merchant.minimumPayout && merchant.status === 'active'
      })),
      payouts: paginatedPayouts,
      pagination: {
        total: payoutHistory.length,
        limit,
        offset,
        hasMore: offset + limit < payoutHistory.length
      },
      marketplace: {
        id: marketplace._id,
        name: marketplace.marketplaceName,
        commissionRate: marketplace.commissionRate,
        preferredToken: marketplace.preferredToken
      }
    });

  } catch (error) {
    console.error('💥 Marketplace Payouts API: Error fetching payouts:', error);
    return NextResponse.json({
      error: 'Failed to fetch payout data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Process payouts (single or batch)
export async function POST(req: NextRequest) {
  try {
    console.log('💸 Marketplace Payouts API: Processing payouts...');
    
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

    // Find the marketplace
    const marketplace = await MarketplaceModel.findOne({ userId: decoded.userId });
    if (!marketplace) {
      return NextResponse.json({ error: 'Marketplace not found' }, { status: 404 });
    }

    const payoutData = await req.json();
    console.log('📋 Marketplace Payouts API: Payout request:', payoutData);

    const { merchantIds, payoutType = 'manual', notes } = payoutData;

    // Validate input
    if (!merchantIds || !Array.isArray(merchantIds) || merchantIds.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid merchant IDs',
        details: 'merchantIds must be a non-empty array'
      }, { status: 400 });
    }

    // Get merchants and validate they exist and are eligible
    const merchants = getMerchantsWithPayouts();
    const eligibleMerchants = merchants.filter(merchant => 
      merchantIds.includes(merchant.id) && 
      merchant.commissionOwed >= merchant.minimumPayout &&
      merchant.status === 'active'
    );

    if (eligibleMerchants.length === 0) {
      return NextResponse.json({ 
        error: 'No eligible merchants for payout',
        details: 'Merchants must be active and meet minimum payout threshold'
      }, { status: 400 });
    }

    // Calculate total payout amount
    const totalPayoutAmount = eligibleMerchants.reduce((sum, merchant) => sum + merchant.commissionOwed, 0);

    // Check if marketplace has sufficient balance (TODO: implement actual balance check)
    const marketplaceBalance = marketplace.totalEarnings;
    if (totalPayoutAmount > marketplaceBalance) {
      return NextResponse.json({ 
        error: 'Insufficient marketplace balance',
        details: `Payout amount ($${totalPayoutAmount.toFixed(2)}) exceeds available balance ($${marketplaceBalance.toFixed(2)})`
      }, { status: 400 });
    }

    // Process payouts
    const processedPayouts = [];
    const failedPayouts = [];

    for (const merchant of eligibleMerchants) {
      try {
        // TODO: Implement actual blockchain transaction
        // For now, simulate successful payout
        const mockTransactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        
        const payout = {
          id: `payout_${Date.now()}_${merchant.id}`,
          merchantId: merchant.id,
          merchantName: merchant.merchantName,
          walletAddress: merchant.walletAddress,
          amount: merchant.commissionOwed,
          status: 'completed',
          transactionHash: mockTransactionHash,
          processedAt: new Date().toISOString(),
          payoutMethod: merchant.payoutMethod,
          gasUsed: 0.0025, // Mock gas cost
          notes: notes || `${payoutType} payout processed`,
          marketplaceId: marketplace._id
        };

        processedPayouts.push(payout);

        // TODO: Update merchant commission owed in database
        // TODO: Update marketplace balance
        
        console.log(`✅ Payout processed for ${merchant.merchantName}: $${merchant.commissionOwed}`);

      } catch (error) {
        console.error(`❌ Payout failed for ${merchant.merchantName}:`, error);
        failedPayouts.push({
          merchantId: merchant.id,
          merchantName: merchant.merchantName,
          amount: merchant.commissionOwed,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update marketplace stats
    const totalProcessed = processedPayouts.reduce((sum, p) => sum + p.amount, 0);
    
    // TODO: Update MarketplaceModel with new stats
    console.log(`✅ Marketplace Payouts API: Processed ${processedPayouts.length} payouts totaling $${totalProcessed.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedPayouts.length} payouts`,
      summary: {
        totalProcessed: processedPayouts.length,
        totalFailed: failedPayouts.length,
        totalAmount: parseFloat(totalProcessed.toFixed(2)),
        totalGasCost: parseFloat((processedPayouts.length * 0.0025).toFixed(4))
      },
      processedPayouts,
      failedPayouts: failedPayouts.length > 0 ? failedPayouts : undefined,
      marketplace: {
        id: marketplace._id,
        name: marketplace.marketplaceName,
        newBalance: parseFloat((marketplaceBalance - totalProcessed).toFixed(2))
      }
    });

  } catch (error) {
    console.error('💥 Marketplace Payouts API: Error processing payouts:', error);
    return NextResponse.json({
      error: 'Failed to process payouts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}