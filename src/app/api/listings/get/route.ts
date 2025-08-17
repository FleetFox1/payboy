import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

// Listing schema
const ListingSchema = new mongoose.Schema({
  sellerId: String,
  userId: String,
  title: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  paymentMethods: {
    pyusd: Boolean,
    paypal: Boolean,
    venmo: Boolean,
    email: Boolean
  },
  listingId: String,
  paymentUrl: String,
  qrCodeData: String,
  isActive: Boolean,
  isVisible: Boolean,
  views: Number,
  inquiries: Number,
  sales: Number,
}, { timestamps: true });

const ListingModel = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

export async function GET(req: NextRequest) {
  // ✅ DEMO MODE: Bypass auth for hackathon
  try {
    console.log('🚀 DEMO MODE: Getting listings (auth bypassed)');
    
    await connectToMongoDB();
    
    // Extract user ID from auth header or URL params
    let userId = null;
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const urlUserId = searchParams.get('userId');
    
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

    if (!userId) {
      console.error('❌ DEMO MODE: No user ID available');
      return NextResponse.json({ 
        success: false,
        error: "User ID required" 
      }, { status: 400 });
    }

    console.log('🔍 DEMO MODE: Getting listings for user:', userId);

    // Get all listings for this user
    const listings = await ListingModel.find({ 
      userId: userId,
      isActive: true 
    }).sort({ createdAt: -1 });

    console.log('✅ DEMO MODE: Found', listings.length, 'listings');

    const responseData = {
      success: true,
      count: listings.length,
      listings: listings.map(listing => ({
        id: listing._id,
        listingId: listing.listingId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images: listing.images,
        paymentMethods: listing.paymentMethods,
        paymentUrl: listing.paymentUrl,
        qrCodeData: listing.qrCodeData,
        isActive: listing.isActive,
        isVisible: listing.isVisible,
        views: listing.views,
        inquiries: listing.inquiries,
        sales: listing.sales,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      }))
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('💥 DEMO MODE: Get listings error:', error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to get listings",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}