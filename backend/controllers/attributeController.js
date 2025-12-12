import Attribute from "../models/Attribute.js";

// @desc    Create a new attribute
// @route   POST /api/attributes
// @access  Private/Admin
export const createAttribute = async (req, res) => {
  try {
    const { name, values } = req.body;

    const attributeExists = await Attribute.findOne({ name });
    if (attributeExists) {
      return res.status(400).json({ message: "Attribute already exists" });
    }

    const attribute = await Attribute.create({
      name,
      values,
    });

    res.status(201).json(attribute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attributes
// @route   GET /api/attributes
// @access  Private/Admin
export const getAllAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find({});
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attribute by ID
// @route   GET /api/attributes/:id
// @access  Private/Admin
export const getAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    if (attribute) {
      res.json(attribute);
    } else {
      res.status(404).json({ message: "Attribute not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update attribute
// @route   PUT /api/attributes/:id
// @access  Private/Admin
export const updateAttribute = async (req, res) => {
  try {
    const { name, values } = req.body;
    const attribute = await Attribute.findById(req.params.id);

    if (attribute) {
      attribute.name = name || attribute.name;
      attribute.values = values || attribute.values;

      const updatedAttribute = await attribute.save();
      res.json(updatedAttribute);
    } else {
      res.status(404).json({ message: "Attribute not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attribute
// @route   DELETE /api/attributes/:id
// @access  Private/Admin
export const deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);

    if (attribute) {
      await attribute.deleteOne();
      res.json({ message: "Attribute removed" });
    } else {
      res.status(404).json({ message: "Attribute not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
