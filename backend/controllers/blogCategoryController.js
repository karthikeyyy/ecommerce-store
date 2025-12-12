import BlogCategory from "../models/BlogCategory.js";

const slugify = (value) => {
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const getBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ name: 1 });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const createBlogCategory = async (req, res) => {
  try {
    const { name, description, icon, color, parent, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = slugify(name);
    const existing = await BlogCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await BlogCategory.create({
      name,
      slug,
      description,
      icon,
      color,
      parent: parent || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, parent, isActive } = req.body;

    const category = await BlogCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name && name !== category.name) {
      const slug = slugify(name);
      const existing = await BlogCategory.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
      category.slug = slug;
    }

    category.name = name ?? category.name;
    category.description = description ?? category.description;
    category.icon = icon ?? category.icon;
    category.color = color ?? category.color;
    category.parent = parent !== undefined ? parent || null : category.parent;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    await category.save();

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const bulkDeleteBlogCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    await BlogCategory.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: "Categories deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const bulkUpdateBlogCategoryStatus = async (req, res) => {
  try {
    const { ids, isActive } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    await BlogCategory.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );

    return res.status(200).json({
      success: true,
      message: "Categories updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
