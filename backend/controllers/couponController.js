import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";

// Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    if (status === "active") {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    } else if (status === "expired") {
      query.validUntil = { $lt: new Date() };
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate("applicableProducts", "name")
        .populate("applicableCategories", "name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Coupon.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};

// Get single coupon
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("applicableProducts", "name")
      .populate("applicableCategories", "name");

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    console.error("Get coupon error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coupon" });
  }
};

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      createdBy: req.user?._id,
    };

    // Check if code already exists
    const existing = await Coupon.findOne({ code: couponData.code });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({ success: false, message: "Failed to create coupon" });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
      
      // Check if new code conflicts with existing
      const existing = await Coupon.findOne({ code: req.body.code, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Coupon code already exists" });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({ success: false, message: "Failed to update coupon" });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({ success: false, message: "Failed to delete coupon" });
  }
};

// Validate and apply coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal, productIds, categoryIds } = req.body;
    const userId = req.user?._id;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    // Validate coupon
    const validation = coupon.validateCoupon(userId, cartTotal, productIds || [], categoryIds || []);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal);

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        couponId: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalAmount: cartTotal - discount,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ success: false, message: "Failed to validate coupon" });
  }
};

// Apply coupon to order
export const applyCouponToOrder = async (couponId, userId, orderAmount) => {
  try {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const discount = coupon.calculateDiscount(orderAmount);

    // Update coupon usage
    coupon.usedCount += 1;
    coupon.usedBy.push({
      user: userId,
      usedAt: new Date(),
      orderAmount,
      discountAmount: discount,
    });

    await coupon.save();

    return discount;
  } catch (error) {
    throw error;
  }
};

// Get coupon analytics
export const getCouponAnalytics = async (req, res) => {
  try {
    const coupons = await Coupon.find({});

    const analytics = {
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.isActive && !c.isExpired).length,
      expiredCoupons: coupons.filter(c => c.isExpired).length,
      totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
      totalSavings: coupons.reduce((sum, c) => {
        const savings = c.usedBy.reduce((s, u) => s + u.discountAmount, 0);
        return sum + savings;
      }, 0),
      topCoupons: coupons
        .sort((a, b) => b.usedCount - a.usedCount)
        .slice(0, 10)
        .map(c => ({
          code: c.code,
          usedCount: c.usedCount,
          type: c.type,
          value: c.value,
        })),
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

export const listCoupons = getAllCoupons;
