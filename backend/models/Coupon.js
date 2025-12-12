import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    minPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: null, // null means no limit
    },

    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    validFrom: {
      type: Date,
      default: Date.now,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }],

    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }],

    isActive: {
      type: Boolean,
      default: true,
    },

    // User restrictions
    limitToFirstPurchase: {
      type: Boolean,
      default: false,
    },

    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],

    usedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      usedAt: {
        type: Date,
        default: Date.now,
      },
      orderAmount: Number,
      discountAmount: Number,
    }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Virtual for checking if coupon is expired
couponSchema.virtual("isExpired").get(function() {
  return new Date() > this.validUntil;
});

// Virtual for checking if usage limit reached
couponSchema.virtual("isUsageLimitReached").get(function() {
  return this.usageLimit && this.usedCount >= this.usageLimit;
});

// Method to validate coupon applicability
couponSchema.methods.validateCoupon = function(userId, cartTotal, productIds, categoryIds) {
  const errors = [];

  // Check if active
  if (!this.isActive) {
    errors.push("Coupon is not active");
  }

  // Check expiry
  if (this.isExpired) {
    errors.push("Coupon has expired");
  }

  // Check usage limit
  if (this.isUsageLimitReached) {
    errors.push("Coupon usage limit reached");
  }

  // Check minimum purchase
  if (cartTotal < this.minPurchase) {
    errors.push(`Minimum purchase amount is $${this.minPurchase}`);
  }

  // Check if user already used (if single-use per user)
  if (this.usedBy.some(usage => usage.user.toString() === userId.toString())) {
    errors.push("You have already used this coupon");
  }

  // Check product applicability
  if (this.applicableProducts.length > 0) {
    const hasApplicableProduct = productIds.some(pid => 
      this.applicableProducts.includes(pid)
    );
    if (!hasApplicableProduct) {
      errors.push("Coupon not applicable to any products in your cart");
    }
  }

  // Check category applicability
  if (this.applicableCategories.length > 0) {
    const hasApplicableCategory = categoryIds.some(cid => 
      this.applicableCategories.includes(cid)
    );
    if (!hasApplicableCategory) {
      errors.push("Coupon not applicable to product categories in your cart");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(cartTotal) {
  let discount = 0;

  if (this.type === "percentage") {
    discount = (cartTotal * this.value) / 100;
    
    // Apply max discount if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.type === "fixed") {
    discount = this.value;
  }

  // Discount cannot exceed cart total
  return Math.min(discount, cartTotal);
};

export default mongoose.model("Coupon", couponSchema);
