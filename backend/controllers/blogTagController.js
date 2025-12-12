import BlogTag from "../models/BlogTag.js";

const slugify = (value) => {
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const getBlogTags = async (req, res) => {
  try {
    const tags = await BlogTag.find().sort({ name: 1 });
    return res.status(200).json({ success: true, data: tags });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const createBlogTag = async (req, res) => {
  try {
    const { name, slug, color, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required",
      });
    }

    const finalSlug = slug || slugify(name);
    const existing = await BlogTag.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Tag with this name already exists",
      });
    }

    const tag = await BlogTag.create({
      name,
      slug: finalSlug,
      color: color || "#10b981",
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, data: tag });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateBlogTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, color, isActive } = req.body;

    const tag = await BlogTag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    if (slug && slug !== tag.slug) {
      const existing = await BlogTag.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Tag with this slug already exists",
        });
      }
      tag.slug = slug;
    } else if (name && name !== tag.name) {
      const newSlug = slugify(name);
      if (newSlug !== tag.slug) {
        const existing = await BlogTag.findOne({
          slug: newSlug,
          _id: { $ne: id },
        });
        if (!existing) {
          tag.slug = newSlug;
        }
      }
    }

    tag.name = name ?? tag.name;
    tag.color = color ?? tag.color;
    tag.isActive = isActive !== undefined ? isActive : tag.isActive;

    await tag.save();

    return res.status(200).json({ success: true, data: tag });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteBlogTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await BlogTag.findByIdAndDelete(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const bulkDeleteBlogTags = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    await BlogTag.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: "Tags deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const bulkUpdateBlogTagStatus = async (req, res) => {
  try {
    const { ids, isActive } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    await BlogTag.updateMany({ _id: { $in: ids } }, { $set: { isActive } });

    return res.status(200).json({
      success: true,
      message: "Tags updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
