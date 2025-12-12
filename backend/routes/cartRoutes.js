import express from "express";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cartItems.product");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, cart: user.cartItems });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add item to cart
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity = 1, selectedAttributes = {} } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Convert object to array for DB
    const attributesArray = Object.entries(selectedAttributes).map(([key, val]) => ({
        name: key,
        value: val
    }));

    // Check if product already in cart with SAME attributes
    const existingItem = user.cartItems.find((item) => {
        if (item.product.toString() !== productId) return false;
        
        // Compare attributes
        // If DB has no attributes but request does (or vice versa length mismatch)
        if ((item.selectedAttributes || []).length !== attributesArray.length) return false;

        // Check if every requested attribute exists in DB item
        return attributesArray.every(attr => 
            item.selectedAttributes.some(dbAttr => dbAttr.name === attr.name && dbAttr.value === attr.value)
        );
    });

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cartItems.push({ 
          product: productId, 
          quantity,
          selectedAttributes: attributesArray
      });
    }

    await user.save();
    await user.populate("cartItems.product");
    
    // Convert back to object for frontend consistency? 
    // Or let frontend handle array? CartContext expects object in some places but array in others? 
    // CartContext add logic expects response.cart. 
    // Response cart will have selectedAttributes as ARRAY.
    // I should update CartContext to handle Array from backend response!
    // But for now, let's just save correctly.

    res.json({ success: true, cart: user.cartItems });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update cart item quantity
router.put("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    if (quantity <= 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      cartItem.quantity = quantity;
    }

    await user.save();
    await user.populate("cartItems.product");

    res.json({ success: true, cart: user.cartItems });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Remove item from cart
router.delete("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();
    await user.populate("cartItems.product");

    res.json({ success: true, cart: user.cartItems });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Clear cart
router.delete("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cartItems = [];
    await user.save();

    res.json({ success: true, cart: [] });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Sync local cart with server cart (called on login)
router.post("/sync", auth, async (req, res) => {
  try {
    const { localCart } = req.body; // Array of { productId, quantity, selectedAttributes }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Merge local cart with server cart
    if (localCart && Array.isArray(localCart)) {
      localCart.forEach((localItem) => {
        // Convert local attributes (object) to array
        const localAttrsArray = Object.entries(localItem.selectedAttributes || {}).map(([key, val]) => ({
            name: key,
            value: val
        }));

        const existingItem = user.cartItems.find((item) => {
            if (item.product.toString() !== localItem.productId) return false;
            
            if ((item.selectedAttributes || []).length !== localAttrsArray.length) return false;

            return localAttrsArray.every(attr => 
                item.selectedAttributes.some(dbAttr => dbAttr.name === attr.name && dbAttr.value === attr.value)
            );
        });

        if (existingItem) {
          // Use max quantity instead of adding to prevent duplication on refresh
          existingItem.quantity = Math.max(existingItem.quantity, localItem.quantity);
        } else {
          // Add new item
          user.cartItems.push({
            product: localItem.productId,
            quantity: localItem.quantity,
            selectedAttributes: localAttrsArray
          });
        }
      });
    }

    await user.save();
    await user.populate("cartItems.product");

    res.json({ success: true, cart: user.cartItems });
  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
