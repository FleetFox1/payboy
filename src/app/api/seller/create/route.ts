import { NextRequest, NextResponse } from "next/server";
// import { withAuth } from "@/lib/middleware"; // ✅ DEMO MODE: Bypassed for hackathon
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

// Seller schema for MongoDB
const SellerSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Changed to String for Privy IDs
  walletAddress: { type: String, required: true }, // Added wallet address
  
  // Profile info
  displayName: { type: String, required: true },
  sellerType: { type: String, required: true },
  contactEmail: String,
  contactPhone: String,
  socialHandle: String,
  description: String, // Added description
  website: String, // Added website
  
  // Payment settings
  preferredToken: { type: String, default: 'PYUSD' },
  chainPreference: { type: Number, default: 42161 }, // Arbitrum One
  defaultPricing: { type: Number, default: 50 }, // Added default pricing
  
  // Payment methods - Updated to match your form
  enableQRCodes: { type: Boolean, default: true },
  enablePaymentLinks: { type: Boolean, default: true },
  enableInvoices: { type: Boolean, default: true }, // Added invoices
  enableListings: { type: Boolean, default: false }, // Added listings
  customMessage: { type: String, default: 'Payment for services' },
  
  // Generated identifiers
  sellerId: String, // Unique seller ID for payment links
  qrCodeData: String, // Base QR code data
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  
  // Stats (for future use)
  totalPayments: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  
}, { timestamps: true });

const SellerModel = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);

// User schema (to update user type)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  privyId: String,
  walletAddress: String,
  displayName: String,
  userType: { type: String, enum: ['buyer', 'seller', 'merchant'], default: 'buyer' },
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// Utility function to generate unique seller ID
function generateSellerId() {
  return 'seller_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Generate base QR code data (will be enhanced with amounts later)
function generateQRCodeData(sellerId: string, displayName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://payboy.app';
  return `${baseUrl}/pay/${sellerId}`;
}

// ✅ DEMO MODE: Simple auth bypass function
function createDemoUser(authHeader: string | null, body: any) {
  let userId = 'demo-user-' + Date.now();
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Try to extract user ID from token if possible
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        userId = payload.sub || payload.userId || payload.user_id || payload.aud || userId;
        console.log('🔍 DEMO AUTH: Extracted user ID from token:', userId);
      }
    } catch (decodeError) {
      console.warn('⚠️ DEMO AUTH: Could not decode token, using fallback ID');
    }
  }
  
  // Use userId from request body if available
  if (body.userId) {
    userId = body.userId;
    console.log('🔍 DEMO AUTH: Using user ID from request body:', userId);
  }
  
  return {
    id: userId,
    userId: userId,
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'demo-app',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    isDemoMode: true
  };
}

