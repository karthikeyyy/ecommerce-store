import express from "express";
import {
  getAllInventory,
  getLowStockProducts,
  updateStock,
  bulkUpdateStock,
  getInventoryLogs,
} from "../controllers/inventoryController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all inventory (with filtering and pagination)
router.get("/", getAllInventory);

// Get low stock products
router.get("/low-stock", getLowStockProducts);

// Get inventory logs
router.get("/logs", getInventoryLogs);

// Update single product stock
router.put("/:id", updateStock);

// Bulk update stock
router.post("/bulk-update", bulkUpdateStock);

export default router;
