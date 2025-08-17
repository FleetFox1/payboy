import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
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

export async function POST(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      
      const body = await req.json();
      
      const {
        displayName,
        sellerType,
        contactEmail,
        contactPhone,
        socialHandle,
        description, // Added
        website, // Added
        preferredToken,
        enableQRCodes,
        enablePaymentLinks,
        enableInvoices, // Added
        enableListings, // Added
        customMessage,
        defaultPricing, // Added
        walletAddress, // Added
        userId, // From frontend
        chainId, // From frontend
        walletType, // From frontend
        userType // From frontend
      } = body;

      console.log('📦 API: Received seller creation request:', {
        displayName,
        sellerType,
        walletAddress,
        userId: userId || user.userId || user.id,
        userType
      });

      // Validate required fields
      if (!displayName || !sellerType) {
        console.error('❌ API: Missing required fields');
        return NextResponse.json({ 
          success: false,
          error: "Display name and seller type are required" 
        }, { status: 400 });
      }

      if (!walletAddress) {
        console.error('❌ API: Missing wallet address');
        return NextResponse.json({ 
          success: false,
          error: "Wallet address is required" 
        }, { status: 400 });
      }

      // Validate that at least one payment method is enabled
      if (!enableQRCodes && !enablePaymentLinks && !enableInvoices && !enableListings) {
        console.error('❌ API: No payment methods enabled');
        return NextResponse.json({ 
          success: false,
          error: "At least one payment method must be enabled" 
        }, { status: 400 });
      }

      // Use userId from request or fallback to auth user
      const finalUserId = userId || user.userId || user.id;
      if (!finalUserId) {
        console.error('❌ API: No user ID available');
        return NextResponse.json({ 
          success: false,
          error: "User ID not found" 
        }, { status: 400 });
      }

      console.log('🔍 API: Using user ID:', finalUserId);

      // Check if seller already exists for this user
      const existingSeller = await SellerModel.findOne({ 
        $or: [
          { userId: finalUserId },
          { walletAddress: walletAddress.toLowerCase() }
        ]
      });
      
      if (existingSeller) {
        console.log('⚠️ API: Seller already exists');
        return NextResponse.json({ 
          success: false,
          error: "Seller account already exists for this user or wallet" 
        }, { status: 409 });
      }

      // Generate unique seller ID and QR code data
      const sellerId = generateSellerId();
      const qrCodeData = generateQRCodeData(sellerId, displayName);

      console.log('🔄 API: Creating new seller with ID:', sellerId);

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
      console.log('✅ API: Seller created successfully');

      // Try to update user type (don't fail if user doesn't exist)
      try {
        await UserModel.findOneAndUpdate(
          { $or: [{ _id: finalUserId }, { privyId: finalUserId }] },
          { 
            userType: 'seller',
            displayName: displayName,
            walletAddress: walletAddress.toLowerCase()
          },
          { upsert: false } // Don't create if doesn't exist
        );
        console.log('✅ API: User type updated');
      } catch (userUpdateError) {
        console.warn('⚠️ API: Could not update user type:', userUpdateError);
        // Don't fail the seller creation if user update fails
      }

      const responseData = {
        success: true,
        message: "Seller account created successfully",
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

      console.log('📤 API: Sending response:', responseData);

      return NextResponse.json(responseData, { status: 201 });

    } catch (error) {
      console.error('💥 API: Seller creation error:', error);
      return NextResponse.json({ 
        success: false,
        error: "Failed to create seller account",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      }, { status: 500 });
    }
  });
}