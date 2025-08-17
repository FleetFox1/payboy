import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { MarketplaceModel } from "@/models/MarketplaceModel";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    console.log('📈 Marketplace Stats API: Fetching analytics...');
    
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

    console.log('✅ Marketplace Stats API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Find the marketplace
    const marketplace = await MarketplaceModel.findOne({ userId: decoded.userId });
    if (!marketplace) {
      return NextResponse.json({ error: 'Marketplace not found' }, { status: 404 });
    }

    console.log('✅ Marketplace Stats API: Marketplace found:', marketplace.marketplaceName);

    // Calculate time periods
    const now = new Date();
    const marketplaceCreated = marketplace.createdAt;

    // Calculate marketplace age in days
    const marketplaceAgeDays = Math.floor((now.getTime() - marketplaceCreated.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate average commission per transaction
    const averageCommission = marketplace.totalTransactions > 0 
      ? (marketplace.totalCommissions / marketplace.totalTransactions)
      : 0;

    // Calculate average transaction value
    const averageTransactionValue = marketplace.totalTransactions > 0 
      ? (marketplace.totalEarnings / marketplace.totalTransactions)
      : 0;

    // Mock growth data (TODO: Calculate from actual historical data)
    const mockGrowthData = {
      merchantsThisMonth: Math.floor(marketplace.activeMerchants * 0.3),
      revenueThisMonth: marketplace.totalEarnings * 0.25,
      ordersThisMonth: Math.floor(marketplace.totalTransactions * 0.3),
      merchantsLastMonth: Math.floor(marketplace.activeMerchants * 0.2),
      revenueLastMonth: marketplace.totalEarnings * 0.18,
      ordersLastMonth: Math.floor(marketplace.totalTransactions * 0.22)
    };

    // Calculate growth percentages
    const merchantGrowth = mockGrowthData.merchantsLastMonth > 0 
      ? ((mockGrowthData.merchantsThisMonth - mockGrowthData.merchantsLastMonth) / mockGrowthData.merchantsLastMonth) * 100
      : 0;

    const revenueGrowth = mockGrowthData.revenueLastMonth > 0 
      ? ((mockGrowthData.revenueThisMonth - mockGrowthData.revenueLastMonth) / mockGrowthData.revenueLastMonth) * 100
      : 0;

    const orderGrowth = mockGrowthData.ordersLastMonth > 0 
      ? ((mockGrowthData.ordersThisMonth - mockGrowthData.ordersLastMonth) / mockGrowthData.ordersLastMonth) * 100
      : 0;

    // Basic stats from marketplace model
    const stats = {
      // Overview Metrics
      totalEarnings: marketplace.totalEarnings,
      totalCommissions: marketplace.totalCommissions,
      totalSubscriptionRevenue: marketplace.totalSubscriptionRevenue,
      netRevenue: marketplace.totalCommissions + marketplace.totalSubscriptionRevenue,
      
      // Merchant Metrics
      activeMerchants: marketplace.activeMerchants,
      pendingMerchants: 3, // TODO: Calculate from merchant records
      suspendedMerchants: 1, // TODO: Calculate from merchant records
      totalMerchants: marketplace.activeMerchants + 4, // TODO: Calculate total
      
      // Transaction Metrics
      totalOrders: marketplace.totalTransactions,
      averageOrderValue: parseFloat(averageTransactionValue.toFixed(2)),
      averageCommission: parseFloat(averageCommission.toFixed(2)),
      
      // Product & Content
      totalProducts: 125, // TODO: Calculate from product records
      totalCategories: 8, // TODO: Calculate from category records
      featuredProducts: 12, // TODO: Calculate from featured products
      
      // Customer Metrics
      totalCustomers: 156, // TODO: Calculate from customer records
      returningCustomers: 89, // TODO: Calculate from repeat purchases
      customerSatisfaction: 4.6, // TODO: Calculate from review ratings
      
      // Dispute & Support
      disputesOpen: 2, // TODO: Calculate from dispute records
      disputesResolved: 8, // TODO: Calculate from resolved disputes
      averageResolutionTime: '2.3 days', // TODO: Calculate from actual data
      
      // Marketplace Identity
      marketplaceName: marketplace.marketplaceName,
      marketplaceType: marketplace.marketplaceType,
      commissionRate: marketplace.commissionRate,
      subscriptionFee: marketplace.subscriptionFee,
      isVerified: marketplace.isVerified,
      isActive: marketplace.isActive,
      
      // Time-based metrics
      marketplaceAge: {
        days: marketplaceAgeDays,
        weeks: Math.floor(marketplaceAgeDays / 7),
        months: Math.floor(marketplaceAgeDays / 30)
      },
      
      // Growth indicators
      monthlyGrowth: {
        merchants: parseFloat(merchantGrowth.toFixed(1)),
        revenue: parseFloat(revenueGrowth.toFixed(1)),
        orders: parseFloat(orderGrowth.toFixed(1)),
        merchantsThisMonth: mockGrowthData.merchantsThisMonth,
        revenueThisMonth: parseFloat(mockGrowthData.revenueThisMonth.toFixed(2)),
        ordersThisMonth: mockGrowthData.ordersThisMonth
      },
      
      // Performance Metrics
      performance: {
        revenueGoal: 10000, // TODO: Make this configurable per marketplace
        revenueProgress: Math.min(100, (marketplace.totalEarnings / 10000) * 100),
        merchantGoal: 50, // TODO: Make this configurable per marketplace
        merchantProgress: Math.min(100, (marketplace.activeMerchants / 50) * 100),
        conversionRate: 12.4, // TODO: Calculate from actual visitor/buyer data
        merchantRetentionRate: 94.2 // TODO: Calculate from merchant activity
      },
      
      // Status indicators
      status: {
        hasWebhook: !!marketplace.webhookUrl,
        hasDescription: !!marketplace.description,
        hasWebsite: !!marketplace.website,
        hasPhone: !!marketplace.businessPhone,
        profileCompletion: calculateProfileCompletion(marketplace),
        apiIntegration: !!marketplace.apiKeyHash,
        escrowEnabled: marketplace.autoRelease
      },
      
      // Financial Health
      financialHealth: {
        cashFlow: 'positive', // TODO: Calculate based on actual data
        averagePayoutTime: '24 hours', // TODO: Calculate from payout data
        pendingPayouts: 3, // TODO: Count from actual pending payouts
        totalPayoutVolume: 2847.50 // TODO: Calculate from payout history
      }
    };

    return NextResponse.json({
      success: true,
      stats,
      marketplace: {
        id: marketplace._id,
        marketplaceName: marketplace.marketplaceName,
        marketplaceType: marketplace.marketplaceType,
        businessEmail: marketplace.businessEmail,
        commissionRate: marketplace.commissionRate,
        isActive: marketplace.isActive,
        isVerified: marketplace.isVerified,
        createdAt: marketplace.createdAt,
        walletAddress: marketplace.walletAddress,
        preferredToken: marketplace.preferredToken
      }
    });

  } catch (error) {
    console.error('💥 Marketplace Stats API: Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch marketplace statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper to calculate profile completion percentage
function calculateProfileCompletion(marketplace: any): number {
  const fields = [
    marketplace.marketplaceName,    // Required, should always be present
    marketplace.businessEmail,      // Required, should always be present
    marketplace.description,        // Optional
    marketplace.website,            // Optional
    marketplace.businessPhone,      // Optional
    marketplace.webhookUrl,         // Optional
    marketplace.apiKeyHash          // Optional (API integration)
  ];

  const completedFields = fields.filter(field => field && field.trim() !== '').length;
  return Math.round((completedFields / fields.length) * 100);
}