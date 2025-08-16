// --- Dev Notes ---
// This route handles Privy authentication. It expects a Privy JWT in the request body or headers.
// 1. Parse and validate the Privy JWT using @privy-io/server-auth.
// 2. Extract user info (email, wallet address, etc) from the JWT payload.
// 3. Upsert user in the database and create/update session.
// 4. Return session info (user, wallet address, etc) to the frontend.

import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
// import { getDb } from "@/lib/db";
import crypto from "crypto";

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

// Utility function to generate session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    // Parse JWT from body or headers
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: "Missing Privy access token" }, { status: 400 });
    }

    // Validate JWT and get user data from Privy
    const authClaims = await privy.verifyAuthToken(accessToken);
    
    if (!authClaims) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
    }

    // Extract user info from Privy auth claims
    const privyUserId = authClaims.userId;
    
    // For now, use mock data until we can fetch full user data
    // In a real implementation, you'd fetch full user data from Privy API
    const mockUser = {
      id: 1,
      privyId: privyUserId,
      email: null, // Will be populated from full user data
      walletAddress: null, // Will be populated from full user data
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Implement database operations once db.ts is ready
    // Upsert user in database
    // const db = await getDb();
    // const dbUser = await db.query(
    //   `INSERT INTO users (privy_id, email, wallet_address, created_at, updated_at)
    //    VALUES ($1, $2, $3, NOW(), NOW())
    //    ON CONFLICT (privy_id)
    //    DO UPDATE SET 
    //      email = EXCLUDED.email,
    //      wallet_address = EXCLUDED.wallet_address,
    //      updated_at = NOW()
    //    RETURNING *`,
    //   [privyUserId, null, null]
    // );

    // Create session token
    const sessionToken = generateSessionToken();
    
    // TODO: Store session in database
    // await db.query(
    //   `INSERT INTO user_sessions (user_id, session_token, privy_token, expires_at, created_at)
    //    VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', NOW())
    //    ON CONFLICT (user_id)
    //    DO UPDATE SET 
    //      session_token = EXCLUDED.session_token,
    //      privy_token = EXCLUDED.privy_token,
    //      expires_at = EXCLUDED.expires_at,
    //      created_at = NOW()`,
    //   [mockUser.id, sessionToken, accessToken]
    // );

    // Return session info
    return NextResponse.json({
      user: mockUser,
      session: { 
        token: sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: "Authentication failed" }, 
      { status: 500 }
    );
  }
}
