import express from "express";
import {
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  bulkDeleteBlogCategories,
  bulkUpdateBlogCategoryStatus,
} from "../controllers/blogCategoryController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", getBlogCategories);
router.post("/", createBlogCategory);
router.put("/:id", updateBlogCategory);
router.delete("/:id", deleteBlogCategory);
router.post("/bulk-delete", bulkDeleteBlogCategories);
router.patch("/bulk-status", bulkUpdateBlogCategoryStatus);

export default router;