export async function POST(req: NextRequest) {
  // ✅ DEMO MODE: Manual auth bypass instead of withAuth wrapper
  try {
    console.log('🚀 DEMO MODE: Starting seller creation (auth bypassed)');
    
    await connectToMongoDB();
    
    const body = await req.json();
    console.log('📦 DEMO MODE: Request body received:', Object.keys(body));
    
    // ✅ DEMO MODE: Create fake user from auth header and body
    const authHeader = req.headers.get('authorization');
    const user = createDemoUser(authHeader, body);
    console.log('👤 DEMO MODE: Created demo user:', { id: user.id, userId: user.userId });
    
    const {
      displayName,
      sellerType,
      contactEmail,
      contactPhone,
      socialHandle,
      description,
      website,
      preferredToken,
      enableQRCodes,
      enablePaymentLinks,
      enableInvoices,
      enableListings,
      customMessage,
      defaultPricing,
      walletAddress,
      userId,
      chainId,
      walletType,
      userType
    } = body;

    console.log('📦 DEMO MODE: Received seller creation request:', {
      displayName,
      sellerType,
      walletAddress,
      userId: userId || user.userId || user.id,
      userType
    });

    // Validate required fields
    if (!displayName || !sellerType) {
      console.error('❌ DEMO MODE: Missing required fields');
      return NextResponse.json({ 
        success: false,
        error: "Display name and seller type are required" 
      }, { status: 400 });
    }

    if (!walletAddress) {
      console.error('❌ DEMO MODE: Missing wallet address');
      return NextResponse.json({ 
        success: false,
        error: "Wallet address is required" 
      }, { status: 400 });
    }

    // Validate that at least one payment method is enabled
    if (!enableQRCodes && !enablePaymentLinks && !enableInvoices && !enableListings) {
      console.error('❌ DEMO MODE: No payment methods enabled');
      return NextResponse.json({ 
        success: false,
        error: "At least one payment method must be enabled" 
      }, { status: 400 });
    }

    // Use userId from request or fallback to demo user
    const finalUserId = userId || user.userId || user.id;
    if (!finalUserId) {
      console.error('❌ DEMO MODE: No user ID available');
      return NextResponse.json({ 
        success: false,
        error: "User ID not found" 
      }, { status: 400 });
    }

    console.log('🔍 DEMO MODE: Using user ID:', finalUserId);

    // ✅ DEMO MODE: Check for existing seller but don't block creation for demo
    try {
      const existingSeller = await SellerModel.findOne({ 
        $or: [
          { userId: finalUserId },
          { walletAddress: walletAddress.toLowerCase() }
        ]
      });
      
      if (existingSeller) {
        console.log('⚠️ DEMO MODE: Seller exists, but allowing creation for demo');
        // For demo, we'll update the existing seller instead of blocking
        console.log('🔄 DEMO MODE: Updating existing seller for demo purposes');
        
        // Update existing seller with new data
        existingSeller.displayName = displayName;
        existingSeller.sellerType = sellerType;
        existingSeller.contactEmail = contactEmail || '';
        existingSeller.contactPhone = contactPhone || '';
        existingSeller.socialHandle = socialHandle || '';
        existingSeller.description = description || '';
        existingSeller.website = website || '';
        existingSeller.preferredToken = preferredToken || 'PYUSD';
        existingSeller.chainPreference = parseInt(chainId) || 42161;
        existingSeller.defaultPricing = defaultPricing || 50;
        existingSeller.enableQRCodes = enableQRCodes !== undefined ? enableQRCodes : true;
        existingSeller.enablePaymentLinks = enablePaymentLinks !== undefined ? enablePaymentLinks : true;
        existingSeller.enableInvoices = enableInvoices !== undefined ? enableInvoices : true;
        existingSeller.enableListings = enableListings !== undefined ? enableListings : false;
        existingSeller.customMessage = customMessage || 'Payment for services';
        
        await existingSeller.save();
        
        const responseData = {
          success: true,
          message: "Seller account updated successfully (demo mode)",
          seller: {
            id: existingSeller._id,
            sellerId: existingSeller.sellerId,
            displayName: existingSeller.displayName,
            sellerType: existingSeller.sellerType,
            walletAddress: existingSeller.walletAddress,
            preferredToken: existingSeller.preferredToken,
            enableQRCodes: existingSeller.enableQRCodes,
            enablePaymentLinks: existingSeller.enablePaymentLinks,
            enableInvoices: existingSeller.enableInvoices,
            enableListings: existingSeller.enableListings,
            defaultPricing: existingSeller.defaultPricing,
            qrCodeData: existingSeller.qrCodeData,
            paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://payboy.app'}/pay/${existingSeller.sellerId}`,
            isActive: existingSeller.isActive,
            isVerified: existingSeller.isVerified,
          }
        };

        console.log('📤 DEMO MODE: Sending updated seller response:', responseData);
        return NextResponse.json(responseData, { status: 200 });
      }
    } catch (findError) {
      console.warn('⚠️ DEMO MODE: Error checking existing seller, proceeding with creation:', findError);
    }

    // Generate unique seller ID and QR code data
    const sellerId = generateSellerId();
    const qrCodeData = generateQRCodeData(sellerId, displayName);

    console.log('🔄 DEMO MODE: Creating new seller with ID:', sellerId);

    // Create new seller with all fields
    const newSeller = new SellerModel({
      userId: finalUserId,
      walletAddress: walletAddress.toLowerCase(),
      displayName,
      sellerType,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      socialHandle: socialHandle || '',
      description: description || '',
      website: website || '',
      preferredToken: preferredToken || 'PYUSD',
      chainPreference: parseInt(chainId) || 42161,
      defaultPricing: defaultPricing || 50,
      enableQRCodes: enableQRCodes !== undefined ? enableQRCodes : true,
      enablePaymentLinks: enablePaymentLinks !== undefined ? enablePaymentLinks : true,
      enableInvoices: enableInvoices !== undefined ? enableInvoices : true,
      enableListings: enableListings !== undefined ? enableListings : false,
      customMessage: customMessage || 'Payment for services',
      sellerId,
      qrCodeData,
      isActive: true,
      isVerified: false,
      totalPayments: 0,
      totalAmount: 0,
    });

    await newSeller.save();
    console.log('✅ DEMO MODE: Seller created successfully');

    // ✅ DEMO MODE: Skip user update to avoid DB relationship issues
    console.log('✅ DEMO MODE: Skipping user type update for demo stability');

    const responseData = {
      success: true,
      message: "Seller account created successfully (demo mode)",
      seller: {
        id: newSeller._id,
        sellerId: newSeller.sellerId,
        displayName: newSeller.displayName,
        sellerType: newSeller.sellerType,
        walletAddress: newSeller.walletAddress,
        preferredToken: newSeller.preferredToken,
        enableQRCodes: newSeller.enableQRCodes,
        enablePaymentLinks: newSeller.enablePaymentLinks,
        enableInvoices: newSeller.enableInvoices,
        enableListings: newSeller.enableListings,
        defaultPricing: newSeller.defaultPricing,
        qrCodeData: newSeller.qrCodeData,
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://payboy.app'}/pay/${newSeller.sellerId}`,
        isActive: newSeller.isActive,
        isVerified: newSeller.isVerified,
      }
    };

    console.log('📤 DEMO MODE: Sending response:', responseData);

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('💥 DEMO MODE: Seller creation error:', error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to create seller account",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}