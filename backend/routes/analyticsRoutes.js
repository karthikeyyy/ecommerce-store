import express from "express";
import {
  getSalesAnalytics,
  getTopProducts,
  getCustomerAnalytics,
  getRevenueForecast,
  exportAnalytics,
} from "../controllers/analyticsController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(auth);

router.get("/sales", getSalesAnalytics);
router.get("/products/top", getTopProducts);
router.get("/customers", getCustomerAnalytics);
router.get("/forecast", getRevenueForecast);
router.get("/export", exportAnalytics);

export default router;
