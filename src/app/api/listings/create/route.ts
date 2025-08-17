import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { Listing } from "@/models/ListingsModel";

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 DEMO MODE: Creating listing (auth bypassed)');
    
    await connectToMongoDB();
    
    const body = await req.json();
    console.log('📦 DEMO MODE: Listing request body received:', Object.keys(body));
    
    // Extract user ID from auth header if available
    let userId = body.sellerId || 'demo-user-' + Date.now();
    const authHeader = req.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          userId = payload.sub || payload.userId || payload.user_id || userId;
          console.log('🔍 DEMO MODE: Extracted user ID from token:', userId);
        }
      } catch (decodeError) {
        console.warn('⚠️ DEMO MODE: Could not decode token, using fallback ID');
      }
    }
    
    const {
      title,
      description,
      price,
      category,
      images = [],
      paymentMethods = {
        pyusd: true,
        paypal: true,
        venmo: true,
        email: true
      }
    } = body;

    console.log('📦 DEMO MODE: Creating listing:', {
      title,
      price,
      category,
      userId
    });

    // Validate required fields
    if (!title || !description || !price || !category) {
      console.error('❌ DEMO MODE: Missing required fields');
      return NextResponse.json({ 
        success: false,
        error: "Title, description, price, and category are required" 
      }, { status: 400 });
    }

    if (price <= 0) {
      console.error('❌ DEMO MODE: Invalid price');
      return NextResponse.json({ 
        success: false,
        error: "Price must be greater than 0" 
      }, { status: 400 });
    }

    console.log('🔄 DEMO MODE: Creating new listing...');

    // Create new listing using the model
    const newListing = new Listing({
      sellerId: 'demo-seller-' + Date.now(),
      userId: userId,
      title,
      description,
      price,
      category,
      images,
      paymentMethods,
      isActive: true,
      isVisible: true,
      views: 0,
      inquiries: 0,
      sales: 0,
    });

    await newListing.save();
    console.log('✅ DEMO MODE: Listing created successfully with ID:', newListing.listingId);

    const responseData = {
      success: true,
      message: "Listing created successfully",
      listing: {
        id: newListing._id,
        listingId: newListing.listingId,
        title: newListing.title,
        description: newListing.description,
        price: newListing.price,
        category: newListing.category,
        images: newListing.images,
        paymentMethods: newListing.paymentMethods,
        paymentUrl: newListing.paymentUrl,
        qrCodeData: newListing.qrCodeData,
        isActive: newListing.isActive,
        isVisible: newListing.isVisible,
        createdAt: newListing.createdAt,
      }
    };

    console.log('📤 DEMO MODE: Sending listing response');

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('💥 DEMO MODE: Listing creation error:', error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to create listing",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}