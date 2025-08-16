import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { hashPassword, createJWT, isValidEmail, isValidPassword } from "@/lib/auth";
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
    
    const { email, password, displayName, userType } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ 
        error: "Password does not meet requirements", 
        details: passwordValidation.errors 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser = new UserModel({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName || null,
      userType: userType || 'buyer',
      isVerified: false,
      emailVerified: false,
    });

    await newUser.save();

    // Create JWT token
    const token = await createJWT({
      userId: newUser._id.toString(),
      email: newUser.email,
      userType: newUser.userType
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        displayName: newUser.displayName,
        userType: newUser.userType,
        isVerified: newUser.isVerified,
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: "Account creation failed" }, 
      { status: 500 }
    );
  }
}