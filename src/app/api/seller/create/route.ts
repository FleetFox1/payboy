import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

// Seller schema for MongoDB
const SellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Profile info
  displayName: { type: String, required: true },
  sellerType: { type: String, required: true },
  contactEmail: String,
  contactPhone: String,
  socialHandle: String,
  
  // Payment settings
  preferredToken: { type: String, default: 'PYUSD' },
  chainPreference: { type: Number, default: 42161 }, // Arbitrum One
  
  // Payment methods
  enableQRCodes: { type: Boolean, default: true },
  enablePaymentLinks: { type: Boolean, default: true },
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
      
      const {
        displayName,
        sellerType,
        contactEmail,
        contactPhone,
        socialHandle,
        preferredToken,
        enableQRCodes,
        enablePaymentLinks,
        customMessage
      } = await req.json();

      // Validate required fields
      if (!displayName || !sellerType) {
        return new Response(JSON.stringify({ 
          error: "Display name and seller type are required" 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate that at least one payment method is enabled
      if (!enableQRCodes && !enablePaymentLinks) {
        return new Response(JSON.stringify({ 
          error: "At least one payment method must be enabled" 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if seller already exists for this user
      const existingSeller = await SellerModel.findOne({ userId: user.userId });
      
      if (existingSeller) {
        return new Response(JSON.stringify({ 
          error: "Seller account already exists for this user" 
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate unique seller ID and QR code data
      const sellerId = generateSellerId();
      const qrCodeData = generateQRCodeData(sellerId, displayName);

      // Create new seller
      const newSeller = new SellerModel({
        userId: user.userId,
        displayName,
        sellerType,
        contactEmail,
        contactPhone,
        socialHandle,
        preferredToken: preferredToken || 'PYUSD',
        chainPreference: 42161, // Arbitrum One
        enableQRCodes: enableQRCodes !== undefined ? enableQRCodes : true,
        enablePaymentLinks: enablePaymentLinks !== undefined ? enablePaymentLinks : true,
        customMessage: customMessage || 'Payment for services',
        sellerId,
        qrCodeData,
        isActive: true,
        isVerified: false,
        totalPayments: 0,
        totalAmount: 0,
      });

      await newSeller.save();

      // Update user type to seller
      await UserModel.findByIdAndUpdate(user.userId, { 
        userType: 'seller',
        displayName: displayName // Update user display name too
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Seller account created successfully",
        seller: {
          id: newSeller._id,
          sellerId: newSeller.sellerId,
          displayName: newSeller.displayName,
          sellerType: newSeller.sellerType,
          preferredToken: newSeller.preferredToken,
          enableQRCodes: newSeller.enableQRCodes,
          enablePaymentLinks: newSeller.enablePaymentLinks,
          qrCodeData: newSeller.qrCodeData,
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://payboy.app'}/pay/${newSeller.sellerId}`,
          isActive: newSeller.isActive,
          isVerified: newSeller.isVerified,
        }
      }), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Seller creation error:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to create seller account" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}