import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { connectToMongoDB } from "@/lib/db";
import mongoose from 'mongoose';

// User schema for MongoDB
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  privyId: String,
  walletAddress: String,
  displayName: String,
  userType: { type: String, enum: ['buyer', 'seller', 'merchant'], default: 'buyer' },
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      
      // Get user from MongoDB using JWT user ID
      const dbUser = await UserModel.findById(user.userId);

      if (!dbUser) {
        return new Response(JSON.stringify({ error: "User not found" }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        user: {
          id: dbUser._id,
          email: dbUser.email,
          displayName: dbUser.displayName,
          walletAddress: dbUser.walletAddress,
          userType: dbUser.userType,
          isVerified: dbUser.isVerified,
          emailVerified: dbUser.emailVerified,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Me endpoint error:', error);
      return new Response(JSON.stringify({ error: "Failed to get user info" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      await connectToMongoDB();
      
      // Parse update data
      const { displayName, userType } = await req.json();

      // Update user in MongoDB
      const updatedUser = await UserModel.findByIdAndUpdate(
        user.userId,
        { 
          displayName,
          userType,
          updatedAt: new Date()
        },
        { new: true }
      );

      return new Response(JSON.stringify({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      return new Response(JSON.stringify({ error: "Failed to update profile" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}