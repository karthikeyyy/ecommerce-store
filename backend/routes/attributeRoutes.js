import express from "express";
import {
  createAttribute,
  getAllAttributes,
  getAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/attributeController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.post("/", createAttribute);
router.get("/", getAllAttributes);
router.get("/:id", getAttribute);
router.put("/:id", updateAttribute);
router.delete("/:id", deleteAttribute);

export default router;
