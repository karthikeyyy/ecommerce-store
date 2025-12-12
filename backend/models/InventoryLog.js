import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      type: String,
      enum: ["manual_adjustment", "sale", "return", "restock", "damage", "loss"],
      required: true,
    },

    quantityChange: {
      type: Number,
      required: true, // Positive for additions, negative for reductions
    },

    previousStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster queries
inventoryLogSchema.index({ product: 1, createdAt: -1 });
inventoryLogSchema.index({ type: 1 });

export default mongoose.model("InventoryLog", inventoryLogSchema);
