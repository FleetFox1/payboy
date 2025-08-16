import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { MarketplaceModel } from "@/models/MarketplaceModel";

// GET - Public marketplace information (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    console.log('🌐 Public Marketplace API: Fetching public marketplace data for:', params.marketId);
    
    await connectToMongoDB();

    // Find marketplace by ID (supports both ObjectId and ENS names)
    let marketplace;
    
    try {
      // First try to find by MongoDB ID
      marketplace = await MarketplaceModel.findOne({
        _id: params.marketId,
        isActive: true // Only show active marketplaces
      });
    } catch (err) {
      // If ID is not valid ObjectId, it might be an ENS name
      console.log('🔍 Public Marketplace API: Not a valid ObjectId, checking for ENS...');
    }

    // If not found by ID, try ENS name (future feature)
    if (!marketplace && params.marketId.includes('.')) {
      // TODO: Add ENS support for marketplaces
      // marketplace = await MarketplaceModel.findOne({
      //   ensName: params.marketId,
      //   isActive: true
      // });
      console.log('🔍 Public Marketplace API: ENS lookup not yet implemented');
    }

    if (!marketplace) {
      return NextResponse.json({ 
        error: 'Marketplace not found',
        message: 'This marketplace is not available or has been deactivated'
      }, { status: 404 });
    }

    console.log('✅ Public Marketplace API: Marketplace found:', marketplace.marketplaceName);

    // Get additional public stats (TODO: implement from actual data)
    const publicStats = {
      totalMerchants: marketplace.activeMerchants,
      totalProducts: 0, // TODO: Calculate from products collection
      totalReviews: 0, // TODO: Calculate from reviews collection
      averageRating: 4.7, // TODO: Calculate from actual reviews
      categoriesCount: 8, // TODO: Calculate from product categories
      featuredMerchants: [], // TODO: Get from featured merchants
      recentActivity: [], // TODO: Get public activity feed
      supportedPayments: [marketplace.preferredToken], // Could expand this
      transactionVolume: marketplace.totalTransactions || 0
    };

    // Mock featured merchants (TODO: replace with actual data)
    const featuredMerchants = [
      {
        id: 'merchant1',
        name: 'Sample Electronics Store',
        ensName: null,
        category: 'Electronics',
        rating: 4.8,
        productsCount: 15,
        isVerified: true,
        joinedDate: '2025-08-10'
      },
      {
        id: 'merchant2',
        name: 'Artisan Crafts Co',
        ensName: 'artisan.eth',
        category: 'Arts & Crafts',
        rating: 4.9,
        productsCount: 8,
        isVerified: true,
        joinedDate: '2025-08-05'
      }
    ];

    // Mock categories (TODO: replace with actual data)
    const categories = [
      { name: 'Electronics', count: 45, icon: '📱' },
      { name: 'Arts & Crafts', count: 32, icon: '🎨' },
      { name: 'Digital Services', count: 28, icon: '💻' },
      { name: 'Fashion', count: 19, icon: '👕' },
      { name: 'Home & Garden', count: 15, icon: '🏡' },
      { name: 'Books & Media', count: 12, icon: '📚' },
      { name: 'Sports & Outdoors', count: 8, icon: '⚽' },
      { name: 'Other', count: 6, icon: '📦' }
    ];

    // Return only public information (no sensitive data)
    return NextResponse.json({
      success: true,
      marketplace: {
        // Basic Info
        id: marketplace._id,
        marketplaceName: marketplace.marketplaceName,
        marketplaceType: marketplace.marketplaceType,
        description: marketplace.description,
        website: marketplace.website,
        
        // Public Financial Info
        walletAddress: marketplace.walletAddress, // Needed for payments
        commissionRate: marketplace.commissionRate,
        preferredToken: marketplace.preferredToken,
        chainPreference: marketplace.chainPreference,
        
        // Status & Trust Indicators
        isVerified: marketplace.isVerified,
        isActive: marketplace.isActive,
        
        // Public Stats
        stats: {
          activeMerchants: marketplace.activeMerchants,
          totalTransactions: marketplace.totalTransactions,
          ...publicStats
        },
        
        // Operating Since
        createdAt: marketplace.createdAt,
        
        // Featured Content
        featuredMerchants: featuredMerchants.slice(0, 6), // Limit to 6 featured
        categories,
        
        // Payment & Technical Info
        paymentInfo: {
          acceptedTokens: [marketplace.preferredToken],
          chainId: marketplace.chainPreference,
          escrowEnabled: marketplace.autoRelease,
          escrowReleaseHours: marketplace.autoReleaseHours,
          minimumOrder: 1.00 // TODO: Make this configurable
        },
        
        // Trust & Safety
        policies: {
          disputeResolution: marketplace.autoRelease,
          sellerProtection: true,
          buyerProtection: true,
          commissionRate: marketplace.commissionRate
        }
      }
    });

  } catch (error) {
    console.error('💥 Public Marketplace API: Error fetching marketplace:', error);
    return NextResponse.json({
      error: 'Failed to fetch marketplace information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// OPTIONS - CORS support for external integrations
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    }
  });
}