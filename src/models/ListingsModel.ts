import mongoose from 'mongoose';

export interface IListing extends mongoose.Document {
  sellerId: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  paymentMethods: {
    pyusd: boolean;
    paypal: boolean;
    venmo: boolean;
    email: boolean;
  };
  listingId: string;
  paymentUrl: string;
  qrCodeData: string;
  isActive: boolean;
  isVisible: boolean;
  views: number;
  inquiries: number;
  sales: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new mongoose.Schema({
  sellerId: { 
    type: String, 
    required: true,
    index: true // For faster queries by seller
  },
  userId: { 
    type: String, 
    required: true,
    index: true // For faster queries by user
  },
  
  // Product info
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  price: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Books',
      'Sports',
      'Health & Beauty',
      'Toys & Games',
      'Automotive',
      'Art & Crafts',
      'Other'
    ]
  },
  images: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: 'Invalid image URL format'
    }
  }],
  
  // Payment methods
  paymentMethods: {
    pyusd: { type: Boolean, default: true },
    paypal: { type: Boolean, default: true },
    venmo: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  
  // Generated identifiers
  listingId: { 
    type: String, 
    unique: true,
    required: true,
    index: true
  },
  paymentUrl: { 
    type: String, 
    required: true 
  },
  qrCodeData: { 
    type: String, 
    required: true 
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  isVisible: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Stats (for analytics)
  views: { 
    type: Number, 
    default: 0,
    min: 0
  },
  inquiries: { 
    type: Number, 
    default: 0,
    min: 0
  },
  sales: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
ListingSchema.index({ userId: 1, isActive: 1 });
ListingSchema.index({ sellerId: 1, isVisible: 1 });
ListingSchema.index({ category: 1, isActive: 1, isVisible: 1 });
ListingSchema.index({ createdAt: -1 });

// Virtual for formatted price
ListingSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for short description
ListingSchema.virtual('shortDescription').get(function() {
  return this.description.length > 100 
    ? this.description.substring(0, 100) + '...'
    : this.description;
});

// Static method to find active listings by user
ListingSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ 
    userId, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

// Static method to find visible listings by seller
ListingSchema.statics.findVisibleBySeller = function(sellerId: string) {
  return this.find({ 
    sellerId, 
    isActive: true, 
    isVisible: true 
  }).sort({ createdAt: -1 });
};

// Instance method to increment views
ListingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment inquiries
ListingSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

// Instance method to increment sales
ListingSchema.methods.incrementSales = function() {
  this.sales += 1;
  return this.save();
};

// Pre-save middleware to ensure listingId is set
ListingSchema.pre('save', function(next) {
  if (!this.listingId) {
    this.listingId = 'listing_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
  
  if (!this.paymentUrl) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://payboy.app';
    this.paymentUrl = `${baseUrl}/pay/listing/${this.listingId}`;
  }
  
  if (!this.qrCodeData) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://payboy.app';
    this.qrCodeData = `${baseUrl}/pay/listing/${this.listingId}?amount=${this.price}&item=${encodeURIComponent(this.title)}`;
  }
  
  next();
});

export const Listing = mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);
export default Listing;