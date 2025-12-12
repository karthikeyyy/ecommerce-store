import Product from "../models/Product.js";
import Order from "../models/orderModel.js";

// Get related products (same category/tags)
export const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    const product = await Product.findById(productId).populate("category tags");
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Find products with same categories or tags
    const related = await Product.find({
      _id: { $ne: productId },
      status: "Published",
      $or: [
        { category: { $in: product.category } },
        { tags: { $in: product.tags } },
      ],
    })
      .limit(parseInt(limit))
      .select("name price salePrice images slug");

    res.json({ success: true, data: related });
  } catch (error) {
    console.error("Get related products error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch related products" });
  }
};

// Get frequently bought together
export const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;

    // Find orders containing this product
    const orders = await Order.find({
      "items.product": productId,
      status: { $ne: "cancelled" },
    }).populate("items.product");

    // Track product co-occurrence
    const productCounts = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const id = item.product?._id?.toString();
        if (id && id !== productId) {
          productCounts[id] = (productCounts[id] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top products
    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([id]) => id);

    const products = await Product.find({ _id: { $in: sortedProducts } })
      .select("name price salePrice images slug");

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Get frequently bought error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
  }
};

// Get personalized recommendations for user
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { limit = 10 } = req.query;

    if (!userId) {
      // Return popular products for non-logged-in users
      const popular = await Product.find({ status: "Published" })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select("name price salePrice images slug");

      return res.json({ success: true, data: popular });
    }

    // Get user's purchase history
    const userOrders = await Order.find({ user: userId })
      .populate("items.product");

    // Extract categories and tags from purchased products
    const userCategories = new Set();
    const userTags = new Set();

    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          item.product.category?.forEach(cat => userCategories.add(cat.toString()));
          item.product.tags?.forEach(tag => userTags.add(tag.toString()));
        }
      });
    });

    // Find products matching user preferences
    const recommendations = await Product.find({
      status: "Published",
      $or: [
        { category: { $in: Array.from(userCategories) } },
        { tags: { $in: Array.from(userTags) } },
      ],
    })
      .limit(parseInt(limit))
      .select("name price salePrice images slug");

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
  }
};
