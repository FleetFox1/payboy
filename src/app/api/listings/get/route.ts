import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { Listing } from "@/models/ListingsModel"; // Use your centralized model

export async function GET(req: NextRequest) {
  // ✅ DEMO MODE: Bypass auth for hackathon
  try {
    console.log('🚀 DEMO MODE: Getting listings (auth bypassed)');
    
    await connectToMongoDB();
    console.log('🔗 DEMO MODE: Connected to MongoDB');
    
    // Extract user ID from auth header or URL params
    let userId = null;
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const urlUserId = searchParams.get('userId');
    const getAllListings = searchParams.get('all') === 'true'; // Add option to get all listings
    
    if (urlUserId) {
      userId = urlUserId;
      console.log('🔍 DEMO MODE: Using user ID from URL:', userId);
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          userId = payload.sub || payload.userId || payload.user_id;
          console.log('🔍 DEMO MODE: Extracted user ID from token:', userId);
        }
      } catch (decodeError) {
        console.warn('⚠️ DEMO MODE: Could not decode token');
      }
    }

    // Build query - if no userId and not requesting all, return error
    let query: any = { isActive: true };
    
    if (getAllListings) {
      console.log('🌍 DEMO MODE: Getting ALL listings');
      // Don't filter by userId for public listings view
    } else if (userId) {
      query.userId = userId;
      console.log('🔍 DEMO MODE: Getting listings for user:', userId);
    } else {
      console.error('❌ DEMO MODE: No user ID available and not requesting all listings');
      return NextResponse.json({ 
        success: false,
        error: "User ID required or use ?all=true for public listings" 
      }, { status: 400 });
    }

    console.log('🔍 DEMO MODE: Query:', query);

    // Get listings with the query
    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Array<
        {
          _id: any;
          listingId?: string;
          sellerId?: string;
          userId?: string;
          title?: string;
          description?: string;
          price?: number;
          category?: string;
          images?: string[];
          paymentMethods?: string[];
          paymentUrl?: string;
          qrCodeData?: string;
          isActive?: boolean;
          isVisible?: boolean;
          views?: number;
          inquiries?: number;
          sales?: number;
          createdAt?: Date;
          updatedAt?: Date;
        }
      >;

    console.log('✅ DEMO MODE: Found', listings.length, 'listings');

    // Log first listing for debugging
    if (listings.length > 0) {
      console.log('📋 DEMO MODE: Sample listing:', {
        id: listings[0]._id,
        title: listings[0].title,
        price: listings[0].price,
        category: listings[0].category
      });
    }

    const responseData = {
      success: true,
      count: listings.length,
      query: getAllListings ? 'all_public' : `user_${userId}`,
      listings: listings.map(listing => ({
        id: listing._id.toString(),
        listingId: listing.listingId,
        sellerId: listing.sellerId,
        userId: listing.userId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images: listing.images || [],
        paymentMethods: listing.paymentMethods,
        paymentUrl: listing.paymentUrl,
        qrCodeData: listing.qrCodeData,
        isActive: listing.isActive,
        isVisible: listing.isVisible,
        views: listing.views || 0,
        inquiries: listing.inquiries || 0,
        sales: listing.sales || 0,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      }))
    };

    console.log('📤 DEMO MODE: Sending response with', responseData.listings.length, 'listings');

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('💥 DEMO MODE: Get listings error:', error);
    
    // More detailed error info for development
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : { message: 'Unknown error' };

    return NextResponse.json({ 
      success: false,
      error: "Failed to get listings",
      details: errorDetails
    }, { status: 500 });
  }
}