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
  userType: { type: String, enum: ['buyer', 'seller', 'merchant', 'store_owner'], default: 'buyer' }, // Added store_owner
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

export async function POST(req: NextRequest) {
  try {
    console.log('🏪 Store API: Creating new store...');
    
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

    console.log('✅ Store API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Get request data
    const storeData = await req.json();
    console.log('📋 Store API: Store data received:', {
      storeName: storeData.storeName,
      storeType: storeData.storeType,
      ensName: storeData.ensName
    });

    // Find the user using the same model as auth API
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('👤 Store API: User found:', user.email);

    // Check if user already has a store
    const existingStore = await StoreModel.findOne({ userId: decoded.userId });
    if (existingStore) {
      return NextResponse.json({ error: 'User already has a store' }, { status: 400 });
    }

    // Check if ENS name is already taken
    if (storeData.ensName) {
      const existingENS = await StoreModel.findOne({ ensName: storeData.ensName });
      if (existingENS) {
        return NextResponse.json({ error: 'ENS name already taken' }, { status: 400 });
      }
    }

    // Create new store
    const newStore = new StoreModel({
      userId: decoded.userId,
      privyId: user.privyId,
      walletAddress: storeData.walletAddress,
      ensName: storeData.ensName,
      storeName: storeData.storeName,
      storeType: storeData.storeType,
      storeEmail: storeData.storeEmail,
      storePhone: storeData.storePhone,
      storeAddress: storeData.storeAddress,
      category: storeData.category,
      description: storeData.description,
      website: storeData.website,
      qrCodeSize: storeData.qrCodeSize || 'Medium (4x4 inches)',
      printingEnabled: storeData.printingEnabled !== false,
      notificationEmail: storeData.notificationEmail,
      isActive: true,
      isVerified: false
    });

    await newStore.save();
    console.log('✅ Store API: Store created successfully:', newStore._id);

    // Update user to store_owner (same pattern as auth API)
    await UserModel.findByIdAndUpdate(decoded.userId, {
      userType: 'store_owner',
      onboardingCompleted: true,
      updatedAt: new Date()
    });

    console.log('✅ Store API: User updated to store_owner');

    return NextResponse.json({
      success: true,
      message: 'Store created successfully',
      store: {
        id: newStore._id,
        storeName: newStore.storeName,
        ensName: newStore.ensName,
        storeType: newStore.storeType,
        storeAddress: newStore.storeAddress,
        category: newStore.category,
        walletAddress: newStore.walletAddress,
        isActive: newStore.isActive,
        isVerified: newStore.isVerified,
        totalEarnings: newStore.totalEarnings,
        totalTransactions: newStore.totalTransactions,
        createdAt: newStore.createdAt
      }
    });

  } catch (error) {
    console.error('💥 Store API: Error creating store:', error);
    return NextResponse.json({
      error: 'Failed to create store',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}