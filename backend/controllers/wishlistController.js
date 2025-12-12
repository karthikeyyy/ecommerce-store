import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId }).populate("products.product");

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log("AddToWishlist Req User:", req.user);
    const userId = req.user._id || req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // Check if product exists already
    const exists = wishlist.products.find((p) => p.product.toString() === productId);
    if (exists) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();
    
    // Populate for response
    await wishlist.populate("products.product");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate("products.product");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
