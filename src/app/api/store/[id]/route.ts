import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { StoreModel } from "@/models/StoreModel";
import { verifyJWT } from "@/lib/auth";
import mongoose from 'mongoose';

// Use the SAME User schema from your auth API
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  privyId: String,
  walletAddress: String,
  displayName: String,
  userType: { type: String, enum: ['buyer', 'seller', 'merchant', 'store_owner'], default: 'buyer' },
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  
  // Privy-specific fields
  privyAccountType: { type: String, enum: ['email', 'wallet'], default: 'email' },
  embeddedWallet: { type: Boolean, default: true },
  onboardingCompleted: { type: Boolean, default: false },
  
  // Payout preferences with enhanced schema
  payoutMethods: [{
    type: { type: String, enum: ['crypto', 'venmo', 'paypal', 'bank', 'cashapp'] },
    address: String,
    label: String,
    isDefault: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    metadata: {
      chainId: Number,
      tokenSymbol: String,
      email: String,
      username: String,
      bankName: String,
      accountType: String,
      routingNumber: String,
      accountNumberLast4: String,
    }
  }],
  
  // Balance tracking
  balance: {
    available: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  lastLogin: Date,
  
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📊 Store ID API: Fetching store data for ID:', params.id);
    
    // Get auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Store ID API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Find the store by ID and verify ownership
    const store = await StoreModel.findOne({
      _id: params.id,
      userId: decoded.userId // Ensure user owns this store
    });

    if (!store) {
      return NextResponse.json({ 
        error: 'Store not found',
        message: 'Store not found or you do not have permission to access it'
      }, { status: 404 });
    }

    console.log('✅ Store ID API: Store found:', store.storeName);

    // Get associated user data
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return full store data (since this is authenticated and user owns the store)
    return NextResponse.json({
      success: true,
      store: {
        id: store._id,
        storeName: store.storeName,
        ensName: store.ensName,
        storeType: store.storeType,
        storeEmail: store.storeEmail,
        storePhone: store.storePhone,
        storeAddress: store.storeAddress,
        category: store.category,
        description: store.description,
        website: store.website,
        walletAddress: store.walletAddress,
        qrCodeSize: store.qrCodeSize,
        printingEnabled: store.printingEnabled,
        notificationEmail: store.notificationEmail,
        isActive: store.isActive,
        isVerified: store.isVerified,
        totalEarnings: store.totalEarnings,
        totalTransactions: store.totalTransactions,
        lastPayment: store.lastPayment,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      },
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        isVerified: user.isVerified,
        payoutMethods: user.payoutMethods,
        balance: user.balance
      }
    });

  } catch (error) {
    console.error('💥 Store ID API: Error fetching store:', error);
    return NextResponse.json({
      error: 'Failed to fetch store data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT method to update store
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Store ID API: Updating store:', params.id);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToMongoDB();

    const updateData = await req.json();
    
    // Find and update store (ensure user owns it)
    const updatedStore = await StoreModel.findOneAndUpdate(
      { 
        _id: params.id,
        userId: decoded.userId // Security: only update if user owns the store
      },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedStore) {
      return NextResponse.json({ 
        error: 'Store not found or permission denied' 
      }, { status: 404 });
    }

    console.log('✅ Store ID API: Store updated:', updatedStore.storeName);

    return NextResponse.json({
      success: true,
      message: 'Store updated successfully',
      store: updatedStore
    });

  } catch (error) {
    console.error('💥 Store ID API: Update error:', error);
    return NextResponse.json({
      error: 'Failed to update store',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}