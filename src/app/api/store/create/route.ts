'use client'
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

// ✅ DEMO MODE: Same User schema from auth API
const UserSchema = new mongoose.Schema({
  privyId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  walletAddress: String,
  name: String,
  username: String,
  profileImage: String,
  bio: String,
  website: String,
  location: String,
  isVerified: { type: Boolean, default: false },
  userType: {
    type: String,
    enum: ['solo-seller', 'store', 'marketplace'],
    required: true
  },
  storeInfo: {
    storeName: String,
    storeDescription: String,
    storeCategory: String,
    businessType: String,
    taxId: String,
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    businessHours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean }
    },
    paymentMethods: {
      pyusd: { type: Boolean, default: true },
      paypal: { type: Boolean, default: true },
      venmo: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },
    settings: {
      autoAcceptOrders: { type: Boolean, default: false },
      requireSignature: { type: Boolean, default: false },
      allowPickup: { type: Boolean, default: true },
      allowDelivery: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// ✅ DEMO MODE: Auth bypass utility (same as seller route)
function createDemoUser(req: NextRequest, body: any) {
  console.log('🎭 DEMO MODE: Creating demo user for store');
  
  const authHeader = req.headers.get('authorization');
  let userId = body.userId || body.privyId;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('🎭 DEMO MODE: Found auth token, extracting user ID');
    userId = userId || `user_${token.substring(0, 8)}`;
  }
  
  userId = userId || `demo_store_${Date.now()}`;
  
  const demoUser = {
    id: userId,
    privyId: userId,
    email: body.email || `${userId}@demo.com`,
    userType: 'store',
    wallet: { address: body.walletAddress || `0x${Math.random().toString(16).substr(2, 40)}` }
  };
  
  console.log('🎭 DEMO MODE: Created demo user:', { id: demoUser.id, email: demoUser.email });
  return demoUser;
}

// ✅ DEMO MODE: Generate unique store ID
function generateStoreId() {
  return 'store_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  // ✅ DEMO MODE: Manual auth bypass instead of withAuth wrapper
  try {
    console.log('🚀 DEMO MODE: Starting store creation (auth bypassed)');
    
    await connectToMongoDB();
    
    const body = await req.json();
    console.log('📦 DEMO MODE: Request body received:', Object.keys(body));
    
    // ✅ DEMO MODE: Use demo user instead of JWT verification
    const user = createDemoUser(req, body);
    console.log('👤 DEMO MODE: Using demo user:', user.id);
    
    // ✅ DEMO MODE: Check if store already exists (allow updates)
    let existingUser = await UserModel.findOne({ privyId: user.privyId });
    
    if (existingUser && existingUser.userType === 'store') {
      console.log('🔄 DEMO MODE: Store exists, updating instead of blocking');
      
      // Update existing store
      existingUser.storeInfo = {
        ...existingUser.storeInfo,
        storeName: body.storeName,
        storeDescription: body.storeDescription,
        storeCategory: body.storeCategory,
        businessType: body.businessType,
        taxId: body.taxId,
        businessAddress: body.businessAddress,
        businessHours: body.businessHours,
        paymentMethods: body.paymentMethods || {
          pyusd: true,
          paypal: true,
          venmo: true,
          email: true
        },
        settings: body.settings || {
          autoAcceptOrders: false,
          requireSignature: false,
          allowPickup: true,
          allowDelivery: false
        }
      };
      
      await existingUser.save();
      
      const responseData = {
        success: true,
        message: "Store updated successfully (demo mode)",
        storeId: existingUser.storeInfo?.storeId || generateStoreId(),
        store: {
          id: existingUser._id,
          privyId: existingUser.privyId,
          storeName: existingUser.storeInfo?.storeName,
          storeCategory: existingUser.storeInfo?.storeCategory,
          businessType: existingUser.storeInfo?.businessType,
          paymentMethods: existingUser.storeInfo?.paymentMethods,
          settings: existingUser.storeInfo?.settings,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt
        }
      };
      
      console.log('✅ DEMO MODE: Store updated successfully:', responseData.storeId);
      return NextResponse.json(responseData, { status: 200 });
    }
    
    // ✅ DEMO MODE: Create new store (or update existing user to store type)
    const storeId = generateStoreId();
    
    const storeData = {
      privyId: user.privyId,
      email: user.email,
      walletAddress: user.wallet?.address,
      userType: 'store',
      storeInfo: {
        storeId,
        storeName: body.storeName,
        storeDescription: body.storeDescription,
        storeCategory: body.storeCategory,
        businessType: body.businessType,
        taxId: body.taxId,
        businessAddress: body.businessAddress,
        businessHours: body.businessHours,
        paymentMethods: body.paymentMethods || {
          pyusd: true,
          paypal: true,
          venmo: true,
          email: true
        },
        settings: body.settings || {
          autoAcceptOrders: false,
          requireSignature: false,
          allowPickup: true,
          allowDelivery: false
        }
      }
    };
    
    let savedUser;
    if (existingUser) {
      // Update existing user to store type
      console.log('🔄 DEMO MODE: Converting existing user to store');
      Object.assign(existingUser, storeData);
      savedUser = await existingUser.save();
    } else {
      // Create new user as store
      console.log('➕ DEMO MODE: Creating new store user');
      savedUser = new UserModel(storeData);
      await savedUser.save();
    }
    
    const responseData = {
      success: true,
      message: "Store created successfully (demo mode)",
      storeId: savedUser.storeInfo.storeId,
      store: {
        id: savedUser._id,
        privyId: savedUser.privyId,
        storeName: savedUser.storeInfo.storeName,
        storeCategory: savedUser.storeInfo.storeCategory,
        businessType: savedUser.storeInfo.businessType,
        paymentMethods: savedUser.storeInfo.paymentMethods,
        settings: savedUser.storeInfo.settings,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      }
    };

    console.log('✅ DEMO MODE: Store created successfully:', responseData.storeId);
    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('💥 DEMO MODE: Store creation error:', error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to create store account",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}