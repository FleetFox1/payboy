// --- Dev Notes ---
// This route handles the /me endpoint for getting current user information.
// It expects a session token in the Authorization header or a Privy access token.
// Returns the current user's profile data including wallet addresses and email.

import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { getDb } from "@/lib/db";

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    // Check if it's a Bearer token (session token) or Privy access token
    const token = authHeader.replace('Bearer ', '');
    
    // First, try to validate as Privy access token
    try {
      const authClaims = await privy.verifyAuthToken(token);
      
      if (authClaims) {
        // Valid Privy token - fetch user data
        const fullUser = await privy.getUser(authClaims.userId);
        
        if (!fullUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Extract user data
        const { id, email, linkedAccounts } = fullUser;
        const walletAccounts = linkedAccounts?.filter(account => account.type === 'wallet') || [];
        const walletAddresses = walletAccounts.map(account => 
          account.type === 'wallet' ? (account as any).address : null
        ).filter(Boolean);

        // TODO: Fetch additional user data from database
        // const db = await getDb();
        // const dbUser = await db.query(
        //   'SELECT * FROM users WHERE privy_id = $1',
        //   [id]
        // );

        return NextResponse.json({
          user: {
            privyId: id,
            email: email?.address || null,
            walletAddresses,
            linkedAccounts: linkedAccounts?.map(account => ({
              type: account.type,
              ...(account.type === 'wallet' && {
                address: (account as any).address,
                chainId: (account as any).chainId,
              }),
              ...(account.type === 'email' && {
                email: (account as any).address,
              }),
              ...(account.type === 'phone' && {
                phoneNumber: (account as any).phoneNumber,
              }),
            })) || [],
            // ...dbUser.rows[0] // Merge database user data
          },
        });
      }
    } catch (privyError) {
      // If Privy validation fails, try session token validation
      // TODO: Implement session token validation against database
      // const db = await getDb();
      // const session = await db.query(
      //   'SELECT * FROM user_sessions WHERE session_token = $1 AND expires_at > NOW()',
      //   [token]
      // );
      
      // For now, return unauthorized for invalid tokens
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { error: "Failed to get user info" }, 
      { status: 500 }
    );
  }
}

// PATCH endpoint to update user profile
export async function PATCH(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Validate token (similar to GET)
    const authClaims = await privy.verifyAuthToken(token);
    
    if (!authClaims) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse update data
    const { displayName, preferences } = await req.json();

    // TODO: Update user in database
    // const db = await getDb();
    // await db.query(
    //   `UPDATE users SET 
    //      display_name = $1,
    //      preferences = $2,
    //      updated_at = NOW()
    //    WHERE privy_id = $3`,
    //   [displayName, JSON.stringify(preferences), authClaims.userId]
    // );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: "Failed to update profile" }, 
      { status: 500 }
    );
  }
}
