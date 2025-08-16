import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { connectToMongoDB } from "@/lib/db";
import { createJWT } from "@/lib/auth";
import mongoose from 'mongoose';

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

// Updated User schema with proper types
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  privyId: String,
  walletAddress: String,
  displayName: String,
  userType: { type: String, enum: ['buyer', 'seller', 'merchant'], default: 'buyer' },
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

// Type definitions for Privy data
interface PrivyLinkedAccount {
  type: string;
  address?: string;
  wallet?: { address?: string };
  [key: string]: any; // For other properties we might not know about
}

interface PrivyUser {
  id: string;
  email?: { address?: string };
  wallet?: { address?: string };
  linkedAccounts?: PrivyLinkedAccount[];
}

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    
    console.log('🔍 Auth API: Starting authentication process...');
    
    const { accessToken } = await req.json();
    if (!accessToken) {
      console.error('❌ Auth API: Missing access token');
      return NextResponse.json({ error: "Missing Privy access token" }, { status: 400 });
    }

    console.log('🎟️ Auth API: Access token received, length:', accessToken.length);

    // Validate JWT and get user data from Privy
    console.log('🔐 Auth API: Verifying access token with Privy...');
    const authClaims = await privy.verifyAuthToken(accessToken);
    
    if (!authClaims) {
      console.error('❌ Auth API: Invalid access token');
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
    }

    console.log('✅ Auth API: Token verified, user ID:', authClaims.userId);

    // Get full user data from Privy
    console.log('👤 Auth API: Fetching user data from Privy...');
    const privyUser = await privy.getUser(authClaims.userId) as PrivyUser;
    
    if (!privyUser) {
      console.error('❌ Auth API: User not found in Privy');
      return NextResponse.json({ error: "User not found in Privy" }, { status: 404 });
    }

    console.log('🔍 Auth API: Full Privy user data:', JSON.stringify(privyUser, null, 2));

    // Extract user info from Privy user data
    const email = privyUser.email?.address || `${privyUser.id}@privy.payboy.app`;
    
    // Extract wallet address with proper typing
    let walletAddress: string | null = null;
    let isEmbeddedWallet = false;
    let accountType: 'email' | 'wallet' = 'email';

    // Check for external wallet first
    if (privyUser.wallet?.address) {
      walletAddress = privyUser.wallet.address;
      accountType = 'wallet';
      isEmbeddedWallet = false;
      console.log('💰 Auth API: Found external wallet:', walletAddress);
    } 
    // Check for embedded wallet in linked accounts
    else if (privyUser.linkedAccounts && Array.isArray(privyUser.linkedAccounts)) {
      console.log('🔗 Auth API: Checking linked accounts for embedded wallet...');
      console.log('🔗 Auth API: Number of linked accounts:', privyUser.linkedAccounts.length);
      
      for (const account of privyUser.linkedAccounts) {
        console.log('🔗 Auth API: Account type:', account.type);
        if (account.type === 'wallet') {
          // Try different possible properties for wallet address
          if (account.address) {
            walletAddress = account.address;
          } else if (account.wallet?.address) {
            walletAddress = account.wallet.address;
          }
          
          if (walletAddress) {
            isEmbeddedWallet = true;
            accountType = 'email';
            console.log('🏦 Auth API: Found embedded wallet:', walletAddress);
            break;
          }
        }
      }
    }
    
    console.log('📍 Auth API: Final wallet info:');
    console.log('📍 Auth API: - Address:', walletAddress);
    console.log('📍 Auth API: - Is embedded:', isEmbeddedWallet);
    console.log('📍 Auth API: - Account type:', accountType);
    
    const displayName = privyUser.email?.address?.split('@')[0] || `User-${privyUser.id.slice(-4)}`;

    // Find or create user in your database
    console.log('🔍 Auth API: Looking for existing user...');
    let user = await UserModel.findOne({
      $or: [
        { privyId: privyUser.id },
        { email: email }
      ]
    });

    if (!user) {
      console.log('👤 Auth API: Creating new user...');
      
      // Initialize payout methods with proper typing
      const initialPayoutMethods: any[] = [];
      if (walletAddress) {
        initialPayoutMethods.push({
          type: 'crypto',
          address: walletAddress,
          label: 'Primary Wallet',
          isDefault: true,
          isVerified: false,
          metadata: {
            chainId: 42161, // Arbitrum One by default
            tokenSymbol: 'PYUSD'
          }
        });
      }
      
      // Create new user
      user = new UserModel({
        privyId: privyUser.id,
        email: email,
        walletAddress: walletAddress,
        displayName: displayName,
        userType: 'buyer',
        isVerified: false,
        emailVerified: !!privyUser.email?.address,
        
        // Privy-specific fields
        privyAccountType: accountType,
        embeddedWallet: isEmbeddedWallet,
        onboardingCompleted: false,
        
        // Initialize payout methods
        payoutMethods: initialPayoutMethods,
        
        // Initialize balance
        balance: {
          available: 0,
          pending: 0,
          total: 0,
          currency: 'USD',
          lastUpdated: new Date()
        },
        
        lastLogin: new Date()
      });
      
      await user.save();
      console.log('✅ Auth API: Created new user with wallet:', walletAddress);
    } else {
      console.log('🔄 Auth API: Updating existing user...');
      let updated = false;
      
      // Update wallet address if we found one and user doesn't have one
      if (walletAddress && !user.walletAddress) {
        user.walletAddress = walletAddress;
        updated = true;
        console.log('💰 Auth API: Updated user wallet address:', walletAddress);
        
        // Add wallet to payout methods if not already there
        if (!user.payoutMethods) {
          user.payoutMethods = [];
        }
        
        const hasWalletPayout = user.payoutMethods.some((method: any) => 
          method.type === 'crypto' && method.address === walletAddress
        );
        
        if (!hasWalletPayout) {
          user.payoutMethods.push({
            type: 'crypto',
            address: walletAddress,
            label: 'Primary Wallet',
            isDefault: user.payoutMethods.length === 0,
            isVerified: false,
            metadata: {
              chainId: 42161,
              tokenSymbol: 'PYUSD'
            }
          });
          console.log('💳 Auth API: Added wallet to payout methods');
        }
      }
      
      // Update other fields if missing
      if (!user.privyId) {
        user.privyId = privyUser.id;
        updated = true;
      }
      
      if (privyUser.email?.address && !user.emailVerified) {
        user.emailVerified = true;
        updated = true;
      }
      
      if (!user.privyAccountType) {
        user.privyAccountType = accountType;
        updated = true;
      }
      
      if (user.embeddedWallet === undefined) {
        user.embeddedWallet = isEmbeddedWallet;
        updated = true;
      }
      
      if (!user.balance) {
        user.balance = { 
          available: 0, 
          pending: 0, 
          total: 0, 
          currency: 'USD',
          lastUpdated: new Date()
        };
        updated = true;
      }
      
      // Update last login
      user.lastLogin = new Date();
      updated = true;
      
      if (updated) {
        await user.save();
        console.log('🔄 Auth API: Updated existing user');
      }
    }

    // Generate JWT token
    console.log('🔑 Auth API: Generating JWT token...');
    const jwtToken = await createJWT({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType,
    });

    console.log('✅ Auth API: Authentication successful');
    console.log('📋 Auth API: User summary:');
    console.log('📋 Auth API: - ID:', user._id);
    console.log('📋 Auth API: - Email:', user.email);
    console.log('📋 Auth API: - Wallet:', user.walletAddress);
    console.log('📋 Auth API: - Type:', user.userType);

    // Return user data and JWT token
    return NextResponse.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        privyId: user.privyId,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        
        // Include Privy fields
        privyAccountType: user.privyAccountType,
        embeddedWallet: user.embeddedWallet,
        onboardingCompleted: user.onboardingCompleted,
        
        // Include payout info
        hasPayoutMethods: user.payoutMethods && user.payoutMethods.length > 0,
        balance: user.balance,
        lastLogin: user.lastLogin,
      },
      session: { 
        token: jwtToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

  } catch (error) {
    console.error('💥 Auth API: Authentication error:', error);
    return NextResponse.json(
      { error: "Authentication failed", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}