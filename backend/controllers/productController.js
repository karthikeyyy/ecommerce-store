import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      price,
      costPrice,
      salePrice,
      quantity,
      brand,
      category,
      shortDescription,
      description,
      discount,
      tags,
      status,
      stockStatus,
      images,
      attributes,
    } = req.body;

    const product = await Product.create({
      name,
      sku,
      price,
      costPrice,
      salePrice,
      quantity,
      brand,
      category,
      shortDescription,
      description,
      discount,
      tags,
      status,
      stockStatus,
      images,
      attributes,
    });

    res.json({ success: true, product });

  } catch (error) {
    console.log("ADD PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    res.json({ success: true, product });

  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category').populate('tags');
    res.json({ success: true, product });

  } catch (error) {
    console.log("GET PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category').populate('tags');
    res.json({ success: true, products });

  } catch (error) {
    console.log("GET PRODUCTS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });

  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
