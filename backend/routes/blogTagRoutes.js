import express from "express";
import {
  getBlogTags,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
  bulkDeleteBlogTags,
  bulkUpdateBlogTagStatus,
} from "../controllers/blogTagController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", getBlogTags);
router.post("/", createBlogTag);
router.put("/:id", updateBlogTag);
router.delete("/:id", deleteBlogTag);
router.post("/bulk-delete", bulkDeleteBlogTags);
router.patch("/bulk-status", bulkUpdateBlogTagStatus);

export default router;
