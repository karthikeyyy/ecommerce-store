import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, parent, isActive } = req.body;
    const slug = name.toLowerCase().replace(/ /g, "-");

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name,
      slug,
      description,
      icon: icon || "",
      color: color || "#10b981",
      parent: parent || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "parent",
          as: "children",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
          childrenCount: { $size: "$children" },
          totalRevenue: {
            $sum: {
              $map: {
                input: "$products",
                as: "product",
                in: {
                  $multiply: [
                    "$$product.price",
                    { $ifNull: ["$$product.quantity", 0] },
                  ],
                },
              },
            },
          },
          avgPrice: { $avg: "$products.price" },
          inStockCount: {
            $size: {
              $filter: {
                input: "$products",
                as: "product",
                cond: { $eq: ["$$product.stockStatus", "In Stock"] },
              },
            },
          },
          outOfStockCount: {
            $size: {
              $filter: {
                input: "$products",
                as: "product",
                cond: { $eq: ["$$product.stockStatus", "Out of Stock"] },
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          description: 1,
          icon: 1,
          color: 1,
          parent: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          count: "$productCount",
          childrenCount: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          avgPrice: { $round: [{ $ifNull: ["$avgPrice", 0] }, 2] },
          inStockCount: 1,
          outOfStockCount: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, color, parent, isActive } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/ /g, "-");
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (parent !== undefined) updateData.parent = parent;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// DELETE CATEGORY — SAFE (ARRAY FIX APPLIED)
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Products use category array → must use $in
    const productCount = await Product.countDocuments({
      category: { $in: [categoryId] },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. This category is assigned to ${productCount} product(s).`,
      });
    }

    // Check children
    const childCount = await Category.countDocuments({ parent: categoryId });

    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. This category has ${childCount} subcategory(s).`,
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// BULK DELETE — SAFE (ARRAY FIX APPLIED)
export const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    let deleted = 0;
    const skipped = [];

    for (const id of ids) {
      const productCount = await Product.countDocuments({
        category: { $in: [id] },
      });

      const childCount = await Category.countDocuments({ parent: id });

      if (productCount > 0 || childCount > 0) {
        skipped.push({ id, productCount, childCount });
        continue;
      }

      const category = await Category.findByIdAndDelete(id);
      if (category) deleted++;
    }

    res.status(200).json({
      success: true,
      deleted,
      skipped,
      message: `${deleted} categories deleted, ${skipped.length} skipped`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Bulk Update Status
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, isActive } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    const result = await Category.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} categories updated`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
