import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    sku: {
      type: String,
      unique: true,
      sparse: true,
      default: "",
    },

    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },

    quantity: { type: Number, default: 0 },

    brand: { type: String, default: "" },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },

    discount: { type: Number, default: 0 },

    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    
    attributes: [
      {
        attribute: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute" },
        name: String,
        values: [String],
      }
    ],

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },

    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Low Stock"],
      default: "In Stock",
    },

    // Enhanced Inventory Management Fields
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },



    trackInventory: {
      type: Boolean,
      default: true,
    },

    allowBackorder: {
      type: Boolean,
      default: false,
    },



    images: { type: [String], default: [] },
    
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Auto-update stockStatus based on stock level
productSchema.pre("save", function (next) {
  if (this.trackInventory) {
    if (this.stock <= 0) {
      this.stockStatus = "Out of Stock";
    } else if (this.stock <= 20) {
      this.stockStatus = "Low Stock";
    } else {
      this.stockStatus = "In Stock";
    }
  }
  next();
});

productSchema.pre("save", function (next) {
  if (!this.isModified("name") && !this.isNew) return next();

  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  next();
});

export default mongoose.model("Product", productSchema);
