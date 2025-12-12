import Tag from "../models/Tag.js";

// Create Tag
export const createTag = async (req, res) => {
  try {
    const { name, color, isActive } = req.body;
    const slug = name.toLowerCase().replace(/ /g, "-");

    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = new Tag({
      name,
      slug,
      color: color || "#3b82f6",
      isActive: isActive !== undefined ? isActive : true,
    });

    await tag.save();

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Tags
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Tag
export const updateTag = async (req, res) => {
  try {
    const { name, color, isActive } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/ /g, "-");
    }
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Toggle Tag Status
export const toggleTagStatus = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    tag.isActive = !tag.isActive;
    await tag.save();

    res.status(200).json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Tag
export const deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;

    const tag = await Tag.findByIdAndDelete(tagId);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Bulk Delete Tags
export const bulkDeleteTags = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid tag IDs" });
    }

    const result = await Tag.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      deleted: result.deletedCount,
      message: `${result.deletedCount} tags deleted`,
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
      return res.status(400).json({ message: "Invalid tag IDs" });
    }

    const result = await Tag.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} tags updated`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
