import express from "express";
import {
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponAnalytics,
} from "../controllers/couponController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Public route for validation
router.post("/validate", validateCoupon);

// Protected admin routes
router.use(auth);

router.get("/", getAllCoupons);
router.get("/analytics", getCouponAnalytics);
router.get("/:id", getCoupon);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
