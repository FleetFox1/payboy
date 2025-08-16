// --- Dev Notes ---
// This route handles Privy user sync operations. It's called when user data needs to be updated
// or when the frontend needs to sync the user's latest information from Privy.
// This is useful for updating email, wallet addresses, or other profile changes.

import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
// import { getDb } from "@/lib/db";

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function POST(req: NextRequest) {
  try {
    // Parse user ID and access token from request
    const { userId, accessToken } = await req.json();
    
    if (!userId || !accessToken) {
      return NextResponse.json(
        { error: "Missing userId or accessToken" }, 
        { status: 400 }
      );
    }

    // Verify the access token first
    const authClaims = await privy.verifyAuthToken(accessToken);
    
    if (!authClaims || authClaims.userId !== userId) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
    }

    // Fetch full user data from Privy API
    const fullUser = await privy.getUser(userId);
    
    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract relevant user data
    const { id, email, linkedAccounts } = fullUser;
    const walletAccount = linkedAccounts?.find(account => account.type === 'wallet');
    const walletAddress = walletAccount?.address || null;

    // TODO: Update user in database
    // const db = await getDb();
    // await db.query(
    //   `UPDATE users SET 
    //      email = $1,
    //      wallet_address = $2,
    //      updated_at = NOW()
    //    WHERE privy_id = $3`,
    //   [email?.address || null, walletAddress, id]
    // );

    // Return updated user data
    return NextResponse.json({
      user: {
        privyId: id,
        email: email?.address || null,
        walletAddress,
        syncedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: "Sync failed" }, 
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current user sync status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // TODO: Fetch user from database
    // const db = await getDb();
    // const user = await db.query(
    //   'SELECT * FROM users WHERE privy_id = $1',
    //   [userId]
    // );

    // For now, return mock sync status
    return NextResponse.json({
      syncStatus: {
        userId,
        lastSyncAt: new Date().toISOString(),
        status: 'synced'
      }
    });

  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { error: "Failed to get sync status" }, 
      { status: 500 }
    );
  }
}
