import express from "express";
const router = express.Router();
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  bulkUpdateStatus,
} from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Bulk operations
router.post("/bulk-delete", verifyToken, bulkDeleteCategories);
router.patch("/bulk-status", verifyToken, bulkUpdateStatus);

// Standard CRUD
router.post("/", verifyToken, createCategory);
router.get("/", verifyToken, getCategories);
router.put("/:id", verifyToken, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

export default router;
