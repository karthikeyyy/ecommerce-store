import express from "express";
const router = express.Router();
import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
  bulkDeleteTags,
  bulkUpdateStatus,
  toggleTagStatus,
} from "../controllers/tagController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Bulk operations
router.post("/bulk-delete", verifyToken, bulkDeleteTags);
router.patch("/bulk-status", verifyToken, bulkUpdateStatus);

// Standard CRUD
router.post("/", verifyToken, createTag);
router.get("/", verifyToken, getTags);
router.put("/:id", verifyToken, updateTag);
router.patch("/:id/status", verifyToken, toggleTagStatus);
router.delete("/:id", verifyToken, deleteTag);

export default router;
