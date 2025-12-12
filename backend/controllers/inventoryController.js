import Product from "../models/Product.js";
import InventoryLog from "../models/InventoryLog.js";

export const getAllInventory = async (req, res) => {
  try {
    const { 
      search, 
      stockStatus, 
      category, 
      lowStock,
      page = 1,
      limit = 50 
    } = req.query;

    const query = {};

    // Search by name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by stock status
    if (stockStatus) {
      query.stockStatus = stockStatus;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter low stock items
    if (lowStock === "true") {
      query.stock = { $lte: 20 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .select("name sku stock stockStatus price category quantity trackInventory")
        .populate("category", "name")
        .sort({ stock: 1 }) // Show lowest stock first
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch inventory" });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $lte: 20 },
      stockStatus: { $ne: "Out of Stock" },
    })
      .select("name sku stock stockStatus quantity")
      .populate("category", "name")
      .sort({ stock: 1 })
      .limit(100);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get low stock error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch low stock products" });
  }
};

// Update single product stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, reason, notes } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!product.trackInventory) {
      return res.status(400).json({ success: false, message: "Inventory tracking not enabled for this product" });
    }

    const previousStock = product.stock;
    const quantityChange = stock - previousStock;

    // Update product stock
    // Update product stock and sync quantity
    product.stock = stock;
    product.quantity = stock; // Sync legacy field
    await product.save();

    // Log the change
    await InventoryLog.create({
      product: product._id,
      type: "manual_adjustment",
      quantityChange,
      previousStock,
      newStock: stock,
      reason: reason || "Manual adjustment",
      notes: notes || "",
      performedBy: req.user?._id,
    });

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ success: false, message: "Failed to update stock" });
  }
};

// Bulk update stock
export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, stock, reason, notes }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid updates data" });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, stock, reason, notes } = update;

        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: "Product not found" });
          continue;
        }

        if (!product.trackInventory) {
          errors.push({ productId, error: "Inventory tracking not enabled" });
          continue;
        }

        const previousStock = product.stock;
        const quantityChange = stock - previousStock;

        product.stock = stock;
        product.quantity = stock; // Sync legacy field
        await product.save();

        await InventoryLog.create({
          product: product._id,
          type: "manual_adjustment",
          quantityChange,
          previousStock,
          newStock: stock,
          reason: reason || "Bulk adjustment",
          notes: notes || "",
          performedBy: req.user?._id,
        });

        results.push({ productId, success: true });
      } catch (err) {
        errors.push({ productId: update.productId, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.length} products`,
      results,
      errors,
    });
  } catch (error) {
    console.error("Bulk update stock error:", error);
    res.status(500).json({ success: false, message: "Failed to bulk update stock" });
  }
};

// Get inventory logs
export const getInventoryLogs = async (req, res) => {
  try {
    const { productId, type, page = 1, limit = 50 } = req.query;

    const query = {};
    if (productId) query.product = productId;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      InventoryLog.find(query)
        .populate("product", "name sku")
        .populate("performedBy", "name email")
        .populate("relatedOrder", "orderNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InventoryLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get inventory logs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch inventory logs" });
  }
};

// Reserve stock for order
export const reserveStock = async (productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.trackInventory) {
      const availableStock = product.stock - product.reservedStock;
      
      if (availableStock < quantity && !product.allowBackorder) {
        throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
      }

      product.reservedStock += quantity;
      await product.save();
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Release reserved stock
export const releaseStock = async (productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.trackInventory) {
      product.reservedStock = Math.max(0, product.reservedStock - quantity);
      await product.save();
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Confirm sale - reduce actual stock
export const confirmSale = async (productId, quantity, orderId) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.trackInventory) {
      const previousStock = product.stock;
      
      // Reduce stock and reserved stock
      product.stock = Math.max(0, product.stock - quantity);
      product.reservedStock = Math.max(0, product.reservedStock - quantity);
      await product.save();

      // Log the sale
      await InventoryLog.create({
        product: product._id,
        type: "sale",
        quantityChange: -quantity,
        previousStock,
        newStock: product.stock,
        reason: "Product sold",
        relatedOrder: orderId,
      });
    }

    return true;
  } catch (error) {
    throw error;
  }
};
