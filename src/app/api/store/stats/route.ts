import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { StoreModel } from "@/models/StoreModel";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    console.log('📈 Store Stats API: Fetching analytics...');
    
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

    console.log('✅ Store Stats API: Token verified for user:', decoded.userId);

    // Connect to database
    await connectToMongoDB();

    // Find the store
    const store = await StoreModel.findOne({ userId: decoded.userId });
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    console.log('✅ Store Stats API: Store found:', store.storeName);

    // Calculate time periods
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday.getTime() - (startOfToday.getDay() * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const storeCreated = store.createdAt;

    // Calculate store age in days
    const storeAgeDays = Math.floor((now.getTime() - storeCreated.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate average transaction value
    const averageTransaction = store.totalTransactions > 0 
      ? (store.totalEarnings / store.totalTransactions)
      : 0;

    // Basic stats from store model
    const stats = {
      // Overview
      totalEarnings: store.totalEarnings,
      totalTransactions: store.totalTransactions,
      averageTransaction: parseFloat(averageTransaction.toFixed(2)),
      
      // Store info
      storeName: store.storeName,
      ensName: store.ensName,
      storeType: store.storeType,
      category: store.category,
      isVerified: store.isVerified,
      isActive: store.isActive,
      
      // Time-based metrics
      storeAge: {
        days: storeAgeDays,
        weeks: Math.floor(storeAgeDays / 7),
        months: Math.floor(storeAgeDays / 30)
      },
      
      // Payment info
      lastPayment: store.lastPayment,
      daysSinceLastPayment: store.lastPayment 
        ? Math.floor((now.getTime() - store.lastPayment.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      
      // QR Code settings
      qrCodeSize: store.qrCodeSize,
      printingEnabled: store.printingEnabled,
      
      // Growth indicators (placeholders for now - can be enhanced with transaction data later)
      growth: {
        thisWeek: {
          transactions: 0, // TODO: Calculate from actual transaction records
          earnings: 0
        },
        thisMonth: {
          transactions: 0, // TODO: Calculate from actual transaction records
          earnings: 0
        },
        trend: 'stable' // TODO: Calculate growth trend
      },
      
      // Performance metrics
      performance: {
        earningsGoal: 1000, // TODO: Make this configurable per store
        goalProgress: Math.min(100, (store.totalEarnings / 1000) * 100),
        transactionGoal: 50, // TODO: Make this configurable per store
        transactionProgress: Math.min(100, (store.totalTransactions / 50) * 100)
      },
      
      // Status indicators
      status: {
        hasENS: !!store.ensName,
        hasDescription: !!store.description,
        hasWebsite: !!store.website,
        hasPhone: !!store.storePhone,
        profileCompletion: calculateProfileCompletion(store)
      }
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('💥 Store Stats API: Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch store statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(store: any): number {
  const fields = [
    store.storeName,        // Required, should always be present
    store.storeAddress,     // Required, should always be present
    store.description,      // Optional
    store.website,          // Optional
    store.storePhone,       // Optional
    store.storeEmail,       // Optional
    store.ensName          // Optional
  ];

  const completedFields = fields.filter(field => field && field.trim() !== '').length;
  return Math.round((completedFields / fields.length) * 100);
}