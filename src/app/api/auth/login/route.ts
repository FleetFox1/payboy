import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { verifyPassword, createJWT, isValidEmail } from "@/lib/auth";
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

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create JWT token
    const token = await createJWT({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType
    });

    // Update last login
    await UserModel.findByIdAndUpdate(user._id, { 
      lastLogin: new Date() 
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Login failed" }, 
      { status: 500 }
    );
  }
}