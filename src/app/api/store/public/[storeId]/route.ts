import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { StoreModel } from "@/models/StoreModel";

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    console.log('🌐 Public Store API: Fetching public store data for:', params.storeId);
    
    await connectToMongoDB();

    // Find store by ID or ENS name (flexible lookup)
    const store = await StoreModel.findOne({
      $or: [
        { _id: params.storeId },
        { ensName: params.storeId }
      ],
      isActive: true // Only show active stores
    });

    if (!store) {
      return NextResponse.json({ 
        error: 'Store not found',
        message: 'This store is not available or has been deactivated'
      }, { status: 404 });
    }

    console.log('✅ Public Store API: Store found:', store.storeName);

    // Return only public information (no sensitive data like earnings, emails, etc.)
    return NextResponse.json({
      success: true,
      store: {
        id: store._id,
        storeName: store.storeName,
        ensName: store.ensName,
        storeType: store.storeType,
        storeAddress: store.storeAddress,
        category: store.category,
        description: store.description,
        website: store.website,
        walletAddress: store.walletAddress, // Needed for payments
        isVerified: store.isVerified,
        qrCodeSize: store.qrCodeSize,
        printingEnabled: store.printingEnabled,
        createdAt: store.createdAt,
        // Exclude sensitive data: storeEmail, storePhone, totalEarnings, etc.
      }
    });

  } catch (error) {
    console.error('💥 Public Store API: Error fetching store:', error);
    return NextResponse.json({
      error: 'Failed to fetch store information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}