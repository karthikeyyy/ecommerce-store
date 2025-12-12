import express from "express";
import Order from "../models/orderModel.js";
import Product from "../models/Product.js";
import { auth } from "../middleware/auth.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";
import User from "../models/User.js";

const router = express.Router();

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items in order" });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      totalAmount,
    });

    const user = await User.findById(req.user._id);

    // Update product stock
    for (const item of items) {
      if (item.product) {
        const product = await Product.findById(item.product);
        if (product) {
          // Decrement stock (primary) and quantity (legacy/fallback)
          if (product.stock > 0) {
              product.stock = Math.max(0, product.stock - item.quantity);
          }
          // Also update quantity if it exists, to keep in sync
          if (product.quantity > 0 || (product.quantity === 0 && product.stock === 0)) { 
             // If assume quantity mimics stock
             product.quantity = Math.max(0, (product.quantity || 0) - item.quantity);
          }
          
          await product.save();
        }
      }
    }
    
    // Populate order for email
    const populatedOrder = await Order.findById(order._id).populate("items.product");
    
    await sendOrderConfirmationEmail(populatedOrder, user);

    res.status(201).json({ order });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: err.message || "Failed to create order" });
  }
});

// Get logged-in user's orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Get my orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate("items.product", "name mainImage price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Admin: Get all orders
router.get("/admin/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name mainImage price")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Admin: Update order status
router.patch("/admin/orders/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.product", "name mainImage price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;
