import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

// User sessions schema for MongoDB
const UserSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionToken: { type: String, required: true, unique: true },
  privyToken: String,
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const UserSessionModel = mongoose.models.UserSession || mongoose.model('UserSession', UserSessionSchema);

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Remove session from database
    const deletedSession = await UserSessionModel.findOneAndDelete({ 
      sessionToken: token 
    });

    if (!deletedSession) {
      // Token not found in database, but still return success
      // (token might be expired or already deleted)
      return NextResponse.json({
        success: true,
        message: "Logged out successfully"
      });
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: "Logout failed" }, 
      { status: 500 }
    );
  }
}

// Optional: DELETE method for alternative logout endpoint
export async function DELETE(req: NextRequest) {
  return POST(req); // Reuse the same logic
}