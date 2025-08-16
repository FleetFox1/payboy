import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

const SellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true },
  sellerType: { type: String, required: true },
  socialHandle: String,
  preferredToken: { type: String, default: 'PYUSD' },
  customMessage: { type: String, default: 'Payment for services' },
  sellerId: String,
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const SellerModel = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    await connectToMongoDB();
    const { sellerId } = await params;
    
    // Find active seller by sellerId (public endpoint, no auth required)
    const seller = await SellerModel.findOne({ 
      sellerId: sellerId,
      isActive: true 
    });

    if (!seller) {
      return new Response(JSON.stringify({ 
        error: "Seller not found or inactive" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return only public information
    return new Response(JSON.stringify({
      success: true,
      seller: {
        id: seller._id,
        sellerId: seller.sellerId,
        displayName: seller.displayName,
        sellerType: seller.sellerType,
        socialHandle: seller.socialHandle,
        preferredToken: seller.preferredToken,
        customMessage: seller.customMessage,
        isActive: seller.isActive,
        isVerified: seller.isVerified,
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get public seller error:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to retrieve seller information" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}