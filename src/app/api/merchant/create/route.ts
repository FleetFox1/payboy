import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

// Merchant schema for MongoDB
const MerchantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Business info
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  businessEmail: String,
  businessPhone: String,
  
  // Payment settings
  feeBps: { type: Number, default: 250 }, // 2.5% default
  chainPreference: { type: Number, default: 42161 }, // Arbitrum One
  preferredToken: { type: String, default: 'PYUSD' }, // Add preferred token
  
  // Escrow settings
  autoRelease: { type: Boolean, default: true },
  autoReleaseHours: { type: Number, default: 72 }, // 3 days
  
  // API integration
  webhookUrl: String,
  apiKey: String, // Generated API key for merchant
  apiSecret: String, // Generated API secret
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  
  // Contract addresses (will be populated when deployed)
  escrowFactoryAddress: String,
  merchantRegistryAddress: String,
  
}, { timestamps: true });

const MerchantModel = mongoose.models.Merchant || mongoose.model('Merchant', MerchantSchema);

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

// Utility function to generate API credentials
function generateApiCredentials() {
  const apiKey = 'pb_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const apiSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return { apiKey, apiSecret };
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      
      const {
        businessName,
        businessType,
        businessEmail,
        businessPhone,
        feeBps,
        chainPreference,
        preferredToken, // Add this
        autoRelease,
        autoReleaseHours,
        webhookUrl
      } = await req.json();

      // Validate required fields
      if (!businessName || !businessType) {
        return new Response(JSON.stringify({ 
          error: "Business name and type are required" 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if merchant already exists for this user
      const existingMerchant = await MerchantModel.findOne({ userId: user.userId });
      
      if (existingMerchant) {
        return new Response(JSON.stringify({ 
          error: "Merchant account already exists for this user" 
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate API credentials
      const { apiKey, apiSecret } = generateApiCredentials();

      // Create new merchant
      const newMerchant = new MerchantModel({
        userId: user.userId,
        businessName,
        businessType,
        businessEmail,
        businessPhone,
        feeBps: feeBps || 250,
        chainPreference: chainPreference || 42161,
        preferredToken: preferredToken || 'PYUSD', // Add this
        autoRelease: autoRelease !== undefined ? autoRelease : true,
        autoReleaseHours: autoReleaseHours || 72,
        webhookUrl,
        apiKey,
        apiSecret,
        isActive: true,
        isVerified: false,
      });

      await newMerchant.save();

      // Update user type to merchant
      await UserModel.findByIdAndUpdate(user.userId, { 
        userType: 'merchant' 
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Merchant account created successfully",
        merchant: {
          id: newMerchant._id,
          businessName: newMerchant.businessName,
          businessType: newMerchant.businessType,
          feeBps: newMerchant.feeBps,
          chainPreference: newMerchant.chainPreference,
          preferredToken: newMerchant.preferredToken, // Add this
          apiKey: newMerchant.apiKey, // Return API key for setup
          isActive: newMerchant.isActive,
          isVerified: newMerchant.isVerified,
        }
      }), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Merchant creation error:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to create merchant account" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}