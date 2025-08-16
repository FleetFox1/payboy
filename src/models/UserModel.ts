export interface User {
  id: string;
  email: string;
  passwordHash?: string; // For email/password auth (optional if using Privy only)
  walletAddress?: string; // From Privy embedded wallet (renamed from address)
  
  // Profile
  displayName?: string;
  avatar?: string;
  ens?: string; // ENS name if they have one
  
  // Contact info
  phone?: string;
  
  // Platform settings
  userType: 'buyer' | 'seller' | 'merchant';
  isVerified: boolean;
  emailVerified: boolean;
  
  // Timestamps
  createdAt: Date; // renamed from created_at
  updatedAt: Date;
  lastLogin?: Date;
}

// Separate address interface for reusability
export interface Address {
  id?: string;
  userId: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  
  // Address fields
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password?: string; // Optional if using Privy only
  displayName?: string;
  userType: 'buyer' | 'seller' | 'merchant';
  phone?: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  avatar?: string;
  userType?: 'buyer' | 'seller' | 'merchant';
  phone?: string;
}

// Address management
export interface CreateAddressRequest {
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}