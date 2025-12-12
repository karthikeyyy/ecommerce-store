import express from "express";
import {
  getRelatedProducts,
  getFrequentlyBoughtTogether,
  getPersonalizedRecommendations,
} from "../controllers/recommendationController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/related/:productId", getRelatedProducts);
router.get("/frequently-bought/:productId", getFrequentlyBoughtTogether);

// Protected routes
router.get("/personalized", auth, getPersonalizedRecommendations);

export default router;
