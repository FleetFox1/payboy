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
  feeBps: { type: Number, default: 250 },
  chainPreference: { type: Number, default: 42161 },
  preferredToken: { type: String, default: 'PYUSD' }, // Add this line
  
  // Escrow settings
  autoRelease: { type: Boolean, default: true },
  autoReleaseHours: { type: Number, default: 72 },
  
  // API integration
  webhookUrl: String,
  apiKey: String,
  apiSecret: String,
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  
  // Contract addresses
  escrowFactoryAddress: String,
  merchantRegistryAddress: String,
  
}, { timestamps: true });

const MerchantModel = mongoose.models.Merchant || mongoose.model('Merchant', MerchantSchema);

// GET merchant data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      const { id } = await params;
      
      // Find merchant by ID and ensure it belongs to the authenticated user
      const merchant = await MerchantModel.findOne({ 
        _id: id, 
        userId: user.userId 
      });

      if (!merchant) {
        return new Response(JSON.stringify({ 
          error: "Merchant not found or access denied" 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        merchant: {
          id: merchant._id,
          businessName: merchant.businessName,
          businessType: merchant.businessType,
          businessEmail: merchant.businessEmail,
          businessPhone: merchant.businessPhone,
          feeBps: merchant.feeBps,
          chainPreference: merchant.chainPreference,
          preferredToken: merchant.preferredToken, // Add this line
          autoRelease: merchant.autoRelease,
          autoReleaseHours: merchant.autoReleaseHours,
          webhookUrl: merchant.webhookUrl,
          apiKey: merchant.apiKey,
          // Don't return apiSecret for security
          isActive: merchant.isActive,
          isVerified: merchant.isVerified,
          escrowFactoryAddress: merchant.escrowFactoryAddress,
          merchantRegistryAddress: merchant.merchantRegistryAddress,
          createdAt: merchant.createdAt,
          updatedAt: merchant.updatedAt,
        }
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Get merchant error:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to retrieve merchant data" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}

// PUT update merchant data
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      const { id } = await params;
      
      const updateData = await req.json();
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { apiKey, apiSecret, userId, _id, createdAt, ...allowedUpdates } = updateData;
      
      // Validate business name if provided
      if (allowedUpdates.businessName && allowedUpdates.businessName.trim().length < 2) {
        return new Response(JSON.stringify({ 
          error: "Business name must be at least 2 characters" 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate fee BPS if provided
      if (allowedUpdates.feeBps !== undefined && (allowedUpdates.feeBps < 0 || allowedUpdates.feeBps > 1000)) {
        return new Response(JSON.stringify({ 
          error: "Fee must be between 0% and 10%" 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Find and update merchant
      const updatedMerchant = await MerchantModel.findOneAndUpdate(
        { _id: id, userId: user.userId },
        { 
          ...allowedUpdates,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updatedMerchant) {
        return new Response(JSON.stringify({ 
          error: "Merchant not found or access denied" 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Merchant updated successfully",
        merchant: {
          id: updatedMerchant._id,
          businessName: updatedMerchant.businessName,
          businessType: updatedMerchant.businessType,
          businessEmail: updatedMerchant.businessEmail,
          businessPhone: updatedMerchant.businessPhone,
          feeBps: updatedMerchant.feeBps,
          chainPreference: updatedMerchant.chainPreference,
          preferredToken: updatedMerchant.preferredToken, // Add this line
          autoRelease: updatedMerchant.autoRelease,
          autoReleaseHours: updatedMerchant.autoReleaseHours,
          webhookUrl: updatedMerchant.webhookUrl,
          apiKey: updatedMerchant.apiKey,
          isActive: updatedMerchant.isActive,
          isVerified: updatedMerchant.isVerified,
          updatedAt: updatedMerchant.updatedAt,
        }
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Update merchant error:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to update merchant data" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}

// PATCH for partial updates (alternative to PUT)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params }); // Reuse PUT logic for PATCH
}

// DELETE merchant account (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      const { id } = await params;
      
      // Soft delete by setting isActive to false
      const deactivatedMerchant = await MerchantModel.findOneAndUpdate(
        { _id: id, userId: user.userId },
        { 
          isActive: false,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!deactivatedMerchant) {
        return new Response(JSON.stringify({ 
          error: "Merchant not found or access denied" 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Merchant account deactivated successfully"
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Delete merchant error:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to deactivate merchant account" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}