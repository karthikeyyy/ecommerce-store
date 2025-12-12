import express from "express";
import {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// PUBLIC GET ROUTES
router.get("/", getProducts);
router.get("/:id", getProduct);

// PROTECTED ROUTES (add auth/permissions later)
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
