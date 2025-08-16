import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

const SellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true },
  sellerType: { type: String, required: true },
  contactEmail: String,
  contactPhone: String,
  socialHandle: String,
  preferredToken: { type: String, default: 'PYUSD' },
  chainPreference: { type: Number, default: 42161 },
  enableQRCodes: { type: Boolean, default: true },
  enablePaymentLinks: { type: Boolean, default: true },
  customMessage: { type: String, default: 'Payment for services' },
  sellerId: String,
  qrCodeData: String,
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  totalPayments: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

const SellerModel = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);

// GET seller data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      const { id } = await params;
      
      // Find seller by ID and ensure it belongs to the authenticated user
      const seller = await SellerModel.findOne({ 
        _id: id, 
        userId: user.userId 
      });

      if (!seller) {
        return new Response(JSON.stringify({ 
          error: "Seller not found or access denied" 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        seller: {
          id: seller._id,
          sellerId: seller.sellerId,
          displayName: seller.displayName,
          sellerType: seller.sellerType,
          contactEmail: seller.contactEmail,
          contactPhone: seller.contactPhone,
          socialHandle: seller.socialHandle,
          preferredToken: seller.preferredToken,
          chainPreference: seller.chainPreference,
          enableQRCodes: seller.enableQRCodes,
          enablePaymentLinks: seller.enablePaymentLinks,
          customMessage: seller.customMessage,
          qrCodeData: seller.qrCodeData,
          isActive: seller.isActive,
          isVerified: seller.isVerified,
          totalPayments: seller.totalPayments,
          totalAmount: seller.totalAmount,
          createdAt: seller.createdAt,
          updatedAt: seller.updatedAt,
        }
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Get seller error:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to retrieve seller data" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}

// PATCH update seller data
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      const { id } = await params;
      
      const updateData = await req.json();
      
      // Remove sensitive fields that shouldn't be updated
      const { sellerId, userId, _id, createdAt, totalPayments, totalAmount, ...allowedUpdates } = updateData;
      
      // Validate display name if provided
      if (allowedUpdates.displayName && allowedUpdates.displayName.trim().length < 2) {
        return new Response(JSON.stringify({ 
          error: "Display name must be at least 2 characters" 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate payment methods if provided
      if (allowedUpdates.enableQRCodes !== undefined || allowedUpdates.enablePaymentLinks !== undefined) {
        const qrEnabled = allowedUpdates.enableQRCodes !== undefined ? allowedUpdates.enableQRCodes : true;
        const linksEnabled = allowedUpdates.enablePaymentLinks !== undefined ? allowedUpdates.enablePaymentLinks : true;
        
        if (!qrEnabled && !linksEnabled) {
          return new Response(JSON.stringify({ 
            error: "At least one payment method must be enabled" 
          }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Find and update seller
      const updatedSeller = await SellerModel.findOneAndUpdate(
        { _id: id, userId: user.userId },
        { 
          ...allowedUpdates,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updatedSeller) {
        return new Response(JSON.stringify({ 
          error: "Seller not found or access denied" 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Seller updated successfully",
        seller: {
          id: updatedSeller._id,
          sellerId: updatedSeller.sellerId,
          displayName: updatedSeller.displayName,
          sellerType: updatedSeller.sellerType,
          contactEmail: updatedSeller.contactEmail,
          contactPhone: updatedSeller.contactPhone,
          socialHandle: updatedSeller.socialHandle,
          preferredToken: updatedSeller.preferredToken,
          enableQRCodes: updatedSeller.enableQRCodes,
          enablePaymentLinks: updatedSeller.enablePaymentLinks,
          customMessage: updatedSeller.customMessage,
          isActive: updatedSeller.isActive,
          updatedAt: updatedSeller.updatedAt,
        }
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Update seller error:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to update seller data" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}